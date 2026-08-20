import {
  CadernoErroItem,
  ExamAttempt,
  ExamBlueprint,
  ExamMode,
  ExamQuestion,
  Flashcard,
  QuestionCognitiveType,
  QuestionExposure,
  QuestionScope,
  ReviewRating,
} from "../types";
import { categoryKeyFromLabel } from "../data/questionNormalizer";
import { ENARE_2026_BLUEPRINT } from "../data/enareBlueprint";
import { isApprovedStudyQuestion } from "./contentPolicy";

export { ENARE_2026_BLUEPRINT, ENARE_2026_CONTENT_URL } from "../data/enareBlueprint";

const GENERAL_CATEGORY_PATTERN = /legislação sus|políticas? (públicas|de saúde)|saúde coletiva|humanização|vigilância em saúde|atenção básica|estratégia saúde da família|redes de atenção|educação permanente|nr-?32|segurança do paciente/i;
const PROFESSIONAL_NURSING_PATTERN = /cofen|exercício profissional|processo de enfermagem|sae|nanda|nic|administração aplicada à enfermagem/i;
const CLINICAL_PATTERN = /paciente|gestante|puérpera|recém-nascid|criança|adulto|idoso|apresenta|admitid|atendimento|caso clínico|sintoma|exame físico/i;
const FACTUAL_PATTERN = /dose|dosagem|valor|faixa|gota|ml|mg|mcg|lei n|art\.|resolução|prazo|temperatura|frequência|quantos|relação correta/i;
const HIGH_CRITICALITY_PATTERN = /dose|dosagem|medicamento|parada|pcr|choque|via aérea|hemorrag|sepse|insulina|vasoativ|notificação imediata/i;

export function inferQuestionScope(question: ExamQuestion): QuestionScope {
  if (question.scope) return question.scope;
  if (GENERAL_CATEGORY_PATTERN.test(question.category)) return "general";
  if (PROFESSIONAL_NURSING_PATTERN.test(`${question.category} ${question.question}`)) return "specific";
  return GENERAL_CATEGORY_PATTERN.test(question.question) ? "general" : "specific";
}

export function inferCognitiveType(question: ExamQuestion): QuestionCognitiveType {
  if (question.cognitiveType) return question.cognitiveType;
  const searchable = `${question.question} ${question.category}`;
  if (CLINICAL_PATTERN.test(searchable)) return "clinical_reasoning";
  if (FACTUAL_PATTERN.test(searchable)) return "factual";
  return /urgência|uti|procedimento|protocolo|sae|processo de enfermagem/i.test(searchable)
    ? "protocol"
    : "factual";
}

export function enrichQuestion(question: ExamQuestion): ExamQuestion {
  const cognitiveType = inferCognitiveType(question);
  const criticality = question.criticality
    ?? (HIGH_CRITICALITY_PATTERN.test(`${question.question} ${question.category}`) ? 3 : cognitiveType === "clinical_reasoning" ? 2 : 1);
  // Legacy client-side items are study material. Only reviewed server-side
  // content may be explicitly promoted to the protected assessment pool.
  const pool = question.pool ?? "study";

  return {
    ...question,
    cognitiveType,
    criticality,
    categoryKey: question.categoryKey || categoryKeyFromLabel(question.category),
    competencyId: question.competencyId || slugify(question.category || "sem-categoria"),
    scope: inferQuestionScope(question),
    pool,
    authoredDifficulty: question.authoredDifficulty ?? 2,
    contentStatus: question.contentStatus ?? "draft",
  };
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const QUALITY_BY_RATING: Record<ReviewRating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

function getTypeMultiplier(type: QuestionCognitiveType, repetitions: number): number {
  if (type === "factual") return repetitions <= 3 ? 0.7 : 1;
  if (type === "protocol") return 0.85;
  return 1.15;
}

function getCriticalityMultiplier(criticality: 1 | 2 | 3): number {
  if (criticality === 3) return 0.8;
  if (criticality === 2) return 0.9;
  return 1;
}

export function scheduleFlashcardReview(
  card: Flashcard,
  rating: ReviewRating,
  now: Date = new Date(),
): Flashcard {
  const quality = QUALITY_BY_RATING[rating];
  const previousEase = card.easeFactor ?? 2.5;
  const cognitiveType = card.cognitiveType ?? "factual";
  const criticality = card.criticality ?? 1;
  let repetitions = card.repetitions ?? 0;
  let lapses = card.lapses ?? 0;
  let intervalDays = card.intervalDays ?? 0;

  const nextEase = Math.max(
    1.3,
    previousEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (quality < 3) {
    repetitions = 0;
    lapses += 1;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = cognitiveType === "clinical_reasoning" ? 2 : 1;
    } else if (repetitions === 2) {
      const baseInterval = cognitiveType === "factual" ? 4 : cognitiveType === "protocol" ? 5 : 7;
      intervalDays = Math.max(1, Math.round(baseInterval * getCriticalityMultiplier(criticality)));
    } else {
      const ratingMultiplier = rating === "hard" ? 0.8 : rating === "easy" ? 1.3 : 1;
      intervalDays = Math.max(
        1,
        Math.round(
          Math.max(1, intervalDays)
          * nextEase
          * getTypeMultiplier(cognitiveType, repetitions)
          * getCriticalityMultiplier(criticality)
          * ratingMultiplier,
        ),
      );
    }
  }

  intervalDays = Math.min(intervalDays, 365);
  const nextReviewDate = new Date(now);
  nextReviewDate.setHours(12, 0, 0, 0);
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    ...card,
    cognitiveType,
    criticality,
    repetitions,
    lapses,
    intervalDays,
    easeFactor: Number(nextEase.toFixed(2)),
    lastQuality: quality,
    lastReviewedAt: now.toISOString(),
    nextReview: nextReviewDate.toISOString().slice(0, 10),
  };
}

export function scheduleCadernoErrorReview(
  item: CadernoErroItem,
  rating: ReviewRating,
  question?: ExamQuestion,
  now: Date = new Date(),
): CadernoErroItem {
  const scheduled = scheduleFlashcardReview({
    id: item.id,
    question: item.questionText,
    answer: item.correctAnswer || item.explanation,
    category: item.category,
    difficulty: "Medium",
    nextReview: item.nextReview,
    intervalDays: item.intervalDays,
    repetitions: item.repetitions,
    easeFactor: item.easeFactor,
    lapses: item.lapses,
    lastQuality: item.lastQuality,
    lastReviewedAt: item.lastReviewedAt,
    cognitiveType: item.cognitiveType || (question ? inferCognitiveType(question) : "factual"),
    criticality: item.criticality || question?.criticality || 1,
  }, rating, now);

  return {
    ...item,
    nextReview: scheduled.nextReview,
    intervalDays: scheduled.intervalDays,
    repetitions: scheduled.repetitions,
    easeFactor: scheduled.easeFactor,
    lapses: scheduled.lapses,
    lastQuality: scheduled.lastQuality,
    lastReviewedAt: scheduled.lastReviewedAt,
    cognitiveType: scheduled.cognitiveType,
    criticality: scheduled.criticality,
  };
}

export interface TopicPerformance {
  id: string;
  name: string;
  scope: QuestionScope;
  attempts: number;
  correct: number;
  accuracy: number | null;
  smoothedAccuracy: number;
  averageResponseMs: number | null;
  lastReviewedAt: string | null;
  syllabusWeight: number;
  priorityScore: number;
}

interface MutableTopicPerformance {
  id: string;
  name: string;
  scope: QuestionScope;
  attempts: number;
  correct: number;
  responseMs: number;
  responseCount: number;
  lastReviewedAt: string | null;
}

function daysBetween(later: Date, earlierIso: string): number {
  const earlier = new Date(earlierIso);
  if (Number.isNaN(earlier.getTime())) return 30;
  return Math.max(0, (later.getTime() - earlier.getTime()) / 86_400_000);
}

export function calculateTopicPerformance(
  attempts: ExamAttempt[] = [],
  questionBank: ExamQuestion[] = [],
  now: Date = new Date(),
): TopicPerformance[] {
  const topics = new Map<string, MutableTopicPerformance>();
  const ensureTopic = (question: ExamQuestion): MutableTopicPerformance => {
    const enriched = enrichQuestion(question);
    const id = enriched.competencyId || slugify(enriched.category);
    const existing = topics.get(id);
    if (existing) return existing;
    const created: MutableTopicPerformance = {
      id,
      name: enriched.category || "Sem categoria",
      scope: enriched.scope || "specific",
      attempts: 0,
      correct: 0,
      responseMs: 0,
      responseCount: 0,
      lastReviewedAt: null,
    };
    topics.set(id, created);
    return created;
  };

  questionBank.forEach(ensureTopic);
  attempts.forEach((attempt) => {
    (attempt.questions || []).forEach((question, index) => {
      const topic = ensureTopic(question);
      const selected = attempt.selectedAnswers?.[index];
      if (selected === undefined) return;
      topic.attempts += 1;
      if (selected === question.correctIndex) topic.correct += 1;
      const responseMs = attempt.responseTimesMs?.[index];
      if (responseMs && responseMs > 0) {
        topic.responseMs += responseMs;
        topic.responseCount += 1;
      }
      if (!topic.lastReviewedAt || attempt.date > topic.lastReviewedAt) {
        topic.lastReviewedAt = attempt.date;
      }
    });
  });

  const scopeCounts = Array.from(topics.values()).reduce(
    (counts, topic) => ({ ...counts, [topic.scope]: counts[topic.scope] + 1 }),
    { general: 0, specific: 0 } as Record<QuestionScope, number>,
  );

  return Array.from(topics.values())
    .map((topic): TopicPerformance => {
      const smoothedAccuracy = (topic.correct + 2) / (topic.attempts + 4);
      const confidence = Math.min(topic.attempts / 10, 1);
      const knowledgeRisk = confidence * (1 - smoothedAccuracy) + (1 - confidence) * 0.5;
      const overdue = topic.lastReviewedAt
        ? Math.min(daysBetween(now, topic.lastReviewedAt) / 7, 1)
        : 1;
      const coverageGap = 1 - confidence;
      const averageResponseMs = topic.responseCount > 0 ? topic.responseMs / topic.responseCount : null;
      const speedPenalty = averageResponseMs ? Math.min(Math.max(averageResponseMs / 180_000 - 1, 0), 1) : 0;
      const scopeWeight = topic.scope === "general" ? 0.2 : 0.8;
      const syllabusWeight = scopeWeight / Math.max(scopeCounts[topic.scope], 1);
      const normalizedSyllabusWeight = Math.min(syllabusWeight * 4, 1);
      const priorityScore = 100 * (
        0.35 * knowledgeRisk
        + 0.25 * overdue
        + 0.25 * normalizedSyllabusWeight
        + 0.1 * coverageGap
        + 0.05 * speedPenalty
      );

      return {
        id: topic.id,
        name: topic.name,
        scope: topic.scope,
        attempts: topic.attempts,
        correct: topic.correct,
        accuracy: topic.attempts > 0 ? Math.round((topic.correct / topic.attempts) * 100) : null,
        smoothedAccuracy,
        averageResponseMs: averageResponseMs ? Math.round(averageResponseMs) : null,
        lastReviewedAt: topic.lastReviewedAt,
        syllabusWeight,
        priorityScore: Math.round(priorityScore),
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);
}

export interface StudyPlanRecommendation {
  topic: TopicPerformance;
  questionCount: number;
  vignetteCount: number;
  flashcardCount: number;
  estimatedMinutes: number;
  reason: string;
}

export function buildNextStudyPlan(topic: TopicPerformance | undefined): StudyPlanRecommendation | null {
  if (!topic) return null;
  if (topic.attempts < 5) {
    return {
      topic,
      questionCount: 10,
      vignetteCount: topic.scope === "specific" ? 2 : 0,
      flashcardCount: 0,
      estimatedMinutes: 25,
      reason: "Ainda há poucos dados; faça um diagnóstico curto antes de concluir que este tema é uma fraqueza.",
    };
  }
  if ((topic.accuracy ?? 0) < 65) {
    return {
      topic,
      questionCount: 15,
      vignetteCount: topic.scope === "specific" ? 3 : 1,
      flashcardCount: 6,
      estimatedMinutes: 40,
      reason: "Acurácia baixa combinada com risco de esquecimento e peso do tema no edital.",
    };
  }
  return {
    topic,
    questionCount: 5,
    vignetteCount: topic.scope === "specific" ? 1 : 0,
    flashcardCount: 4,
    estimatedMinutes: 18,
    reason: "Revisão de manutenção para preservar o domínio sem consumir tempo excessivo.",
  };
}

export function eligibleQuestionsForMode(
  questions: ExamQuestion[],
  mode: ExamMode,
  exposures: QuestionExposure[] = [],
): ExamQuestion[] {
  const seenIds = new Set(exposures.map((exposure) => exposure.questionId));
  return questions
    .map(enrichQuestion)
    .filter((question) => {
      if (mode === "study" || mode === "practice") {
        return question.pool !== "assessment" && isApprovedStudyQuestion(question);
      }
      if (mode === "benchmark") return question.pool === "assessment" && !seenIds.has(question.id);
      return false;
    });
}

export function calculateNoveltyRate(questionIds: string[], exposures: QuestionExposure[]): number {
  if (questionIds.length === 0) return 0;
  const seenIds = new Set(exposures.map((exposure) => exposure.questionId));
  const unseenCount = questionIds.filter((id) => !seenIds.has(id)).length;
  return Math.round((unseenCount / questionIds.length) * 100);
}

export function isValidBenchmarkForm(
  questions: ExamQuestion[],
  mode: ExamMode,
  noveltyRate: number,
  blueprint: ExamBlueprint = ENARE_2026_BLUEPRINT,
): boolean {
  if (mode !== "benchmark" || noveltyRate < 100 || questions.length !== blueprint.questionCount) return false;
  if (questions.some((question) => (
    question.options.length !== blueprint.optionsPerQuestion
    || question.pool !== "assessment"
    || question.contentStatus !== "published"
    || Boolean(question.requiresReview)
    || Boolean(question.generatedOptionIndexes?.length)
  ))) return false;
  const general = questions.filter((question) => inferQuestionScope(question) === "general").length;
  return general === blueprint.generalQuestionCount
    && questions.length - general === blueprint.specificQuestionCount;
}
