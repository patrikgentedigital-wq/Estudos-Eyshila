export type Language = "pt" | "en";

export type Tab = "dashboard" | "modules" | "exams" | "flashcards" | "performance" | "settings" | "ai-study" | "roadmap";

export type ExamMode = "study" | "practice" | "benchmark";
export type QuestionCognitiveType = "factual" | "protocol" | "clinical_reasoning";
export type QuestionPool = "study" | "assessment" | "calibration";
export type QuestionScope = "general" | "specific";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type QuestionSourceType = "official" | "authorial" | "adapted";
export type QuestionContentStatus = "draft" | "reviewed" | "published";
export type QuestionCategoryKey =
  | "sus"
  | "saude-coletiva"
  | "etica-cofen"
  | "urgencia-uti"
  | "ciclos-de-vida"
  | "pratica-clinica"
  | "farmacologia"
  | "procedimentos"
  | "saude-mental"
  | "gestao";

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategoryKey, string> = {
  sus: "Legislação SUS",
  "saude-coletiva": "Saúde Coletiva",
  "etica-cofen": "Ética e COFEN",
  "urgencia-uti": "Urgência e UTI",
  "ciclos-de-vida": "Ciclos de Vida",
  "pratica-clinica": "Prática Clínica",
  farmacologia: "Farmacologia",
  procedimentos: "Procedimentos",
  "saude-mental": "Saúde Mental",
  gestao: "Gestão",
};

export interface ClinicalCaseData {
  setting?: string;
  ageGroup?: string;
  presentingProblem?: string;
  history?: string;
  physicalExam?: string;
  vitals?: Record<string, string>;
  labs?: Record<string, string>;
  timeline?: string[];
}

export interface ExamBlueprint {
  id: string;
  name: string;
  board: string;
  cycle: string;
  questionCount: number;
  durationMinutes: number;
  optionsPerQuestion: number;
  generalQuestionCount: number;
  specificQuestionCount: number;
  minimumPassingPercentage: number;
  allowBackNavigation: boolean;
  allowPause: boolean;
  feedbackPolicy: "immediate" | "after_submission";
  sourceUrl: string;
}

export interface QuestionExposure {
  id: string;
  questionId: string;
  shownAt: string;
  mode: ExamMode | "daily" | "errors";
  attemptId?: string;
  correct?: boolean;
  responseMs?: number;
  confidence?: 1 | 2 | 3;
  seenExternally?: boolean;
}

export interface QuestionReviewState {
  questionId: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  lastQuality?: number;
  dueAt?: string;
  competencyDueAt?: string;
  lastReviewedAt?: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoadmapWeek {
  week: number;
  label: string;
  topics: string[];
  tasks: RoadmapTask[];
  status: "locked" | "current" | "completed";
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface CadernoErroItem {
  id: string;
  questionText: string;
  userAnswer?: string;
  correctAnswer?: string;
  options?: string[];
  correctIndex?: number;
  questionId?: string;
  explanation: string;
  category: string;
  dateAdded: string;
  nextReview?: string;
  intervalDays?: number;
  repetitions?: number;
  easeFactor?: number;
  lapses?: number;
  lastQuality?: number;
  lastReviewedAt?: string;
  cognitiveType?: QuestionCognitiveType;
  criticality?: 1 | 2 | 3;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  residencyYear: string;
  focusAreas: string[];
  hoursPerWeek?: number;
  onboarded: boolean;
  avatar: string;
  notifications: {
    reminders: boolean;
    deadlines: boolean;
    approvals: boolean;
  };
}

export interface Lesson {
  id: string;
  title: string;
  titleEn?: string;
  duration: string;
  completed: boolean;
  content: string;
  contentEn?: string;
}

export interface StudyModule {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  description: string;
  descriptionEn?: string;
  iconName: string;
  lessons: Lesson[];
  isOfficial?: boolean;
}

export interface ExamQuestion {
  id: string;
  question: string;
  questionEn?: string;
  answer?: string;
  options: string[];
  optionsEn?: string[];
  correctIndex: number;
  explanation: string;
  explanationEn?: string;
  category: string;
  categoryKey?: QuestionCategoryKey;
  categoryEn?: string;
  examSource?: string;
  examSourceEn?: string;
  leadIn?: string;
  cognitiveType?: QuestionCognitiveType;
  criticality?: 1 | 2 | 3;
  competencyId?: string;
  pool?: QuestionPool;
  scope?: QuestionScope;
  authoredDifficulty?: 1 | 2 | 3;
  familyId?: string;
  contentVersion?: string;
  sourceReviewDueAt?: string;
  clinicalCase?: ClinicalCaseData;
  reasoningSteps?: string[];
  pivotalCues?: string[];
  distractorExplanations?: string[];
  contentStatus?: "draft" | "reviewed" | "published";
  sourceType?: QuestionSourceType;
  sourceUrl?: string;
  sourcePage?: number;
  sourceYear?: number;
  board?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  generatedOptionIndexes?: number[];
  requiresReview?: boolean;
}

export interface ExamAttempt {
  id: string;
  date: string;
  examName: string;
  score: number;
  totalQuestions: number;
  timeSpent: string;
  questions?: ExamQuestion[];
  selectedAnswers?: Record<number, number>;
  responseTimesMs?: Record<number, number>;
  confidenceByQuestion?: Record<number, 1 | 2 | 3>;
  mode?: ExamMode;
  blueprintId?: string;
  noveltyRate?: number;
  validForBenchmark?: boolean;
  feedbackDeferred?: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
  category: string;
  categoryEn?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isOfficial?: boolean;
  isCustom?: boolean;
  authorId?: string;
  nextReview?: string;
  intervalDays?: number;
  repetitions?: number;
  easeFactor?: number;
  lapses?: number;
  lastQuality?: number;
  lastReviewedAt?: string;
  cognitiveType?: QuestionCognitiveType;
  criticality?: 1 | 2 | 3;
}

export interface TranslationDict {
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  forgotPassword: string;
  loginBtn: string;
  supportLink: string;
  welcomeBack: string;
  portalSubtitle: string;
  modulesCompleted: string;
  questionsAnswered: string;
  continueStudying: string;
  resumeBtn: string;
  weeklySchedule: string;
  viewFullCalendar: string;
  navDashboard: string;
  navModules: string;
  navExams: string;
  navFlashcards: string;
  navPerformance: string;
  navAiStudy: string;
  navSettings: string;
  navRoadmap: string;
  startQuizBtn: string;
  logoutBtn: string;
  completedText: string;
  searchPlaceholder: string;
  allModules: string;
  inProgress: string;
  notStarted: string;
  lessonsText: string;
  examPrepTitle: string;
  examPrepSubtitle: string;
  timeLeft: string;
  submitExam: string;
  prevQuestion: string;
  nextQuestion: string;
  examCompletedTitle: string;
  yourScore: string;
  retryBtn: string;
  recentPerformance: string;
  avgScore: string;
  timePerQuestion: string;
  reviewAttempts: string;
  availableExams: string;
  academicPerformance: string;
  gpa: string;
  totalStudyHours: string;
  mockExamAvg: string;
  performanceTrend: string;
  subjectProgress: string;
  flashcardsTitle: string;
  flashcardsSubtitle: string;
  showAnswerBtn: string;
  nextCardBtn: string;
  prevCardBtn: string;
  markMasteredBtn: string;
  markReviewBtn: string;
  languageSelect: string;
}

export const translations: Record<Language, TranslationDict> = {
  pt: {
    loginTitle: "Portal de Estudos",
    loginSubtitle: "Seu Plano de Estudos e Flashcards Personalizado",
    emailLabel: "Endereço de E-mail",
    passwordLabel: "Senha",
    forgotPassword: "Esqueceu sua senha?",
    loginBtn: "Entrar",
    supportLink: "Precisa de suporte técnico? Contatar Suporte",
    welcomeBack: "Seja bem-vindo(a)",
    portalSubtitle: "Seu plano de estudos de enfermagem personalizado.",
    modulesCompleted: "Módulos Concluídos",
    questionsAnswered: "Questões Respondidas",
    continueStudying: "Continuar Estudando",
    resumeBtn: "Retomar",
    weeklySchedule: "Cronograma Semanal",
    viewFullCalendar: "Ver Calendário Completo",
    navDashboard: "Painel",
    navModules: "Módulos de Estudo",
    navExams: "Simulados ENARE",
    navFlashcards: "Flashcards",
    navPerformance: "Desempenho",
    navAiStudy: "Estudos com IA",
    navSettings: "Configurações",
    navRoadmap: "Roteiro",
    startQuizBtn: "Iniciar Quiz",
    logoutBtn: "Sair",
    completedText: "Concluído",
    searchPlaceholder: "Buscar tópicos ou lições...",
    allModules: "Todos os Módulos",
    inProgress: "Em Progresso",
    notStarted: "Não Iniciados",
    lessonsText: "Aulas",
    examPrepTitle: "Simulados Preparatórios",
    examPrepSubtitle: "Treine com questões baseadas em provas anteriores do ENARE e editais de enfermagem.",
    timeLeft: "Tempo Restante",
    submitExam: "Finalizar Exame",
    prevQuestion: "Anterior",
    nextQuestion: "Próxima",
    examCompletedTitle: "Simulado Concluído!",
    yourScore: "Sua Nota",
    retryBtn: "Tentar Novamente",
    recentPerformance: "Desempenho Recente",
    avgScore: "Média de Pontuação",
    timePerQuestion: "Tempo por Questão",
    reviewAttempts: "Histórico de Tentativas",
    availableExams: "Exames Disponíveis",
    academicPerformance: "Desempenho de Estudos",
    gpa: "Percentual de Acertos Geral",
    totalStudyHours: "Horas de Estudo",
    mockExamAvg: "Média de Simulados",
    performanceTrend: "Tendência de Desempenho (6 meses)",
    subjectProgress: "Progresso por Disciplina",
    flashcardsTitle: "Flashcards de Revisão",
    flashcardsSubtitle: "Memorize conceitos chave através de cartões de repetição espaçada.",
    showAnswerBtn: "Mostrar Resposta",
    nextCardBtn: "Próximo",
    prevCardBtn: "Anterior",
    markMasteredBtn: "Dominado",
    markReviewBtn: "Revisar",
    languageSelect: "Idioma",
  },
  en: {
    loginTitle: "Study Portal",
    loginSubtitle: "Your Personalized Study Plan & Flashcards",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    loginBtn: "Log In",
    supportLink: "Need technical support? Contact Support",
    welcomeBack: "Welcome back",
    portalSubtitle: "Your personalized nursing study plan.",
    modulesCompleted: "Modules Completed",
    questionsAnswered: "Questions Answered",
    continueStudying: "Continue Studying",
    resumeBtn: "Resume",
    weeklySchedule: "Weekly Schedule",
    viewFullCalendar: "View Full Calendar",
    navDashboard: "Dashboard",
    navModules: "Study Modules",
    navExams: "ENARE Mocks",
    navFlashcards: "Flashcards",
    navPerformance: "Performance",
    navAiStudy: "AI Study",
    navSettings: "Settings",
    navRoadmap: "Roadmap",
    startQuizBtn: "Start Quiz",
    logoutBtn: "Log Out",
    completedText: "Completed",
    searchPlaceholder: "Search topics or lessons...",
    allModules: "All Modules",
    inProgress: "In Progress",
    notStarted: "Not Started",
    lessonsText: "Lessons",
    examPrepTitle: "Mock Exam Prep",
    examPrepSubtitle: "Practice with past ENARE questions & official guidelines.",
    timeLeft: "Time Left",
    submitExam: "Submit Exam",
    prevQuestion: "Previous",
    nextQuestion: "Next",
    examCompletedTitle: "Exam Completed!",
    yourScore: "Your Score",
    retryBtn: "Try Again",
    recentPerformance: "Recent Performance",
    avgScore: "Average Score",
    timePerQuestion: "Time / Question",
    reviewAttempts: "Attempt History",
    availableExams: "Available Exams",
    academicPerformance: "Academic Performance",
    gpa: "Overall Accuracy",
    totalStudyHours: "Study Hours",
    mockExamAvg: "Mock Exam Average",
    performanceTrend: "Performance Trend (6 Months)",
    subjectProgress: "Progress by Subject",
    flashcardsTitle: "Revision Flashcards",
    flashcardsSubtitle: "Memorize key concepts with spaced repetition cards.",
    showAnswerBtn: "Show Answer",
    nextCardBtn: "Next",
    prevCardBtn: "Previous",
    markMasteredBtn: "Mastered",
    markReviewBtn: "Review",
    languageSelect: "Language",
  }
};
