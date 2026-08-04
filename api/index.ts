import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Logger } from "./utils/logger.js";
import { metricsMiddleware, aiCache } from "./utils/metrics.js";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAuthClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

type AuthenticatedRequest = Request & { authUserId?: string };

const requireAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
  // Unit tests and local development without Supabase keep the existing local workflow.
  // Production never falls back to unauthenticated AI access.
  if (process.env.NODE_ENV === "test" || (!isProduction && !supabaseAuthClient)) {
    return next();
  }

  if (!supabaseAuthClient) {
    return res.status(503).json({ error: "Autenticação indisponível no servidor." });
  }

  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Faça login para usar os recursos de IA." });
  }

  try {
    const { data, error } = await supabaseAuthClient.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Sua sessão expirou. Faça login novamente." });
    }

    (req as AuthenticatedRequest).authUserId = data.user.id;
    return next();
  } catch (error) {
    Logger.error("Falha ao validar a sessão do usuário.", error, req);
    return res.status(503).json({ error: "Não foi possível validar sua sessão agora." });
  }
};

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
      timestamp: new Date().toISOString()
    });
  });

  // Parse request bodies only after auth and rate limiting have run.
  const jsonParser = express.json({ limit: "20mb" });

  async function callOpenRouter(messages: any[], isJsonMode: boolean = false) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Chave OPENROUTER_API_KEY ou GEMINI_API_KEY não configurada no servidor.");
    }

    const modelsToTry = [
      process.env.OPENROUTER_MODEL,
      "google/gemini-2.5-flash:free",
      "google/gemini-2.5-flash",
      "qwen/qwen-2.5-72b-instruct:free",
      "meta-llama/llama-3.3-70b-instruct:free"
    ].filter(Boolean) as string[];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        // 8.5s timeout per model attempt to never exceed Vercel 10s serverless limit
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.APP_URL || "https://estudos-eyshila.vercel.app", 
            "X-Title": "Portal de Estudos Eyshila Caxias - ENARE", 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1500,
            temperature: 0.3,
            response_format: isJsonMode ? { type: "json_object" } : undefined
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`[${model}] OpenRouter Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        } else {
          throw new Error(`[${model}] Resposta inválida da OpenRouter.`);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.warn(`Tentativa com modelo ${model} excedeu limite de tempo (8.5s).`);
        } else {
          console.warn(`Tentativa com modelo ${model} falhou:`, err.message);
        }
        lastError = err;
      }
    }

    throw new Error(`Serviço de IA indisponível temporariamente. ${lastError?.message || ""}`);
  }

  // Zod Input Schemas
  const GenerateStudySchema = z.object({
    fileData: z.string().optional(),
    fileName: z.string().max(255).optional(),
    mimeType: z.enum(["application/pdf", "text/plain", "text/markdown"]).optional(),
    text: z.string().max(500000).optional(),
  }).refine((data) => data.fileData || data.text, {
    message: "Envie um arquivo PDF/texto ou digite um conteúdo de estudo.",
  });

  const ChatStudySchema = z.object({
    message: z.string().min(1, "Mensagem vazia.").max(4000, "Mensagem muito longa."),
  });

  const GeneratedStudySchema = z.object({
    summary: z.string(),
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()),
      answer: z.string(),
      explanation: z.string(),
    })),
    flashcards: z.array(z.object({
      front: z.string(),
      back: z.string(),
    })),
  });

  // API endpoints
  app.post("/api/generate-study", requireAuthenticatedUser, aiLimiter, jsonParser, async (req, res) => {
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
          try {
            const buffer = Buffer.from(fileData, "base64");
            // @ts-ignore
            const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text || "";
          } catch (pdfErr: any) {
            console.warn("pdf-parse falhou, tentando fallback por regex de streams PDF:", pdfErr.message);
            // Fallback: tentar extrair textos de streams do PDF caso o XRef esteja corrompido
            try {
              const rawStr = Buffer.from(fileData, "base64").toString("binary");
              const matches = rawStr.match(/\(([^()]{3,})\)\s*T[jJ]/g);
              if (matches && matches.length > 5) {
                extractedText = matches.map(m => m.replace(/^\(/, "").replace(/\)\s*T[jJ]$/, "")).join(" ");
              }
            } catch (e) {
              // ignore fallback error
            }

            if (!extractedText || extractedText.trim().length < 20) {
              return res.status(400).json({
                error: "O arquivo PDF enviado parece estar corrompido, protegido por senha ou em formato de imagem/escaneado. Por favor, cole o texto de estudo diretamente no campo de texto ou utilize outro arquivo PDF."
              });
            }
          }
        } else {
          // Plain text base64
          extractedText = Buffer.from(fileData, "base64").toString("utf-8");
        }
      }

      if (!extractedText || extractedText.trim().length < 10) {
        return res.status(400).json({
          error: "O conteúdo de texto extraído é muito curto ou vazio. Por favor, digite ou cole um texto com as matérias que deseja estudar."
        });
      }

      // Auto-truncate very large documents to avoid exceeding LLM context & timeouts
      if (extractedText.length > 45000) {
        extractedText = extractedText.substring(0, 45000) + "\n\n[Nota: O documento original excede 45.000 caracteres e foi resumido para otimizar a geração do material didático.]";
      }

      const systemPrompt = `Você é o Preceptor e Mentor Especialista do 'Você Aprovado', referência em preparação científica para o ENADE e ENARE de Enfermagem.
TODAS AS SUAS RESPOSTAS E QUESTÕES DEVEM SER RIGOROSAMENTE BASEADAS EM PROTOCOLOS VIGENTES:
1. Resolução COFEN nº 736/2024 (Processo de Enfermagem em 5 etapas: Avaliação, Diagnóstico, Planejamento, Implementação e Evolução).
2. Código de Ética dos Profissionais de Enfermagem (Resolução COFEN nº 564/2017).
3. Leis Orgânicas da Saúde (Lei 8.080/90, Lei 8.142/90, Decreto 7.508/11) e Diretrizes do PNI/Ministério da Saúde.
4. Protocolos de Suporte de Vida (AHA 2025) e Diretrizes Clínicas de Enfermagem baseadas em evidências.

SUA EXPLICAÇÃO DE CADA QUESTÃO DEVE INCLUIR A REFERÊNCIA LEGAL/CIENTÍFICA VIGENTE.
VOCÊ DEVE RESPONDER EXCLUSIVAMENTE NO FORMATO JSON ABAIXO. NÃO INCLUA TEXTO FORA DO JSON.

Formato exigido:
{
  "summary": "Resumo estruturado em Markdown com introdução, tópicos fundamentais e condutas de enfermagem.",
  "questions": [
    {
      "question": "Enunciado focado em caso clínico ou legislação aplicada",
      "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4"],
      "answer": "A",
      "explanation": "Fundamentação técnica e citação da norma/protocolo oficial."
    }
  ],
  "flashcards": [
    {
      "front": "Conceito-chave ou conduta clínica",
      "back": "Definição precisa com embasamento técnico"
    }
  ]
}
CERTIFIQUE-SE QUE EXISTAM EXATAMENTE 3 QUESTÕES DE ALTO RENDIMENTO E 3 FLASHCARDS DIRETO AO PONTO.`;

      const userPrompt = `Baseado no seguinte texto de estudos, elabore o resumo científico, questões com fundamentação legal/clínica e flashcards em formato JSON estrito:\n\n${extractedText}`;
      const fullUserPrompt = userPrompt + "\n\nPriorize as Diretrizes AHA 2025 e as demais fontes oficiais vigentes. Este é um material educacional; quando houver divergência, oriente a consulta à fonte oficial e ao protocolo institucional vigente.";

      // Cache logic via SHA-256
      const promptHash = crypto.createHash("sha256").update(fullUserPrompt).digest("hex");
      const cacheKey = `study_${promptHash}`;
      const cachedResponse = aiCache.get(cacheKey);
      if (cachedResponse) {
        Logger.info("CACHE_HIT: generate-study", req);
        return res.json(cachedResponse);
      }
      Logger.info("CACHE_MISS: generate-study", req);

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: fullUserPrompt }
      ];

      const responseText = await callOpenRouter(messages, true);
      
      const firstBrace = responseText.indexOf("{");
      const lastBrace = responseText.lastIndexOf("}");
      const jsonSub = (firstBrace !== -1 && lastBrace !== -1) 
        ? responseText.substring(firstBrace, lastBrace + 1) 
        : responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const parsedResult = GeneratedStudySchema.safeParse(JSON.parse(jsonSub));
      if (!parsedResult.success) {
        throw new Error("A resposta da IA não seguiu o formato esperado.");
      }
      const parsedData = parsedResult.data;
      
      aiCache.set(cacheKey, parsedData);
      res.json(parsedData);

    } catch (error: any) {
      Logger.error("Falha ao gerar o material de estudos via OpenRouter.", error, req);
      res.status(502).json({ error: "O serviço de IA está indisponível no momento. Tente novamente." });
    }
  });

  app.post("/api/chat-study", requireAuthenticatedUser, aiLimiter, jsonParser, async (req, res) => {
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

      const messageHash = crypto.createHash("sha256").update(message).digest("hex");
      const cacheKey = `chat_${messageHash}`;
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
      res.status(502).json({ error: "O serviço de IA está indisponível no momento. Tente novamente." });
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
