import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";

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

async function callOpenRouter(messages: any[], isJsonMode: boolean = false) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-nano-30b-a3b:free";

  if (!apiKey) {
    throw new Error("Chave OPENROUTER_API_KEY ausente nas variáveis de ambiente.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000", 
      "X-Title": "Você Aprovado - Estudos", 
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      response_format: isJsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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
    let extractedText = text || "";

    // Parse PDF if provided
    if (fileData) {
      const decodedSizeBytes = Buffer.byteLength(fileData, "base64");
      if (decodedSizeBytes > 15 * 1024 * 1024) {
        return res.status(400).json({ error: "O arquivo excede o tamanho máximo permitido (15MB)." });
      }

      if (mimeType === "application/pdf") {
        const buffer = Buffer.from(fileData, "base64");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } else {
        // Plain text base64
        extractedText = Buffer.from(fileData, "base64").toString("utf-8");
      }
    }

    const systemPrompt = `Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em elaborar materiais e questões didáticas de alto nível para concurseiros e candidatos à residência em Enfermagem (ENARE). Escreva tudo em Português do Brasil.
VOCÊ DEVE RESPONDER EXCLUSIVAMENTE NO FORMATO JSON ABAIXO. NÃO INCLUA NENHUM TEXTO ANTES OU DEPOIS DO JSON.
Formato exigido:
{
  "summary": "Um resumo de fixação detalhado em Markdown",
  "questions": [
    {
      "question": "O enunciado da questão",
      "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"],
      "answer": "A",
      "explanation": "Explicação didática"
    }
  ],
  "flashcards": [
    {
      "front": "Pergunta do cartão",
      "back": "Resposta do cartão"
    }
  ]
}
CERTIFIQUE-SE QUE EXISTAM EXATAMENTE 5 QUESTÕES E 6 FLASHCARDS.`;

    const userPrompt = `Baseado no seguinte texto, gere o resumo, questões e flashcards em formato JSON estrito:\n\n${extractedText}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const responseText = await callOpenRouter(messages, true);
    
    // Clean response just in case the model added markdown blocks
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("[Internal Error] OpenRouter Generation:", error?.message || error);
    res.status(500).json({ error: "Falha ao gerar o material de estudos via OpenRouter. Tente novamente em instantes." });
  }
});

app.post("/api/chat-study", aiLimiter, async (req, res) => {
  try {
    const validation = ChatStudySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    const { message } = validation.data;
    
    const messages = [
      { 
        role: "system", 
        content: "Você é o Mentor Inteligente do 'Você Aprovado', um assistente acadêmico especialista em Enfermagem e SUS para o ENARE. Responda de forma didática, objetiva e em Português do Brasil." 
      },
      { role: "user", content: message }
    ];

    const responseText = await callOpenRouter(messages, false);
    res.json({ text: responseText });

  } catch (error: any) {
    console.error("[Internal Error] OpenRouter Chat:", error?.message || error);
    res.status(500).json({ error: "Falha ao processar mensagem da IA via OpenRouter. Tente novamente." });
  }
});

export default app;
