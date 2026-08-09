import { ExamQuestion, QuestionContentStatus } from "../types";

export type QuestionValidationSeverity = "error" | "warning";

export interface QuestionValidationIssue {
  questionId: string;
  severity: QuestionValidationSeverity;
  message: string;
}

export function validateQuestionBank(
  questions: ExamQuestion[],
  options: { strictPublished?: boolean } = {},
): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = [];
  const strictPublished = options.strictPublished ?? true;

  for (const question of questions) {
    const add = (severity: QuestionValidationSeverity, message: string) => {
      issues.push({ questionId: question.id, severity, message });
    };

    if (question.options.length !== 5) add("error", "deve possuir exatamente 5 alternativas");
    if (question.options.some((option) => !String(option).trim())) add("error", "possui alternativa vazia");
    const normalizedOptions = question.options.map((option) => option.trim().toLocaleLowerCase());
    if (new Set(normalizedOptions).size !== normalizedOptions.length) add("error", "possui alternativas duplicadas");
    if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 4) {
      add("error", "possui correctIndex fora do intervalo 0-4");
    }
    if (!question.explanation?.trim()) add("error", "não possui explicação");
    if (!question.categoryKey) add("error", "não possui categoryKey estável");
    if (!question.cognitiveType) add("error", "não possui cognitiveType");
    if (!question.contentStatus) add("error", "não possui contentStatus");
    if (!question.contentVersion) add("error", "não possui contentVersion");
    if (!question.sourceType) add("error", "não possui sourceType");

    const status: QuestionContentStatus = question.contentStatus || "draft";
    const published = status === "published" || question.pool === "assessment";
    if (question.sourceType === "official" && !question.sourceUrl) {
      add(published && strictPublished ? "error" : "warning", "conteúdo oficial sem sourceUrl");
    }
    if (published && (!question.reviewedBy || !question.reviewedAt)) {
      add(strictPublished ? "error" : "warning", "conteúdo publicado sem revisão humana registrada");
    }
    if (published && (question.generatedOptionIndexes?.length || question.requiresReview)) {
      add(strictPublished ? "error" : "warning", "conteúdo publicado ainda possui pendências de revisão");
    }
    if (question.cognitiveType === "clinical_reasoning" && !question.clinicalCase) {
      add(published && strictPublished ? "error" : "warning", "questão clínica sem caso estruturado");
    }
    if (question.requiresReview && !published) {
      add("warning", "questão disponível apenas como material de estudo e requer revisão");
    }
  }

  return issues;
}

