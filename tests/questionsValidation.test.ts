import { describe, expect, it } from "vitest";
import { MOCK_QUESTIONS } from "../src/data";
import { REAL_EXAMS } from "../src/data/realExams";
import { validateQuestionBank } from "../src/utils/questionValidation";

describe("question bank validation", () => {
  it("normalizes every local question to five unique alternatives", () => {
    const questions = [...MOCK_QUESTIONS, ...REAL_EXAMS.flatMap((exam) => exam.questions)];
    const issues = validateQuestionBank(questions);

    expect(questions.length).toBeGreaterThan(0);
    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(questions.every((question) => question.options.length === 5)).toBe(true);
  });

  it("keeps generated or unreviewed content out of published assessment", () => {
    const questions = [...MOCK_QUESTIONS, ...REAL_EXAMS.flatMap((exam) => exam.questions)];
    expect(questions.every((question) => question.pool !== "assessment")).toBe(true);
    expect(questions.every((question) => question.contentStatus !== "published")).toBe(true);
  });
});

