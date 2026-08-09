import crypto from "node:crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { MOCK_QUESTIONS } from "../src/data.ts";
import { REAL_EXAMS } from "../src/data/realExams.ts";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY antes de executar o seed.");
}

const questions = [...MOCK_QUESTIONS, ...REAL_EXAMS.flatMap((exam) => exam.questions)]
  .filter((question) => question.contentStatus === "published" && !question.requiresReview);

if (questions.length === 0) {
  throw new Error("Nenhuma questão publicada e revisada está disponível para seed. Revise o conteúdo antes de popular o benchmark.");
}

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const question of questions) {
  let clinicalCaseId: string | null = null;
  if (question.clinicalCase) {
    const caseHash = crypto.createHash("sha256").update(`clinical-case:${question.id}`).digest("hex");
    clinicalCaseId = `${caseHash.slice(0, 8)}-${caseHash.slice(8, 12)}-${caseHash.slice(12, 16)}-${caseHash.slice(16, 20)}-${caseHash.slice(20, 32)}`;
    const { error } = await admin.from("clinical_cases").upsert({
      id: clinicalCaseId,
      setting: question.clinicalCase.setting,
      age_group: question.clinicalCase.ageGroup,
      presenting_problem: question.clinicalCase.presentingProblem,
      history: question.clinicalCase.history,
      physical_exam: question.clinicalCase.physicalExam,
      vitals: question.clinicalCase.vitals || {},
      labs: question.clinicalCase.labs || {},
      timeline: question.clinicalCase.timeline || [],
      source: question.sourceUrl || question.examSource,
      content_version: question.contentVersion || "1",
      content_status: question.contentStatus,
      reviewed_by: question.reviewedBy,
      reviewed_at: question.reviewedAt,
    });
    if (error) throw new Error(`Falha ao inserir caso ${question.id}: ${error.message}`);
  }

  const { error: questionError } = await admin.from("questions").upsert({
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
    source: question.sourceUrl || question.examSource || null,
    source_review_due_at: question.sourceReviewDueAt || null,
    content_status: question.contentStatus,
    reviewed_by: question.reviewedBy || null,
    reviewed_at: question.reviewedAt || null,
    is_active: true,
  });
  if (questionError) throw new Error(`Falha ao inserir questão ${question.id}: ${questionError.message}`);

  const { error: optionsError } = await admin.from("question_options").upsert(
    question.options.map((option, position) => ({ question_id: question.id, position, option_text: option })),
    { onConflict: "question_id,position" },
  );
  if (optionsError) throw new Error(`Falha ao inserir alternativas ${question.id}: ${optionsError.message}`);

  const { error: answerError } = await admin.from("question_answer_keys").upsert({
    question_id: question.id,
    correct_position: question.correctIndex,
    explanation: question.explanation,
    pivotal_cues: question.pivotalCues || [],
    reasoning_steps: question.reasoningSteps || [],
    distractor_explanations: question.distractorExplanations || [],
  });
  if (answerError) throw new Error(`Falha ao inserir gabarito ${question.id}: ${answerError.message}`);
}

console.log(`Seed concluído com ${questions.length} questões publicadas e revisadas.`);
