import express from "express";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Security HTTP Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Vite injects scripts dynamically in dev
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

  // Rate Limiting for AI endpoints (protect against DDoS / quota abuse)
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // max 10 requests per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas requisições enviadas. Aguarde um minuto e tente novamente." },
  });

  // Body parser setup with 20MB limit for base64 file uploads (PDFs)
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

  // API endpoint to generate study summary and questions
  app.post("/api/generate-study", aiLimiter, async (req, res) => {
    try {
      const validation = GenerateStudySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { fileData, mimeType, text } = validation.data;

      // Validate base64 file size (max ~15MB decoded)
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
              summary: {
                type: Type.STRING,
                description: "Um resumo de fixação detalhado, bem estruturado e focado nas principais condutas, definições e conceitos do material. Use formatação Markdown (títulos, negritos, tópicos)."
              },
              questions: {
                type: Type.ARRAY,
                description: "Uma lista com exatamente 5 questões inéditas de múltipla escolha no padrão ENARE.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: "O enunciado da questão com um contexto clínico ou regulatório."
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Exatamente 4 opções, iniciando respectivamente por 'A) ', 'B) ', 'C) ', 'D) '."
                    },
                    answer: {
                      type: Type.STRING,
                      description: "A letra da alternativa correta ('A', 'B', 'C' ou 'D')."
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Uma explicação didática clara e aprofundada de por que essa alternativa é a correta e por que as outras estão incorretas."
                    }
                  },
                  required: ["question", "options", "answer", "explanation"]
                }
              },
              flashcards: {
                type: Type.ARRAY,
                description: "Uma lista com exatamente 6 flashcards de fixação (active recall).",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: {
                      type: Type.STRING,
                      description: "Uma pergunta ou conceito direto para desafiar a memória do aluno (Frente do cartão)."
                    },
                    back: {
                      type: Type.STRING,
                      description: "A resposta correta e sucinta ou explicação direta (Verso do cartão)."
                    }
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
      if (!responseText) {
        throw new Error("Gemini returned empty response.");
      }

      const parsedData = JSON.parse(responseText);
      res.json(parsedData);

    } catch (error: any) {
      console.error("[Internal Error] Gemini Generation:", error?.message || error);
      res.status(500).json({ error: "Falha ao gerar o material de estudos. Tente novamente em instantes." });
    }
  });

  // API endpoint for AI study chat/search
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
          systemInstruction: "Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em Enfermagem e SUS para o ENARE. Responda de forma didática, objetiva e em Português do Brasil. Se o usuário pedir para adicionar um assunto, explique o conceito e forneça um resumo estruturado.",
        }
      });

      const response = await retryWithBackoff(() => chat.sendMessage({ message }));
      res.json({ text: response.text });

    } catch (error: any) {
      console.error("[Internal Error] Gemini Chat:", error?.message || error);
      res.status(500).json({ error: "Falha ao processar mensagem da IA. Tente novamente." });
    }
  });

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production build from dist/");
  }

  app.listen(PORT, () => {
    console.log(`Express application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup crash:", err?.message || err);
});
