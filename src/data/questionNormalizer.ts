import {
  ExamQuestion,
  QuestionCategoryKey,
  QuestionCognitiveType,
  QuestionContentStatus,
  QuestionSourceType,
} from "../types";

export type LegacyExamQuestion = ExamQuestion;

const GENERATED_DISTRACTOR = "Nenhuma das alternativas anteriores.";

const normalizeText = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

export function categoryKeyFromLabel(category: string): QuestionCategoryKey {
  const value = normalizeText(category);
  if (value.includes("etica") || value.includes("cofen") || value.includes("legislacao profissional")) return "etica-cofen";
  if (value.includes("urgencia") || value.includes("emergencia") || value.includes("uti") || value.includes("trauma")) return "urgencia-uti";
  if (value.includes("ciclo") || value.includes("mulher") || value.includes("crianca") || value.includes("idoso")) return "ciclos-de-vida";
  if (value.includes("farmacolog")) return "farmacologia";
  if (value.includes("procedimento") || value.includes("cirurg")) return "procedimentos";
  if (value.includes("mental")) return "saude-mental";
  if (value.includes("gestao") || value.includes("administra")) return "gestao";
  if (value.includes("coletiva") || value.includes("epidemi") || value.includes("politica") || value.includes("vigilancia")) return "saude-coletiva";
  if (value.includes("sus") || value.includes("legislacao") || value.includes("saude publica")) return "sus";
  return "pratica-clinica";
}

function inferCognitiveType(question: ExamQuestion): QuestionCognitiveType {
  const text = normalizeText(`${question.question} ${question.category}`);
  if (/paciente|gestante|recem-nasc|crianca|adulto|idoso|sintoma|exame fisico|caso clinico|conduta/.test(text)) return "clinical_reasoning";
  if (/dose|mg|mcg|ml|valor de referencia|quantos|lei |art\.|resolucao|prazo|frequencia|percentual/.test(text)) return "factual";
  return "protocol";
}

function inferSourceType(question: ExamQuestion): QuestionSourceType {
  if (question.sourceType) return question.sourceType;
  return question.examSource ? "adapted" : "authorial";
}

function addMissingOptions(options: string[]): { options: string[]; generatedOptionIndexes: number[] } {
  const cleaned = options.map((option) => String(option).trim()).filter(Boolean);
  const generatedOptionIndexes: number[] = [];
  while (cleaned.length < 5) {
    generatedOptionIndexes.push(cleaned.length);
    cleaned.push(GENERATED_DISTRACTOR);
  }
  return { options: cleaned.slice(0, 5), generatedOptionIndexes };
}

export function normalizeExamQuestion(question: LegacyExamQuestion): ExamQuestion {
  const { options, generatedOptionIndexes } = addMissingOptions(question.options || []);
  const cognitiveType = question.cognitiveType || inferCognitiveType(question);
  const contentStatus: QuestionContentStatus = question.contentStatus || "draft";
  const sourceType = inferSourceType(question);
  const needsClinicalReview = cognitiveType === "clinical_reasoning" && !question.clinicalCase;
  const requiresReview = Boolean(
    question.requiresReview
      || generatedOptionIndexes.length > 0
      || needsClinicalReview
      || contentStatus !== "published",
  );

  return {
    ...question,
    options,
    categoryKey: question.categoryKey || categoryKeyFromLabel(question.category),
    cognitiveType,
    contentStatus,
    contentVersion: question.contentVersion || "1",
    sourceType,
    generatedOptionIndexes: generatedOptionIndexes.length > 0 ? generatedOptionIndexes : question.generatedOptionIndexes,
    requiresReview,
    pool: question.pool || "study",
    scope: question.scope || (categoryKeyFromLabel(question.category) === "sus" || categoryKeyFromLabel(question.category) === "saude-coletiva" ? "general" : "specific"),
  };
}

export function normalizeQuestionBank(questions: LegacyExamQuestion[]): ExamQuestion[] {
  return questions.map(normalizeExamQuestion);
}

