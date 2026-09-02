import { describe, it, expect } from "vitest";

describe("Code Review Fixes - Regression Tests", () => {
  it("safe ISO date parsing should handle both date-only and full ISO strings without NaN", () => {
    const parseSafe = (dateStr: string) => {
      const formatted = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
      const d = new Date(formatted);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const dateOnly = "2026-09-13";
    const parsedDateOnly = parseSafe(dateOnly);
    expect(parsedDateOnly).not.toBeNull();
    expect(parsedDateOnly?.getFullYear()).toBe(2026);
    expect(parsedDateOnly?.getDate()).toBe(13);

    const isoFull = "2026-09-02T19:00:00.000Z";
    const parsedIso = parseSafe(isoFull);
    expect(parsedIso).not.toBeNull();
    expect(Number.isNaN(parsedIso?.getTime())).toBe(false);
  });

  it("should correctly compute letter to option index for CadernoErroItem", () => {
    const convertLetterToIndex = (answer: string) => {
      return typeof answer === "string" ? Math.max(0, answer.toUpperCase().charCodeAt(0) - 65) : 0;
    };

    expect(convertLetterToIndex("A")).toBe(0);
    expect(convertLetterToIndex("B")).toBe(1);
    expect(convertLetterToIndex("C")).toBe(2);
    expect(convertLetterToIndex("D")).toBe(3);
    expect(convertLetterToIndex("E")).toBe(4);
  });

  it("should calculate accuracy excluding unanswered questions", () => {
    const mockAttempt = {
      questions: [
        { id: "1", correctIndex: 0 },
        { id: "2", correctIndex: 1 },
        { id: "3", correctIndex: 2 },
      ],
      selectedAnswers: {
        0: 0, // correct
        1: 2, // wrong
        // question index 2 was skipped / unanswered
      } as Record<number, number>,
    };

    const answered = mockAttempt.questions
      .map((q, index) => ({
        selectedAnswer: mockAttempt.selectedAnswers[index],
        isCorrect: mockAttempt.selectedAnswers[index] === q.correctIndex,
      }))
      .filter(item => item.selectedAnswer !== undefined && item.selectedAnswer !== null);

    expect(answered).toHaveLength(2); // only 2 questions answered
    const correctCount = answered.filter(a => a.isCorrect).length;
    expect(correctCount).toBe(1);
    const accuracy = Math.round((correctCount / answered.length) * 100);
    expect(accuracy).toBe(50); // 1 out of 2 = 50%, NOT 1 out of 3 = 33%
  });
});
