import { ExamMode } from "../types";

export interface SelectedQuestionForAttempt {
  id: string;
  content_version?: string | null;
}

export interface ExamAttemptCreationRpcParams {
  p_user_id: string;
  p_blueprint_id: string;
  p_mode: ExamMode;
  p_total_questions: number;
  p_novelty_rate: number;
  p_valid_for_benchmark: boolean;
  p_items: Array<{ question_id: string; question_version: string; position: number }>;
}

export function buildExamAttemptCreationRpcParams(args: {
  userId: string;
  blueprintId: string;
  mode: ExamMode;
  totalQuestions: number;
  noveltyRate: number;
  validForBenchmark: boolean;
  selectedQuestions: SelectedQuestionForAttempt[];
}): ExamAttemptCreationRpcParams {
  return {
    p_user_id: args.userId,
    p_blueprint_id: args.blueprintId,
    p_mode: args.mode,
    p_total_questions: args.totalQuestions,
    p_novelty_rate: args.noveltyRate,
    p_valid_for_benchmark: args.validForBenchmark,
    p_items: args.selectedQuestions.map((question, position) => ({
      question_id: question.id,
      question_version: question.content_version || "1",
      position,
    })),
  };
}

export interface ExamSubmissionItemRpcPayload {
  question_id: string;
  selected_position: number | null;
  response_ms: number | null;
  confidence: number | null;
  is_correct: boolean;
  seen_externally: boolean;
  answered_at: string | null;
}

export interface ExamSubmissionExposureRpcPayload {
  question_id: string;
  answered_at: string | null;
  is_correct: boolean;
  response_ms: number | null;
  confidence: number | null;
  seen_externally: boolean;
}

export interface ExamSubmissionRpcParams {
  p_user_id: string;
  p_attempt_id: string;
  p_submitted_at: string;
  p_score: number;
  p_answered_questions: number;
  p_duration_seconds: number;
  p_novelty_rate: number;
  p_valid_for_benchmark: boolean;
  p_items: ExamSubmissionItemRpcPayload[];
  p_exposures: ExamSubmissionExposureRpcPayload[];
}

export function buildExamSubmissionRpcParams(args: {
  userId: string;
  attemptId: string;
  submittedAt: string;
  score: number;
  answeredQuestions: number;
  durationSeconds: number;
  noveltyRate: number;
  validForBenchmark: boolean;
  items: Array<Partial<ExamSubmissionItemRpcPayload> & Pick<ExamSubmissionItemRpcPayload, "question_id">>;
  exposures: Array<Partial<ExamSubmissionExposureRpcPayload> & Pick<ExamSubmissionExposureRpcPayload, "question_id">>;
}): ExamSubmissionRpcParams {
  return {
    p_user_id: args.userId,
    p_attempt_id: args.attemptId,
    p_submitted_at: args.submittedAt,
    p_score: args.score,
    p_answered_questions: args.answeredQuestions,
    p_duration_seconds: args.durationSeconds,
    p_novelty_rate: args.noveltyRate,
    p_valid_for_benchmark: args.validForBenchmark,
    p_items: args.items.map((item) => ({
      question_id: item.question_id,
      selected_position: item.selected_position ?? null,
      response_ms: item.response_ms ?? null,
      confidence: item.confidence ?? null,
      is_correct: item.is_correct ?? false,
      seen_externally: item.seen_externally ?? false,
      answered_at: item.answered_at ?? null,
    })),
    p_exposures: args.exposures.map((exposure) => ({
      question_id: exposure.question_id,
      answered_at: exposure.answered_at ?? null,
      is_correct: exposure.is_correct ?? false,
      response_ms: exposure.response_ms ?? null,
      confidence: exposure.confidence ?? null,
      seen_externally: exposure.seen_externally ?? false,
    })),
  };
}

export function isAlreadySubmittedRpcError(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "message" in error
    && String((error as { message?: unknown }).message).includes("ATTEMPT_ALREADY_SUBMITTED");
}
