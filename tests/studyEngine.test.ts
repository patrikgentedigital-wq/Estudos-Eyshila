import { describe, expect, it } from "vitest";
import { ExamQuestion, Flashcard, QuestionExposure } from "../src/types";
import {
  ENARE_2026_BLUEPRINT,
  buildNextStudyPlan,
  calculateNoveltyRate,
  calculateTopicPerformance,
  eligibleQuestionsForMode,
  inferQuestionScope,
  isValidBenchmarkForm,
  scheduleCadernoErrorReview,
  scheduleFlashcardReview,
} from "../src/utils/studyEngine";

const baseCard: Flashcard = {
  id: "card-1",
  question: "Qual a dose?",
  answer: "10 mg",
  category: "Farmacologia",
  difficulty: "Medium",
  cognitiveType: "factual",
  criticality: 3,
};

const makeQuestion = (id: string, overrides: Partial<ExamQuestion> = {}): ExamQuestion => ({
  id,
  question: `Questão ${id}`,
  options: ["A", "B", "C", "D", "E"],
  correctIndex: 0,
  explanation: "Explicação",
  category: "Prática Clínica",
  scope: "specific",
  pool: "study",
  ...overrides,
});

describe("study engine", () => {
  it("resets repetitions and records a lapse after a failed recall", () => {
    const reviewed = scheduleFlashcardReview(
      { ...baseCard, repetitions: 4, intervalDays: 20, easeFactor: 2.5 },
      "again",
      new Date("2026-08-04T12:00:00.000Z"),
    );

    expect(reviewed.repetitions).toBe(0);
    expect(reviewed.intervalDays).toBe(1);
    expect(reviewed.lapses).toBe(1);
    expect(reviewed.nextReview).toBe("2026-08-05");
    expect(reviewed.easeFactor).toBeLessThan(2.5);
  });

  it("uses SM-2 growth and cognitive multipliers after successful reviews", () => {
    const reviewed = scheduleFlashcardReview(
      { ...baseCard, repetitions: 2, intervalDays: 6, easeFactor: 2.5 },
      "good",
      new Date("2026-08-04T12:00:00.000Z"),
    );

    expect(reviewed.repetitions).toBe(3);
    expect(reviewed.intervalDays).toBeGreaterThan(6);
    expect(reviewed.lastQuality).toBe(4);
  });

  it("reviews factual high-risk content sooner than clinical reasoning", () => {
    const factual = scheduleFlashcardReview(
      { ...baseCard, repetitions: 1, cognitiveType: "factual", criticality: 3 },
      "good",
      new Date("2026-08-04T12:00:00.000Z"),
    );
    const clinical = scheduleFlashcardReview(
      { ...baseCard, repetitions: 1, cognitiveType: "clinical_reasoning", criticality: 1 },
      "good",
      new Date("2026-08-04T12:00:00.000Z"),
    );

    expect(factual.intervalDays).toBeLessThan(clinical.intervalDays || 0);
  });

  it("applies the adaptive schedule to notebook errors", () => {
    const reviewed = scheduleCadernoErrorReview({
      id: "error-1",
      questionText: "Qual é a dose?",
      correctAnswer: "10 mg",
      explanation: "Dose de referência",
      category: "Farmacologia",
      dateAdded: "2026-08-01T12:00:00.000Z",
      repetitions: 3,
      intervalDays: 12,
    }, "again", undefined, new Date("2026-08-04T12:00:00.000Z"));

    expect(reviewed.repetitions).toBe(0);
    expect(reviewed.lapses).toBe(1);
    expect(reviewed.nextReview).toBe("2026-08-05");
  });

  it("keeps assessment questions out of study and seen questions out of benchmark", () => {
    const questions = [
      makeQuestion("study", { pool: "study" }),
      makeQuestion("assessment-new", { pool: "assessment" }),
      makeQuestion("assessment-seen", { pool: "assessment" }),
    ];
    const exposures: QuestionExposure[] = [{
      id: "exp-1",
      questionId: "assessment-seen",
      shownAt: "2026-08-04T12:00:00.000Z",
      mode: "benchmark",
    }];

    expect(eligibleQuestionsForMode(questions, "study", exposures).map((question) => question.id)).toEqual(["study"]);
    expect(eligibleQuestionsForMode(questions, "practice", exposures).map((question) => question.id)).toEqual(["study"]);
    expect(eligibleQuestionsForMode(questions, "benchmark", exposures).map((question) => question.id)).toEqual(["assessment-new"]);
    expect(calculateNoveltyRate(["assessment-new", "assessment-seen"], exposures)).toBe(50);
  });

  it("does not misclassify professional nursing ethics as a general competency", () => {
    expect(inferQuestionScope(makeQuestion("sus", { category: "Legislação SUS", scope: undefined }))).toBe("general");
    expect(inferQuestionScope(makeQuestion("ethics", {
      category: "Ética e Gestão",
      question: "Segundo o COFEN, qual é o dever do enfermeiro?",
      scope: undefined,
    }))).toBe("specific");
  });

  it("does not call a short or contaminated form an ENARE benchmark", () => {
    const shortForm = Array.from({ length: 10 }, (_, index) => makeQuestion(`q-${index}`, { pool: "assessment" }));
    expect(isValidBenchmarkForm(shortForm, "benchmark", 100)).toBe(false);

    const fullForm = [
      ...Array.from({ length: 20 }, (_, index) => makeQuestion(`g-${index}`, { scope: "general", pool: "assessment" })),
      ...Array.from({ length: 80 }, (_, index) => makeQuestion(`s-${index}`, { scope: "specific", pool: "assessment" })),
    ];
    expect(fullForm).toHaveLength(ENARE_2026_BLUEPRINT.questionCount);
    expect(isValidBenchmarkForm(fullForm, "benchmark", 100)).toBe(true);
    expect(isValidBenchmarkForm(fullForm, "benchmark", 99)).toBe(false);
  });

  it("recommends a diagnostic when evidence for a topic is still sparse", () => {
    const questions = [makeQuestion("q-1", { competencyId: "seguranca", category: "Segurança do paciente" })];
    const topics = calculateTopicPerformance([], questions, new Date("2026-08-04T12:00:00.000Z"));
    const plan = buildNextStudyPlan(topics[0]);

    expect(plan?.questionCount).toBe(10);
    expect(plan?.reason).toContain("poucos dados");
  });
});
