import { describe, expect, it } from "vitest";
import { ExamQuestion } from "../src/types";
import { buildSeedQuestionRows } from "../src/utils/seedContract";

const question: ExamQuestion = {
  id: "q-seed-1",
  question: "Qual conduta é indicada?",
  options: ["A", "B", "C", "D", "E"],
  correctIndex: 2,
  explanation: "Justificativa da resposta correta.",
  category: "Urgência e UTI",
  scope: "specific",
  pool: "study",
  cognitiveType: "clinical_reasoning",
  criticality: 2,
  contentVersion: "v1",
  contentStatus: "published",
  sourceUrl: "https://example.com/fonte",
  reviewedBy: "revisor@example.com",
  reviewedAt: "2026-08-20T12:00:00.000Z",
  clinicalCase: {
    setting: "UPA",
    ageGroup: "Adulto",
    presentingProblem: "Dispneia",
  },
  pivotalCues: ["Sinal decisivo"],
  reasoningSteps: ["Passo de raciocínio"],
};

describe("Supabase seed contract", () => {
  it("loads components as draft and publishes only after all dependencies exist", () => {
    const rows = buildSeedQuestionRows(question, "00000000-0000-0000-0000-000000000001");

    expect(rows.clinicalCase?.content_status).toBe("draft");
    expect(rows.questionDraft.content_status).toBe("draft");
    expect(rows.options).toHaveLength(5);
    expect(rows.answerKey.correct_position).toBe(2);
    expect(rows.answerKey.distractor_explanations).toHaveLength(5);
    expect(rows.clinicalCasePublish.content_status).toBe("published");
    expect(rows.questionPublish.content_status).toBe("published");
    expect(rows.questionPublish.reviewed_by).toBe("revisor@example.com");
  });
});
