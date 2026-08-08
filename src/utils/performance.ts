import { MOCK_QUESTIONS } from "../data";
import { ExamAttempt, ExamQuestion, StudyModule } from "../types";
import {
  StudyPlanRecommendation,
  buildNextStudyPlan,
  calculateTopicPerformance,
} from "./studyEngine";

export interface CalculatedSubject {
  id: string;
  name: string;
  percent: number;
  questionsAnswered: number;
  iconName: string;
  color: string;
  moduleId: string;
}

interface SubjectDefinition extends Omit<CalculatedSubject, "percent" | "questionsAnswered"> {
  matcher: RegExp;
}

const SUBJECTS: SubjectDefinition[] = [
  {
    id: "procedimentos",
    name: "Procedimentos Clínicos / Farmacologia",
    iconName: "Compass",
    color: "text-sky-500 bg-sky-500/10",
    moduleId: "mod-procedimentos",
    matcher: /procedimento|farmacologia|prática clínica|dose|gotejamento/i,
  },
  {
    id: "etica",
    name: "Ética e Legislação COFEN",
    iconName: "ShieldCheck",
    color: "text-amber-500 bg-amber-500/10",
    moduleId: "mod-etica",
    matcher: /ética|cofen|processo de enfermagem/i,
  },
  {
    id: "sus",
    name: "Legislação do SUS / Saúde Coletiva",
    iconName: "BookOpen",
    color: "text-teal-500 bg-teal-500/10",
    moduleId: "mod-sus",
    matcher: /sus|legislação|saúde coletiva|política de saúde/i,
  },
  {
    id: "mulher_crianca",
    name: "Saúde da Mulher e da Criança",
    iconName: "Baby",
    color: "text-sky-500 bg-sky-500/10",
    moduleId: "mod-ciclos",
    matcher: /mulher|criança|gestante|pediatria|ciclos de vida|imunização/i,
  },
  {
    id: "neuro",
    name: "Avaliação Neurológica (AVC)",
    iconName: "Brain",
    color: "text-purple-500 bg-purple-500/10",
    moduleId: "mod-urgencia",
    matcher: /neurol|avc|glasgow/i,
  },
  {
    id: "urgencia",
    name: "Urgência e UTI / Alta Complexidade",
    iconName: "Heart",
    color: "text-rose-500 bg-rose-500/10",
    moduleId: "mod-urgencia",
    matcher: /urgência|emergência|uti|trauma|choque|acls|pcr/i,
  },
];

function getSubjectDefinition(question: ExamQuestion): SubjectDefinition | undefined {
  const searchable = `${question.category} ${question.competencyId || ""} ${question.question}`;
  return SUBJECTS.find((subject) => subject.matcher.test(searchable));
}

export function getSubjectScores(attempts: ExamAttempt[] = []): CalculatedSubject[] {
  const totals = new Map(SUBJECTS.map((subject) => [subject.id, { correct: 0, total: 0 }]));

  attempts.forEach((attempt) => {
    (attempt.questions || []).forEach((question, index) => {
      const selectedAnswer = attempt.selectedAnswers?.[index];
      if (selectedAnswer === undefined) return;
      const subject = getSubjectDefinition(question);
      if (!subject) return;
      const aggregate = totals.get(subject.id);
      if (!aggregate) return;
      aggregate.total += 1;
      if (selectedAnswer === question.correctIndex) aggregate.correct += 1;
    });
  });

  return SUBJECTS.map(({ matcher: _matcher, ...subject }) => {
    const aggregate = totals.get(subject.id) || { correct: 0, total: 0 };
    return {
      ...subject,
      questionsAnswered: aggregate.total,
      percent: aggregate.total > 0 ? Math.round((aggregate.correct / aggregate.total) * 100) : 0,
    };
  });
}

export interface Recommendation {
  subject: CalculatedSubject;
  recommendedModule: StudyModule;
  reason: string;
  studyPlan: StudyPlanRecommendation;
}

function moduleForTopic(topicName: string, modules: StudyModule[]): StudyModule {
  const subject = SUBJECTS.find((candidate) => candidate.matcher.test(topicName));
  return modules.find((module) => module.id === subject?.moduleId)
    || modules.find((module) => new RegExp(module.category, "i").test(topicName))
    || modules[0];
}

export function getStudyRecommendation(
  attempts: ExamAttempt[] = [],
  modules: StudyModule[] = [],
): Recommendation | null {
  if (modules.length === 0) return null;

  const prioritizedTopics = calculateTopicPerformance(attempts, MOCK_QUESTIONS);
  const studyPlan = buildNextStudyPlan(prioritizedTopics[0]);
  if (!studyPlan) return null;

  const recommendedModule = moduleForTopic(studyPlan.topic.name, modules);
  const subject = getSubjectScores(attempts).find((item) => item.moduleId === recommendedModule.id)
    || {
      id: studyPlan.topic.id,
      name: studyPlan.topic.name,
      percent: studyPlan.topic.accuracy ?? 0,
      questionsAnswered: studyPlan.topic.attempts,
      iconName: "BookOpen",
      color: "text-sky-500 bg-sky-500/10",
      moduleId: recommendedModule.id,
    };

  const action = `${studyPlan.questionCount} questões`
    + (studyPlan.vignetteCount > 0 ? `, ${studyPlan.vignetteCount} caso(s) clínico(s)` : "")
    + (studyPlan.flashcardCount > 0 ? ` e ${studyPlan.flashcardCount} flashcards` : "");

  return {
    subject,
    recommendedModule,
    studyPlan,
    reason: `${studyPlan.reason} Próxima sessão: ${action}, em aproximadamente ${studyPlan.estimatedMinutes} minutos.`,
  };
}
