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
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAuthClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;
const supabaseAdminClient = supabaseUrl && supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

const ENARE_BLUEPRINT = {
  id: "enare-2026-area-profissional",
  name: "ENARE 2026/2027 - Enfermagem",
  board: "FGV",
  cycle: "2026/2027",
  questionCount: 100,
  durationMinutes: 300,
  optionsPerQuestion: 5,
  generalQuestionCount: 20,
  specificQuestionCount: 80,
  minimumPassingPercentage: 50,
  allowBackNavigation: true,
  allowPause: false,
  feedbackPolicy: "after_submission",
  sourceUrl: "https://enare2026.conhecimento.fgv.br/docs/36fa57ca8c68805fad82fce1d233592a.pdf",
} as const;

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
  const allowedOrigins = (isProduction
    ? [process.env.APP_URL]
    : [process.env.APP_URL, "http://localhost:3000", "http://localhost:5173"]
  ).filter(Boolean) as string[];

  if (isProduction && allowedOrigins.length === 0) {
    console.error("APP_URL must be configured in production; cross-origin requests will be rejected.");
  }

  app.use(
    cors({
      origin: allowedOrigins,
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

  const examLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas operações de simulado. Aguarde um minuto e tente novamente." },
  });

  // Health Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/exams/blueprints/enare-2026", requireAuthenticatedUser, (_req, res) => {
    res.json(ENARE_BLUEPRINT);
  });

  // Parse request bodies only after auth and rate limiting have run.
  const jsonParser = express.json({ limit: "8mb" });

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
    ].filter(Boolean).slice(0, 3) as string[];

    let lastError: any = null;
    const deadline = Date.now() + 50_000;

    for (const model of modelsToTry) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 1_000) break;
      const timeoutMs = Math.min(18_000, remainingMs - 250);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
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
          console.warn(`Tentativa com modelo ${model} excedeu o limite global de 50s.`);
        } else {
          console.warn(`Tentativa com modelo ${model} falhou:`, err.message);
        }
        lastError = err;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error(`Serviço de IA indisponível temporariamente. ${lastError?.message || ""}`);
  }

  // Zod Input Schemas
  const GenerateStudySchema = z.object({
    fileData: z.string().optional(),
    fileName: z.string().max(255).optional(),
    mimeType: z.enum(["application/pdf", "text/plain", "text/markdown"]).optional(),
    text: z.string().max(45000, "O texto excede 45.000 caracteres. Divida o material em partes menores.").optional(),
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
      leadIn: z.string().optional(),
      options: z.array(z.string()).length(5),
      answer: z.enum(["A", "B", "C", "D", "E"]),
      explanation: z.string(),
      cognitiveType: z.enum(["factual", "protocol", "clinical_reasoning"]),
      clinicalCase: z.object({
        setting: z.string().optional(),
        ageGroup: z.string().optional(),
        presentingProblem: z.string().optional(),
        history: z.string().optional(),
        physicalExam: z.string().optional(),
        vitals: z.record(z.string(), z.string()).optional(),
        labs: z.record(z.string(), z.string()).optional(),
      }).optional(),
      pivotalCues: z.array(z.string()).max(5).optional(),
      reasoningSteps: z.array(z.string()).max(5).optional(),
      distractorExplanations: z.array(z.string()).length(5).optional(),
      source: z.string(),
    })).length(3),
    flashcards: z.array(z.object({
      front: z.string(),
      back: z.string(),
    })).length(3),
  });

  const ExtractPdfSchema = z.object({
    fileData: z.string().min(1),
    fileName: z.string().max(255).optional(),
    mimeType: z.enum(["application/pdf", "text/plain", "text/markdown"]).optional(),
  });

  const StartExamSchema = z.object({
    blueprintId: z.string().default(ENARE_BLUEPRINT.id),
    mode: z.enum(["study", "practice", "benchmark"]),
    questionCount: z.number().int().min(1).max(100).optional(),
  });

  const SubmitExamSchema = z.object({
    answers: z.array(z.object({
      questionId: z.string().min(1),
      selectedPosition: z.number().int().min(0).max(9).nullable(),
      responseMs: z.number().int().min(0).max(86_400_000).optional(),
      confidence: z.number().int().min(1).max(3).optional(),
      seenExternally: z.boolean().optional(),
    })).max(100),
  });

  function secureShuffle<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const selected = crypto.randomInt(index + 1);
      [shuffled[index], shuffled[selected]] = [shuffled[selected], shuffled[index]];
    }
    return shuffled;
  }

  function requireExamDatabase(req: AuthenticatedRequest, res: Response): { userId: string; admin: NonNullable<typeof supabaseAdminClient> } | null {
    if (!supabaseAdminClient) {
      res.status(503).json({ error: "Banco seguro de simulados ainda não foi ativado no servidor." });
      return null;
    }
    if (!req.authUserId) {
      res.status(401).json({ error: "Faça login para iniciar ou entregar um simulado." });
      return null;
    }
    return { userId: req.authUserId, admin: supabaseAdminClient };
  }

  const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

  async function extractUploadedText(fileData: string, mimeType?: string): Promise<string> {
    const decodedSizeBytes = Buffer.byteLength(fileData, "base64");
    if (decodedSizeBytes > MAX_UPLOAD_BYTES) {
      throw new Error("O arquivo excede o limite de 5 MB. Divida o PDF em partes menores.");
    }

    if (mimeType !== "application/pdf") {
      return Buffer.from(fileData, "base64").toString("utf-8").trim();
    }

    try {
      const buffer = Buffer.from(fileData, "base64");
      // @ts-ignore pdf-parse exposes a default function in the installed CJS build.
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const pdfData = await pdfParse(buffer);
      const parsedText = (pdfData.text || "").trim();
      if (parsedText.length >= 20) return parsedText;
    } catch (pdfErr: any) {
      console.warn("pdf-parse falhou, tentando fallback por regex de streams PDF:", pdfErr.message);
    }

    try {
      const rawStr = Buffer.from(fileData, "base64").toString("binary");
      const matches = rawStr.match(/\(([^()]{3,})\)\s*T[jJ]/g);
      const fallbackText = matches
        ? matches.map(m => m.replace(/^\(/, "").replace(/\)\s*T[jJ]$/, "")).join(" ").trim()
        : "";
      if (fallbackText.length >= 20) return fallbackText;
    } catch {
      // Return a clear user-facing error below.
    }

    throw new Error("O PDF não possui camada de texto legível. Ele pode estar escaneado, protegido por senha ou corrompido.");
  }

  // API endpoints
  app.post("/api/exams/start", requireAuthenticatedUser, examLimiter, jsonParser, async (req: AuthenticatedRequest, res) => {
    const database = requireExamDatabase(req, res);
    if (!database) return;

    const validation = StartExamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    try {
      const { admin, userId } = database;
      const { data: blueprint, error: blueprintError } = await admin
        .from("exam_blueprints")
        .select("*")
        .eq("id", validation.data.blueprintId)
        .eq("is_active", true)
        .single();
      if (blueprintError || !blueprint) {
        return res.status(503).json({ error: "Blueprint de prova indisponível. A migration do banco pode estar pendente." });
      }

      const mode = validation.data.mode;
      const requestedCount = mode === "benchmark"
        ? blueprint.question_count
        : Math.min(validation.data.questionCount ?? 10, blueprint.question_count);
      const targetGeneral = mode === "benchmark"
        ? blueprint.general_question_count
        : Math.round(requestedCount * (blueprint.general_question_count / blueprint.question_count));
      const targetSpecific = requestedCount - targetGeneral;
      const pool = mode === "benchmark" ? "assessment" : "study";

      const { data: rawQuestions, error: questionsError } = await admin
        .from("questions")
        .select("id, clinical_case_id, stem, lead_in, category, scope, cognitive_type, criticality, pool, authored_difficulty, family_id, content_version")
        .eq("pool", pool)
        .eq("content_status", "published")
        .eq("is_active", true)
        .order("sampling_key")
        .limit(500);
      if (questionsError) throw questionsError;
      if (!rawQuestions?.length) {
        return res.status(409).json({ error: "O pool revisado desta modalidade ainda não possui questões publicadas." });
      }

      const candidateIds = rawQuestions.map((question) => question.id);
      const [{ data: optionRows, error: optionsError }, { data: answerRows, error: answersError }] = await Promise.all([
        admin.from("question_options").select("question_id, position, option_text").in("question_id", candidateIds).order("position"),
        admin.from("question_answer_keys").select("question_id").in("question_id", candidateIds),
      ]);
      if (optionsError) throw optionsError;
      if (answersError) throw answersError;

      const optionsByQuestion = new Map<string, Array<{ position: number; option_text: string }>>();
      (optionRows || []).forEach((option) => {
        const existing = optionsByQuestion.get(option.question_id) || [];
        existing.push(option);
        optionsByQuestion.set(option.question_id, existing);
      });
      const questionsWithKeys = new Set((answerRows || []).map((answer) => answer.question_id));

      let seenIds = new Set<string>();
      let seenFamilies = new Set<string>();
      if (mode === "benchmark") {
        const { data: exposures, error: exposureError } = await admin
          .from("question_exposures")
          .select("question_id")
          .eq("user_id", userId);
        if (exposureError) throw exposureError;
        seenIds = new Set((exposures || []).map((exposure) => exposure.question_id));
        if (seenIds.size > 0) {
          const seenIdList = [...seenIds];
          const chunks = Array.from(
            { length: Math.ceil(seenIdList.length / 200) },
            (_, index) => seenIdList.slice(index * 200, (index + 1) * 200),
          );
          const seenQuestionResults = await Promise.all(chunks.map((chunk) => (
            admin.from("questions").select("family_id").in("id", chunk)
          )));
          const seenQuestions = seenQuestionResults.flatMap((result) => {
            if (result.error) throw result.error;
            return result.data || [];
          });
          seenFamilies = new Set(
            seenQuestions
              .map((question) => question.family_id)
              .filter((familyId): familyId is string => Boolean(familyId)),
          );
        }
      }

      const candidateFamilies = new Set<string>();
      const candidates = secureShuffle(rawQuestions).filter((question) => {
        const familyKey = question.family_id || question.id;
        if (candidateFamilies.has(familyKey)) return false;
        const isEligible = (
        questionsWithKeys.has(question.id)
        && (optionsByQuestion.get(question.id)?.length ?? 0) === blueprint.options_per_question
        && (mode !== "benchmark" || !seenIds.has(question.id))
        && (mode !== "benchmark" || !question.family_id || !seenFamilies.has(question.family_id))
        );
        if (isEligible) candidateFamilies.add(familyKey);
        return isEligible;
      });
      const general = secureShuffle(candidates.filter((question) => question.scope === "general"));
      const specific = secureShuffle(candidates.filter((question) => question.scope === "specific"));
      if (general.length < targetGeneral || specific.length < targetSpecific) {
        return res.status(409).json({
          error: "Ainda não há questões inéditas e revisadas suficientes para cumprir o blueprint sem contaminar a nota.",
          available: { general: general.length, specific: specific.length },
          required: { general: targetGeneral, specific: targetSpecific },
        });
      }

      const selectedQuestions = secureShuffle([
        ...general.slice(0, targetGeneral),
        ...specific.slice(0, targetSpecific),
      ]);
      const noveltyRate = mode === "benchmark"
        ? 100
        : Math.round((selectedQuestions.filter((question) => !seenIds.has(question.id)).length / selectedQuestions.length) * 100);
      const validForBenchmark = mode === "benchmark"
        && selectedQuestions.length === blueprint.question_count
        && noveltyRate === 100;

      const { data: attempt, error: attemptError } = await admin
        .from("exam_attempts")
        .insert({
          user_id: userId,
          blueprint_id: blueprint.id,
          mode,
          total_questions: selectedQuestions.length,
          novelty_rate: noveltyRate,
          valid_for_benchmark: validForBenchmark,
        })
        .select("id, started_at")
        .single();
      if (attemptError || !attempt) throw attemptError || new Error("Falha ao criar tentativa.");

      const attemptItems = selectedQuestions.map((question, position) => ({
        attempt_id: attempt.id,
        user_id: userId,
        question_id: question.id,
        question_version: question.content_version,
        position,
      }));
      const exposureRows = selectedQuestions.map((question) => ({
        user_id: userId,
        question_id: question.id,
        attempt_id: attempt.id,
        mode,
      }));
      const [{ error: itemError }, { error: insertExposureError }] = await Promise.all([
        admin.from("exam_attempt_items").insert(attemptItems),
        admin.from("question_exposures").insert(exposureRows),
      ]);
      if (itemError || insertExposureError) {
        await admin.from("exam_attempts").delete().eq("id", attempt.id).eq("user_id", userId);
        throw itemError || insertExposureError;
      }

      const clinicalCaseIds = selectedQuestions
        .map((question) => question.clinical_case_id)
        .filter((id): id is string => Boolean(id));
      const casesById = new Map<string, any>();
      if (clinicalCaseIds.length > 0) {
        const { data: caseRows, error: casesError } = await admin
          .from("clinical_cases")
          .select("id, setting, age_group, presenting_problem, history, physical_exam, vitals, labs, timeline")
          .in("id", clinicalCaseIds);
        if (casesError) throw casesError;
        (caseRows || []).forEach((clinicalCase) => casesById.set(clinicalCase.id, clinicalCase));
      }

      return res.json({
        attemptId: attempt.id,
        startedAt: attempt.started_at,
        mode,
        noveltyRate,
        validForBenchmark,
        durationMinutes: mode === "benchmark" ? blueprint.duration_minutes : null,
        questions: selectedQuestions.map((question) => {
          const clinicalCase = question.clinical_case_id ? casesById.get(question.clinical_case_id) : null;
          return {
            id: question.id,
            question: question.stem,
            leadIn: question.lead_in,
            category: question.category,
            scope: question.scope,
            cognitiveType: question.cognitive_type,
            criticality: question.criticality,
            authoredDifficulty: question.authored_difficulty,
            familyId: question.family_id,
            options: (optionsByQuestion.get(question.id) || []).map((option) => option.option_text),
            clinicalCase: clinicalCase ? {
              setting: clinicalCase.setting,
              ageGroup: clinicalCase.age_group,
              presentingProblem: clinicalCase.presenting_problem,
              history: clinicalCase.history,
              physicalExam: clinicalCase.physical_exam,
              vitals: clinicalCase.vitals,
              labs: clinicalCase.labs,
              timeline: clinicalCase.timeline,
            } : undefined,
          };
        }),
      });
    } catch (error) {
      Logger.error("Falha ao iniciar simulado seguro.", error, req);
      return res.status(500).json({ error: "Não foi possível montar o simulado agora." });
    }
  });

  app.post("/api/exams/:attemptId/submit", requireAuthenticatedUser, examLimiter, jsonParser, async (req: AuthenticatedRequest, res) => {
    const database = requireExamDatabase(req, res);
    if (!database) return;

    const validation = SubmitExamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    try {
      const { admin, userId } = database;
      const attemptId = req.params.attemptId;
      const { data: attempt, error: attemptError } = await admin
        .from("exam_attempts")
        .select("id, user_id, mode, blueprint_id, started_at, submitted_at, total_questions, novelty_rate")
        .eq("id", attemptId)
        .eq("user_id", userId)
        .single();
      if (attemptError || !attempt) return res.status(404).json({ error: "Tentativa não encontrada." });
      if (attempt.submitted_at) return res.status(409).json({ error: "Esta tentativa já foi entregue." });

      const { data: items, error: itemsError } = await admin
        .from("exam_attempt_items")
        .select("attempt_id, user_id, question_id, question_version, position")
        .eq("attempt_id", attemptId)
        .eq("user_id", userId)
        .order("position");
      if (itemsError) throw itemsError;
      if (!items?.length) throw new Error("Tentativa sem itens.");

      const itemByQuestion = new Map(items.map((item) => [item.question_id, item]));
      const submittedQuestionIds = validation.data.answers.map((answer) => answer.questionId);
      if (
        validation.data.answers.length !== items.length
        || new Set(submittedQuestionIds).size !== items.length
      ) {
        return res.status(400).json({ error: "A entrega deve representar cada questão exatamente uma vez, inclusive respostas em branco." });
      }
      if (validation.data.answers.some((answer) => !itemByQuestion.has(answer.questionId))) {
        return res.status(400).json({ error: "A entrega contém uma questão que não pertence a esta tentativa." });
      }

      const { data: answerKeys, error: keysError } = await admin
        .from("question_answer_keys")
        .select("question_id, correct_position, explanation, pivotal_cues, reasoning_steps, distractor_explanations")
        .in("question_id", items.map((item) => item.question_id));
      if (keysError) throw keysError;
      const keyByQuestion = new Map((answerKeys || []).map((key) => [key.question_id, key]));
      if (keyByQuestion.size !== items.length) throw new Error("Gabarito incompleto para a tentativa.");

      const answerByQuestion = new Map(validation.data.answers.map((answer) => [answer.questionId, answer]));
      const answeredCount = validation.data.answers.filter((answer) => answer.selectedPosition !== null).length;
      let correctCount = 0;
      let adjustedCorrect = 0;
      let adjustedTotal = 0;
      const now = new Date().toISOString();
      const updatedItems = items.map((item) => {
        const answer = answerByQuestion.get(item.question_id);
        const key = keyByQuestion.get(item.question_id)!;
        const isCorrect = answer?.selectedPosition === key.correct_position;
        if (isCorrect) correctCount += 1;
        if (!answer?.seenExternally) {
          adjustedTotal += 1;
          if (isCorrect) adjustedCorrect += 1;
        }
        return {
          ...item,
          selected_position: answer?.selectedPosition ?? null,
          response_ms: answer?.responseMs,
          confidence: answer?.confidence,
          is_correct: isCorrect,
          seen_externally: answer?.seenExternally ?? false,
          answered_at: answer?.selectedPosition !== null ? now : null,
        };
      });

      const score = Math.round((correctCount / attempt.total_questions) * 10_000) / 100;
      const benchmarkScore = adjustedTotal > 0 ? Math.round((adjustedCorrect / adjustedTotal) * 10_000) / 100 : null;
      const selfReportedNoveltyRate = Math.round((adjustedTotal / attempt.total_questions) * 10_000) / 100;
      const finalNoveltyRate = Math.min(Number(attempt.novelty_rate), selfReportedNoveltyRate);
      const validForBenchmark = attempt.mode === "benchmark"
        && finalNoveltyRate === 100
        && attempt.total_questions === ENARE_BLUEPRINT.questionCount
        && validation.data.answers.every((answer) => !answer.seenExternally);

      const { error: updateItemsError } = await admin
        .from("exam_attempt_items")
        .upsert(updatedItems, { onConflict: "attempt_id,position" });
      if (updateItemsError) throw updateItemsError;

      const { error: updateAttemptError } = await admin
        .from("exam_attempts")
        .update({
          submitted_at: now,
          score,
          answered_questions: answeredCount,
          duration_seconds: Math.max(0, Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000)),
          novelty_rate: finalNoveltyRate,
          valid_for_benchmark: validForBenchmark,
        })
        .eq("id", attemptId)
        .eq("user_id", userId);
      if (updateAttemptError) throw updateAttemptError;

      const answeredExposures = validation.data.answers.map((answer) => ({
        question_id: answer.questionId,
        answered_at: answer.selectedPosition !== null ? now : null,
        is_correct: answer.selectedPosition === keyByQuestion.get(answer.questionId)?.correct_position,
        response_ms: answer.responseMs,
        confidence: answer.confidence,
        seen_externally: answer.seenExternally ?? false,
      }));
      // The attempt start already created an exposure row per question; fill them
      // in place instead of inserting duplicates, keeping the benchmark history exact.
      const { data: existingExposures, error: exposureQueryError } = await admin
        .from("question_exposures")
        .select("id, question_id")
        .eq("attempt_id", attemptId)
        .eq("user_id", userId);
      if (exposureQueryError) Logger.error("Falha não crítica ao ler exposições da tentativa.", exposureQueryError, req);
      const exposureIdByQuestion = new Map<string, string>();
      (existingExposures || []).forEach((exposure) => exposureIdByQuestion.set(exposure.question_id, exposure.id));

      await Promise.all(answeredExposures.map(async (exposure, index) => {
        const existingId = exposureIdByQuestion.get(validation.data.answers[index].questionId);
        const { error } = existingId
          ? await admin.from("question_exposures").update(exposure).eq("id", existingId).eq("user_id", userId)
          : await admin.from("question_exposures").insert({
              ...exposure,
              user_id: userId,
              attempt_id: attemptId,
              mode: attempt.mode,
              shown_at: attempt.started_at,
            });
        if (error) Logger.error("Falha não crítica ao registrar exposições respondidas.", error, req);
      }));

      return res.json({
        score,
        benchmarkScore,
        answeredQuestions: answeredCount,
        totalQuestions: attempt.total_questions,
        noveltyRate: finalNoveltyRate,
        validForBenchmark,
        results: items.map((item) => {
          const answer = answerByQuestion.get(item.question_id);
          const key = keyByQuestion.get(item.question_id)!;
          return {
            questionId: item.question_id,
            selectedPosition: answer?.selectedPosition ?? null,
            correctPosition: key.correct_position,
            isCorrect: answer?.selectedPosition === key.correct_position,
            explanation: key.explanation,
            pivotalCues: key.pivotal_cues,
            reasoningSteps: key.reasoning_steps,
            distractorExplanations: key.distractor_explanations,
          };
        }),
      });
    } catch (error) {
      Logger.error("Falha ao corrigir simulado seguro.", error, req);
      return res.status(500).json({ error: "Não foi possível corrigir o simulado agora." });
    }
  });

  app.post("/api/extract-pdf-text", requireAuthenticatedUser, aiLimiter, jsonParser, async (req, res) => {
    try {
      const validation = ExtractPdfSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const text = await extractUploadedText(validation.data.fileData, validation.data.mimeType);
      return res.json({ text });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || "Não foi possível extrair o texto do PDF." });
    }
  });

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
        try {
          extractedText = await extractUploadedText(fileData, mimeType);
        } catch (error: any) {
          return res.status(400).json({ error: error.message || "Não foi possível extrair o conteúdo do arquivo." });
        }
      }

      if (!extractedText || extractedText.trim().length < 10) {
        return res.status(400).json({
          error: "O conteúdo de texto extraído é muito curto ou vazio. Por favor, digite ou cole um texto com as matérias que deseja estudar."
        });
      }

      if (extractedText.length > 45000) {
        return res.status(413).json({ error: "O texto excede 45.000 caracteres para este fluxo. Divida o material em partes menores para não perder conteúdo." });
      }

      const systemPrompt = `Você é o Preceptor e Mentor Especialista do 'Estudos Eyshila', referência em preparação científica para o ENARE de Enfermagem.
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
      "question": "Enunciado sem repetir a pergunta de comando",
      "leadIn": "Qual é a conduta prioritária do enfermeiro?",
      "options": ["A) opção 1", "B) opção 2", "C) opção 3", "D) opção 4", "E) opção 5"],
      "answer": "A",
      "explanation": "Fundamentação técnica e citação da norma/protocolo oficial.",
      "cognitiveType": "clinical_reasoning",
      "clinicalCase": {
        "setting": "Unidade de pronto atendimento",
        "ageGroup": "Adulto",
        "presentingProblem": "Queixa e contexto clínico",
        "history": "História relevante sem dados decorativos",
        "physicalExam": "Achados necessários para a decisão",
        "vitals": { "PA": "valor", "FC": "valor" },
        "labs": { "Exame": "resultado" }
      },
      "pivotalCues": ["dado decisivo 1", "dado decisivo 2"],
      "reasoningSteps": ["identificar risco", "priorizar conduta", "confirmar segurança"],
      "distractorExplanations": ["por que A", "por que B", "por que C", "por que D", "por que E"],
      "source": "Norma ou protocolo oficial, com ano/versão"
    }
  ],
  "flashcards": [
    {
      "front": "Conceito-chave ou conduta clínica",
      "back": "Definição precisa com embasamento técnico"
    }
  ]
}
GERE EXATAMENTE 3 QUESTÕES DE ALTO RENDIMENTO, TODAS COM 5 ALTERNATIVAS, E 3 FLASHCARDS DIRETO AO PONTO.
PELO MENOS 2 QUESTÕES DEVEM SER VINHETAS CLÍNICAS DIFERENTES, COM DADOS DECISIVOS E PASSOS DE RACIOCÍNIO. A TERCEIRA PODE SER FACTUAL OU DE PROTOCOLO.
O MATERIAL GERADO É RASCUNHO EDUCACIONAL E NÃO DEVE SER APRESENTADO COMO QUESTÃO OFICIAL DA BANCA.`;

      const userPrompt = `Baseado no seguinte texto de estudos, elabore o resumo científico, questões com fundamentação legal/clínica e flashcards em formato JSON estrito:\n\n${extractedText}`;
      const fullUserPrompt = userPrompt + "\n\nPriorize as Diretrizes AHA 2025 e as demais fontes oficiais vigentes. Este é um material educacional; quando houver divergência, oriente a consulta à fonte oficial e ao protocolo institucional vigente.";

      // Cache logic via SHA-256
      const promptHash = crypto.createHash("sha256").update(fullUserPrompt).digest("hex");
      const cacheKey = `study_${promptHash}`;
      const cachedResponse = aiCache.get(cacheKey);
      if (cachedResponse) {
        Logger.info("CACHE_HIT: generate-study", req);
        return res.json({ ...(cachedResponse as Record<string, unknown>), sourceText: extractedText });
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
      res.json({ ...parsedData, sourceText: extractedText });

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
