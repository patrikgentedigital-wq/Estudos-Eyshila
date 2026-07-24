import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import dotenv from "dotenv";
import { Logger } from "./utils/logger.js";
import { metricsMiddleware, aiCache } from "./utils/metrics.js";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const app = express();

try {
  // Apply metrics & tracing first
  app.use(metricsMiddleware);

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

  // Health Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
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
          const pdfParse = (await import("pdf-parse")).default;
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

      // Cache logic
      const cacheKey = `study_${Buffer.from(userPrompt).toString('base64').substring(0, 50)}`;
      const cachedResponse = aiCache.get(cacheKey);
      if (cachedResponse) {
        Logger.info("CACHE_HIT: generate-study", req);
        return res.json(cachedResponse);
      }
      Logger.info("CACHE_MISS: generate-study", req);

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const responseText = await callOpenRouter(messages, true);
      
      const firstBrace = responseText.indexOf("{");
      const lastBrace = responseText.lastIndexOf("}");
      const jsonSub = (firstBrace !== -1 && lastBrace !== -1) 
        ? responseText.substring(firstBrace, lastBrace + 1) 
        : responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedData = JSON.parse(jsonSub);
      
      aiCache.set(cacheKey, parsedData);
      res.json(parsedData);

    } catch (error: any) {
      Logger.error("Falha ao gerar o material de estudos via OpenRouter.", error, req);
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

      const cacheKey = `chat_${Buffer.from(message).toString('base64').substring(0, 50)}`;
      const cachedResponse = aiCache.get(cacheKey);
      if (cachedResponse) {
        Logger.info("CACHE_HIT: chat-study", req);
        return res.json({ text: cachedResponse });
      }
      Logger.info("CACHE_MISS: chat-study", req);

      const responseText = await callOpenRouter(messages, false);
      aiCache.set(cacheKey, responseText);
      res.json({ text: responseText });

    } catch (error: any) {
      Logger.error("Falha ao processar mensagem da IA via OpenRouter.", error, req);
      res.status(500).json({ error: "Falha ao processar mensagem da IA via OpenRouter. Tente novamente." });
    }
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    Logger.critical("Unhandled Server Error", err, req);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
  });

} catch (startupError: any) {
  // If anything crashes during require/initialization (like pdf-parse or node-cache issues),
  // we catch it here and return a valid JSON 500 so the frontend can read the exact crash reason.
  console.error("FATAL STARTUP ERROR:", startupError);
  app.use("*", (req, res) => {
    res.status(500).json({ 
      error: `Erro Crítico de Inicialização no Servidor (Vercel): ${startupError.message || startupError}`
    });
  });
}

export default app;
