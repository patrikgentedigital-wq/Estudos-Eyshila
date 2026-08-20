import { ExamQuestion } from "../types";

type SeedClinicalCase = {
  id: string;
  setting?: string;
  age_group?: string;
  presenting_problem?: string;
  history?: string;
  physical_exam?: string;
  vitals: Record<string, string>;
  labs: Record<string, string>;
  timeline: string[];
  source: string | null;
  content_version: string;
  content_status: "draft" | "published";
  reviewed_by: string | null;
  reviewed_at: string | null;
};

type SeedQuestion = Record<string, unknown> & {
  id: string;
  content_status: "draft" | "published";
  reviewed_by: string | null;
  reviewed_at: string | null;
};

export interface SeedQuestionRows {
  clinicalCase: SeedClinicalCase | null;
  questionDraft: SeedQuestion;
  options: Array<{ question_id: string; position: number; option_text: string }>;
  answerKey: {
    question_id: string;
    correct_position: number;
    explanation: string;
    pivotal_cues: string[];
    reasoning_steps: string[];
    distractor_explanations: string[];
  };
  clinicalCasePublish: { id: string; content_status: "published"; reviewed_by: string | null; reviewed_at: string | null } | null;
  questionPublish: { id: string; content_status: "published"; reviewed_by: string | null; reviewed_at: string | null };
}

function fallbackDistractorExplanations(question: ExamQuestion): string[] {
  return question.options.map((_, index) => (
    index === question.correctIndex
      ? "Alternativa correta conforme a justificativa revisada."
      : "Distrator documentado no material de revisão; confirme a justificativa na fonte informada."
  ));
}

export function isQuestionEligibleForSeed(question: ExamQuestion): boolean {
  return question.contentStatus === "published"
    && !question.requiresReview
    && question.options.length === 5
    && new Set(question.options.map((option) => option.trim().toLocaleLowerCase())).size === 5
    && Boolean(question.sourceUrl || question.examSource)
    && Boolean(question.reviewedBy && question.reviewedAt)
    && (!question.generatedOptionIndexes || question.generatedOptionIndexes.length === 0)
    && Boolean(question.distractorExplanations && question.distractorExplanations.length === 5)
    && (question.pool !== "assessment" || Boolean(question.familyId))
    && (question.cognitiveType !== "clinical_reasoning" || Boolean(question.clinicalCase && question.pivotalCues?.length && question.reasoningSteps?.length));
}

export function buildSeedQuestionRows(question: ExamQuestion, clinicalCaseId: string | null): SeedQuestionRows {
  const source = question.sourceUrl || question.examSource || null;
  const reviewedBy = question.reviewedBy || null;
  const reviewedAt = question.reviewedAt || null;
  const clinicalCase = question.clinicalCase && clinicalCaseId
    ? {
        id: clinicalCaseId,
        setting: question.clinicalCase.setting,
        age_group: question.clinicalCase.ageGroup,
        presenting_problem: question.clinicalCase.presentingProblem,
        history: question.clinicalCase.history,
        physical_exam: question.clinicalCase.physicalExam,
        vitals: question.clinicalCase.vitals || {},
        labs: question.clinicalCase.labs || {},
        timeline: question.clinicalCase.timeline || [],
        source,
        content_version: question.contentVersion || "1",
        content_status: "draft" as const,
        reviewed_by: null,
        reviewed_at: null,
      }
    : null;

  const questionDraft: SeedQuestion = {
    id: question.id,
    clinical_case_id: clinicalCaseId,
    primary_competency_id: question.competencyId || null,
    stem: question.question,
    lead_in: question.leadIn || null,
    category: question.category,
    scope: question.scope || "specific",
    cognitive_type: question.cognitiveType || "factual",
    criticality: question.criticality || 1,
    pool: question.pool || "study",
    authored_difficulty: question.authoredDifficulty || 2,
    family_id: question.familyId || null,
    content_version: question.contentVersion || "1",
    source,
    source_review_due_at: question.sourceReviewDueAt || null,
    content_status: "draft",
    reviewed_by: null,
    reviewed_at: null,
    is_active: true,
  };

  return {
    clinicalCase,
    questionDraft,
    options: question.options.map((option, position) => ({
      question_id: question.id,
      position,
      option_text: option,
    })),
    answerKey: {
      question_id: question.id,
      correct_position: question.correctIndex,
      explanation: question.explanation,
      pivotal_cues: question.pivotalCues || [],
      reasoning_steps: question.reasoningSteps || [],
      distractor_explanations: question.distractorExplanations?.length === 5
        ? question.distractorExplanations
        : fallbackDistractorExplanations(question),
    },
    clinicalCasePublish: clinicalCase
      ? { id: clinicalCase.id, content_status: "published" as const, reviewed_by: reviewedBy, reviewed_at: reviewedAt }
      : null,
    questionPublish: { id: question.id, content_status: "published", reviewed_by: reviewedBy, reviewed_at: reviewedAt },
  };
}
