import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Security HTTP Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS restriction
const allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições enviadas. Aguarde um minuto e tente novamente." },
});

// Body parser setup
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chave GEMINI_API_KEY ausente nas variáveis de ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "estudos-eyshila-app",
        },
      },
    });
  }
  return aiClient;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.status === 429 && retries > 0) {
      console.warn(`Quota exceeded for Gemini API, retrying in ${delay}ms... (retries left: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Zod Input Schemas
const GenerateStudySchema = z.object({
  fileData: z.string().optional(),
  fileName: z.string().max(255).optional(),
  mimeType: z.enum(["application/pdf", "text/plain", "text/markdown"]).optional(),
  text: z.string().max(50000, "Texto excede o limite máximo de 50.000 caracteres.").optional(),
}).refine((data) => data.fileData || data.text, {
  message: "Envie um arquivo PDF/texto ou digite um conteúdo de estudo.",
});

const ChatStudySchema = z.object({
  message: z.string().min(1, "Mensagem vazia.").max(4000, "Mensagem muito longa."),
});

// API endpoints
app.post("/api/generate-study", aiLimiter, async (req, res) => {
  try {
    const validation = GenerateStudySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    const { fileData, mimeType, text } = validation.data;

    if (fileData) {
      const decodedSizeBytes = Buffer.byteLength(fileData, "base64");
      if (decodedSizeBytes > 15 * 1024 * 1024) {
        return res.status(400).json({ error: "O arquivo excede o tamanho máximo permitido (15MB)." });
      }
    }

    const ai = getGeminiClient();
    let contents: any[] = [];

    if (fileData) {
      contents = [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType || "application/pdf"
          }
        },
        "Gere um resumo de estudos completo, exatamente 5 questões de múltipla escolha com explicações, e exatamente 6 flashcards (perguntas/respostas curtas de active recall) baseados neste documento anexado."
      ];
    } else {
      contents = [
        `Por favor, gere um resumo de estudos completo, exatamente 5 questões de múltipla escolha com explicações, e exatamente 6 flashcards (perguntas/respostas curtas de active recall) baseados no seguinte texto:\n\n${text}`
      ];
    }

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: "Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em elaborar materiais e questões didáticas de alto nível para concurseiros e candidatos à residência em Enfermagem (ENARE). Escreva tudo em Português.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "answer", "explanation"]
              }
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            }
          },
          required: ["summary", "questions", "flashcards"]
        }
      }
    }));

    const responseText = response.text;
    if (!responseText) throw new Error("Gemini returned empty response.");
    res.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("[Internal Error] Gemini Generation:", error?.message || error);
    res.status(500).json({ error: "Falha ao gerar o material de estudos. Tente novamente em instantes." });
  }
});

app.post("/api/chat-study", aiLimiter, async (req, res) => {
  try {
    const validation = ChatStudySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    const { message } = validation.data;
    const ai = getGeminiClient();
    
    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: "Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em Enfermagem e SUS para o ENARE. Responda de forma didática, objetiva e em Português do Brasil.",
      }
    });

    const response = await retryWithBackoff(() => chat.sendMessage({ message }));
    res.json({ text: response.text });

  } catch (error: any) {
    console.error("[Internal Error] Gemini Chat:", error?.message || error);
    res.status(500).json({ error: "Falha ao processar mensagem da IA. Tente novamente." });
  }
});

export default app;
