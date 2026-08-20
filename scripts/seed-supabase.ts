import crypto from "node:crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { MOCK_QUESTIONS } from "../src/data.ts";
import { REAL_EXAMS } from "../src/data/realExams.ts";
import { buildSeedQuestionRows, isQuestionEligibleForSeed } from "../src/utils/seedContract.ts";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY antes de executar o seed.");
}

const allQuestions = [...MOCK_QUESTIONS, ...REAL_EXAMS.flatMap((exam) => exam.questions)];
const questions = allQuestions.filter(isQuestionEligibleForSeed);

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
  }

  const rows = buildSeedQuestionRows(question, clinicalCaseId);

  if (rows.clinicalCase) {
    const { error } = await admin.from("clinical_cases").upsert(rows.clinicalCase);
    if (error) throw new Error(`Falha ao inserir caso ${question.id}: ${error.message}`);
  }

  // A published row is first downgraded to draft so its protected components
  // can be replaced safely. The final publish happens only after all rows are
  // present and the database trigger can validate them together.
  const { error: questionError } = await admin.from("questions").upsert(rows.questionDraft);
  if (questionError) throw new Error(`Falha ao inserir questão ${question.id}: ${questionError.message}`);

  const { error: clearAnswerKeyError } = await admin.from("question_answer_keys").delete().eq("question_id", question.id);
  if (clearAnswerKeyError) throw new Error(`Falha ao preparar gabarito ${question.id}: ${clearAnswerKeyError.message}`);

  const { error: clearOptionsError } = await admin.from("question_options").delete().eq("question_id", question.id);
  if (clearOptionsError) throw new Error(`Falha ao preparar alternativas ${question.id}: ${clearOptionsError.message}`);

  const { error: optionsError } = await admin.from("question_options").insert(rows.options);
  if (optionsError) throw new Error(`Falha ao inserir alternativas ${question.id}: ${optionsError.message}`);

  const { error: answerError } = await admin.from("question_answer_keys").insert(rows.answerKey);
  if (answerError) throw new Error(`Falha ao inserir gabarito ${question.id}: ${answerError.message}`);

  if (rows.clinicalCasePublish) {
    const { error: publishCaseError } = await admin
      .from("clinical_cases")
      .update(rows.clinicalCasePublish)
      .eq("id", rows.clinicalCasePublish.id);
    if (publishCaseError) throw new Error(`Falha ao publicar caso ${question.id}: ${publishCaseError.message}`);
  }

  const { error: publishQuestionError } = await admin
    .from("questions")
    .update(rows.questionPublish)
    .eq("id", rows.questionPublish.id);
  if (publishQuestionError) throw new Error(`Falha ao publicar questão ${question.id}: ${publishQuestionError.message}`);
}

console.log(`Seed concluído com ${questions.length} questões publicadas e revisadas.`);
