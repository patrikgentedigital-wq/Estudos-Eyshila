import { describe, expect, it } from "vitest";
import {
  buildExamAttemptCreationRpcParams,
  buildExamSubmissionRpcParams,
  isAlreadySubmittedRpcError,
} from "../src/utils/examPersistence";

describe("atomic exam persistence payloads", () => {
  it("serializes attempt, items and exposures for one transaction", () => {
    const payload = buildExamAttemptCreationRpcParams({
      userId: "user-1",
      blueprintId: "enare-2026-area-profissional",
      mode: "benchmark",
      totalQuestions: 2,
      noveltyRate: 100,
      validForBenchmark: true,
      selectedQuestions: [
        { id: "q-1", content_version: "v1" },
        { id: "q-2", content_version: "v2" },
      ],
    });

    expect(payload.p_user_id).toBe("user-1");
    expect(payload.p_items).toEqual([
      { question_id: "q-1", question_version: "v1", position: 0 },
      { question_id: "q-2", question_version: "v2", position: 1 },
    ]);
  });

  it("keeps submission writes in one RPC payload", () => {
    const payload = buildExamSubmissionRpcParams({
      userId: "user-1",
      attemptId: "attempt-1",
      submittedAt: "2026-08-20T12:00:00.000Z",
      score: 80,
      answeredQuestions: 2,
      durationSeconds: 120,
      noveltyRate: 100,
      validForBenchmark: true,
      items: [{ question_id: "q-1", selected_position: 0, is_correct: true }],
      exposures: [{ question_id: "q-1", is_correct: true, seen_externally: false }],
    });

    expect(payload.p_attempt_id).toBe("attempt-1");
    expect(payload.p_items).toHaveLength(1);
    expect(payload.p_exposures).toHaveLength(1);
  });

  it("recognizes the database idempotency error", () => {
    expect(isAlreadySubmittedRpcError({ message: "ATTEMPT_ALREADY_SUBMITTED" })).toBe(true);
    expect(isAlreadySubmittedRpcError({ message: "network timeout" })).toBe(false);
  });
});
