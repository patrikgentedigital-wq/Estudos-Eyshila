import { describe, expect, it } from "vitest";
import { ExamQuestion } from "../src/types";
import {
  filterApprovedStudyQuestions,
  getStudyContentAvailabilityMessage,
  isApprovedStudyQuestion,
} from "../src/utils/contentPolicy";

const makeQuestion = (id: string, overrides: Partial<ExamQuestion> = {}): ExamQuestion => ({
  id,
  question: `Questão ${id}`,
  options: ["A", "B", "C", "D", "E"],
  correctIndex: 0,
  explanation: "Explicação revisada",
  category: "Prática Clínica",
  contentStatus: "published",
  requiresReview: false,
  ...overrides,
});

describe("content policy", () => {
  it("only allows published content without review flags in study mode", () => {
    const approved = makeQuestion("approved");
    const draft = makeQuestion("draft", { contentStatus: "draft" });
    const flagged = makeQuestion("flagged", { requiresReview: true });
    const generated = makeQuestion("generated", { generatedOptionIndexes: [4] });

    expect(isApprovedStudyQuestion(approved)).toBe(true);
    expect(isApprovedStudyQuestion(draft)).toBe(false);
    expect(isApprovedStudyQuestion(flagged)).toBe(false);
    expect(isApprovedStudyQuestion(generated)).toBe(false);
    expect(filterApprovedStudyQuestions([approved, draft, flagged, generated])).toEqual([approved]);
  });

  it("returns an explicit message when the local bank is waiting for review", () => {
    expect(getStudyContentAvailabilityMessage(0)).toContain("revisão humana");
  });
});
