import { ExamQuestion } from "../types";

export function isApprovedStudyQuestion(question: ExamQuestion): boolean {
  return question.contentStatus === "published"
    && !question.requiresReview
    && question.options.length === 5
    && !question.generatedOptionIndexes?.length;
}

export function filterApprovedStudyQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  return questions.filter(isApprovedStudyQuestion);
}

export function getStudyContentAvailabilityMessage(availableCount: number): string {
  if (availableCount > 0) {
    return `${availableCount} questão(ões) publicadas e aprovadas estão disponíveis para este treino.`;
  }
  return "O banco de questões está aguardando revisão humana antes de ser liberado para estudo.";
}
