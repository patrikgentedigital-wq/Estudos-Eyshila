import { MOCK_QUESTIONS } from "../src/data.ts";
import { REAL_EXAMS } from "../src/data/realExams.ts";
import { validateQuestionBank } from "../src/utils/questionValidation.ts";

const questions = [
  ...MOCK_QUESTIONS,
  ...REAL_EXAMS.flatMap((exam) => exam.questions),
];
const issues = validateQuestionBank(questions);
const errors = issues.filter((issue) => issue.severity === "error");
const warnings = issues.filter((issue) => issue.severity === "warning");

console.log(`Questões validadas: ${questions.length}`);
console.log(`Erros: ${errors.length} | Avisos de revisão: ${warnings.length}`);

for (const issue of issues) {
  console.log(`${issue.severity === "error" ? "ERROR" : "WARN"} ${issue.questionId}: ${issue.message}`);
}

if (errors.length > 0) process.exitCode = 1;

