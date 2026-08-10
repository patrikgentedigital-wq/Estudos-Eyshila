import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Award, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  ListRestart, 
  BookOpen, 
  ArrowRight, 
  Timer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  X
} from "lucide-react";
import { Language, ExamQuestion, ExamAttempt, translations, CadernoErroItem, ExamMode, QuestionExposure, ReviewRating } from "../types";
import { MOCK_QUESTIONS } from "../data";
import { REAL_EXAMS } from "../data/realExams";
import { supabase } from "../supabase";
import {
  ENARE_2026_BLUEPRINT,
  calculateNoveltyRate,
  eligibleQuestionsForMode,
  enrichQuestion,
  isValidBenchmarkForm,
  scheduleCadernoErrorReview,
} from "../utils/studyEngine";

import { getLocalDateKey } from "../utils/dateUtils";

interface ExamPrepProps {
  language: Language;
  onQuestionsAnswered: (count: number) => void;
  attempts: ExamAttempt[];
  onAddAttempt: (attempt: ExamAttempt) => void;
  cadernoErros: CadernoErroItem[];
  setCadernoErros?: React.Dispatch<React.SetStateAction<CadernoErroItem[]>>;
  questionExposures: QuestionExposure[];
  onQuestionExposure: (exposure: QuestionExposure) => void;
}

interface SecureExamStartResponse {
  attemptId: string;
  noveltyRate: number;
  validForBenchmark: boolean;
  durationMinutes: number | null;
  questions: Array<Omit<ExamQuestion, "correctIndex" | "explanation">>;
}

interface SecureExamSubmitResponse {
  score: number;
  benchmarkScore: number | null;
  answeredQuestions: number;
  totalQuestions: number;
  noveltyRate: number;
  validForBenchmark: boolean;
  results: Array<{
    questionId: string;
    selectedPosition: number | null;
    correctPosition: number;
    isCorrect: boolean;
    explanation: string;
    pivotalCues?: string[];
    reasoningSteps?: string[];
    distractorExplanations?: string[];
  }>;
}

interface CompletedResult {
  score: number;
  benchmarkScore?: number | null;
  noveltyRate: number;
  validForBenchmark: boolean;
}

export default function ExamPrep({
  language,
  onQuestionsAnswered,
  attempts,
  onAddAttempt,
  cadernoErros,
  setCadernoErros,
  questionExposures,
  onQuestionExposure,
}: ExamPrepProps) {
  const [lobbyTab, setLobbyTab] = useState<"mocks" | "past_exams" | "errors" | "discursive">("mocks");
  const [activeExamType, setActiveExamType] = useState<string>("all");
  const [questions, setQuestions] = useState<ExamQuestion[]>(MOCK_QUESTIONS);
  const [examMode, setExamMode] = useState<ExamMode>("study");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [questionsCount, setQuestionsCount] = useState<number>(10);
  const [viewMode, setViewMode] = useState<"single" | "list">("list");
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [lockedStudyAnswers, setLockedStudyAnswers] = useState<Record<number, boolean>>({});
  const [responseTimesMs, setResponseTimesMs] = useState<Record<number, number>>({});
  const [confidenceByQuestion, setConfidenceByQuestion] = useState<Record<number, 1 | 2 | 3>>({});
  const [seenExternallyByQuestion, setSeenExternallyByQuestion] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<ExamAttempt | null>(null);
  
  const [examDurationSec, setExamDurationSec] = useState(600);
  const [timeLeft, setTimeLeft] = useState(600);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string>("");
  const [startingNoveltyRate, setStartingNoveltyRate] = useState(100);
  const [secureAttemptId, setSecureAttemptId] = useState<string | null>(null);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [completedResult, setCompletedResult] = useState<CompletedResult | null>(null);
  const questionOpenedAtRef = useRef<number>(Date.now());
  const exposedInAttemptRef = useRef<Set<string>>(new Set());
  const selectedAnswersRef = useRef<Record<number, number>>({});
  const responseTimesRef = useRef<Record<number, number>>({});
  const confidenceRef = useRef<Record<number, 1 | 2 | 3>>({});
  const seenExternallyRef = useRef<Record<number, boolean>>({});
  const timeLeftRef = useRef(examDurationSec);
  const elapsedSecondsRef = useRef(0);
  const quizFinishedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  const t = translations[language];

  const knownExposures = useMemo<QuestionExposure[]>(() => {
    const fromAttempts = attempts.flatMap((attempt) =>
      (attempt.questions || []).map((question, index) => ({
        id: `history-${attempt.id}-${question.id}`,
        questionId: question.id,
        shownAt: attempt.date,
        mode: attempt.mode || "practice",
        attemptId: attempt.id,
        correct: attempt.selectedAnswers?.[index] === question.correctIndex,
      } as QuestionExposure)),
    );
    return [...questionExposures, ...fromAttempts];
  }, [attempts, questionExposures]);

  const reviewableErrors = useMemo(() => {
    const today = getLocalDateKey();
    return cadernoErros.filter((item) => (
      item.options
      && item.options.length >= 2
      && item.correctIndex !== undefined
      && (!item.nextReview || item.nextReview <= today)
    ));
  }, [cadernoErros]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
    responseTimesRef.current = responseTimesMs;
    confidenceRef.current = confidenceByQuestion;
    seenExternallyRef.current = seenExternallyByQuestion;
    timeLeftRef.current = timeLeft;
    elapsedSecondsRef.current = elapsedSeconds;
    quizFinishedRef.current = quizFinished;
  }, [confidenceByQuestion, elapsedSeconds, quizFinished, responseTimesMs, seenExternallyByQuestion, selectedAnswers, timeLeft]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const initializeQuiz = (
    finalQuestionsList: ExamQuestion[],
    type: string,
    durationForAttempt: number,
    attemptId: string,
    noveltyRate: number,
    isSecure: boolean,
  ) => {
    setQuestions(finalQuestionsList);
    setActiveExamType(type);
    setCurrentIndex(0);
    setSelectedAnswers({});
    selectedAnswersRef.current = {};
    setLockedStudyAnswers({});
    setResponseTimesMs({});
    responseTimesRef.current = {};
    setConfidenceByQuestion({});
    confidenceRef.current = {};
    setSeenExternallyByQuestion({});
    seenExternallyRef.current = {};
    setQuizFinished(false);
    quizFinishedRef.current = false;
    setCompletedResult(null);
    setTimeLeft(durationForAttempt);
    timeLeftRef.current = durationForAttempt;
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setIsTimerPaused(false);
    setActiveAttemptId(attemptId);
    setSecureAttemptId(isSecure ? attemptId : null);
    setStartingNoveltyRate(noveltyRate);
    exposedInAttemptRef.current = new Set();
    questionOpenedAtRef.current = Date.now();
    setQuizStarted(true);
  };

  const startExam = async (type: string) => {
    if (isStartingExam) return;
    const effectiveMode: ExamMode = type === "errors_notebook" ? "study" : examMode;

    if (effectiveMode === "benchmark") {
      if (type !== "all") {
        alert("O benchmark ENARE usa o blueprint completo. Para recortes por tema, selecione Modo estudo ou Treino cronometrado.");
        return;
      }
      if (!supabase) {
        alert("O simulado seguro precisa da conexão autenticada com o Supabase. Use o modo treino enquanto a configuração não estiver disponível.");
        return;
      }

      setIsStartingExam(true);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (sessionError || !accessToken) {
          throw new Error("Sua sessão expirou. Entre novamente para iniciar a prova.");
        }

        const response = await fetch("/api/exams/start", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blueprintId: ENARE_2026_BLUEPRINT.id,
            mode: "benchmark",
          }),
        });
        const payload = await response.json().catch(() => ({})) as Partial<SecureExamStartResponse> & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Não foi possível montar a prova segura.");
        }
        if (!payload.attemptId || !payload.questions?.length) {
          throw new Error("O servidor devolveu um simulado incompleto.");
        }

        const secureQuestions: ExamQuestion[] = payload.questions.map((question) => ({
          ...question,
          correctIndex: -1,
          explanation: "",
          pool: "assessment",
          contentStatus: "published",
        }));
        const durationForAttempt = (payload.durationMinutes || ENARE_2026_BLUEPRINT.durationMinutes) * 60;
        setQuestionsCount(secureQuestions.length);
        setIsUnlimitedMode(false);
        setExamDurationSec(durationForAttempt);
        initializeQuiz(
          secureQuestions,
          type,
          durationForAttempt,
          payload.attemptId,
          payload.noveltyRate ?? 100,
          true,
        );
      } catch (error) {
        alert(error instanceof Error ? error.message : "Não foi possível iniciar a prova segura.");
      } finally {
        setIsStartingExam(false);
      }
      return;
    }

    let list: ExamQuestion[] = [];
    // Modo estudo/treino local — uso pessoal estrito, gabarito visível no client intencionalmente (decisão 10/08/2026)
    const allBank = [...MOCK_QUESTIONS, ...REAL_EXAMS.flatMap(e => e.questions)];

    if (type === "errors_notebook") {
      list = reviewableErrors.map(erro => {
        const found = allBank.find(q => q.question === erro.questionText);
        if (found) return found;
        if (!erro.options || erro.options.length < 2 || erro.correctIndex === undefined) return null;
        return {
          id: erro.id,
          question: erro.questionText,
          options: erro.options,
          correctIndex: erro.correctIndex,
          explanation: erro.explanation,
          category: erro.category
        };
      }).filter((question): question is ExamQuestion => Boolean(question));
      list = shuffleArray(list);
    } else if (type.startsWith("real_")) {
      const id = type.replace("real_", "");
      const exam = REAL_EXAMS.find(e => e.id === id);
      list = exam ? [...exam.questions] : [];
    } else {
      let filtered = allBank;
      if (selectedCategory && selectedCategory !== "all") {
        filtered = allBank.filter(q => q.category === selectedCategory);
      } else if (type === "sus_ethics") {
        filtered = allBank.filter(q => q.category === "Legislação SUS" || q.category === "Políticas de Saúde" || q.category === "Ética e Gestão");
      } else if (type === "womens_child") {
        filtered = allBank.filter(q => q.category === "Ciclos de Vida" || q.category === "Prática Clínica" || q.category === "Urgência e UTI");
      }
      list = shuffleArray(filtered);
    }

    const eligible = eligibleQuestionsForMode(list.map(enrichQuestion), effectiveMode, knownExposures);
    const finalQuestionsList = shuffleArray(eligible).slice(0, Math.min(eligible.length, questionsCount));
    const durationForAttempt = examDurationSec;

    if (finalQuestionsList.length === 0) {
      alert(type === "errors_notebook"
        ? "Ainda não há questões do caderno com alternativas originais salvas. Sinalize um erro depois de responder uma questão para habilitar esta revisão."
        : "Não há questões disponíveis para este treino.");
      return;
    }
    
    const attemptId = `att-${Date.now()}`;
    initializeQuiz(
      finalQuestionsList,
      type,
      durationForAttempt,
      attemptId,
      calculateNoveltyRate(finalQuestionsList.map((question) => question.id), knownExposures),
      false,
    );
  };

  useEffect(() => {
    if (!quizStarted || quizFinished || isTimerPaused) return;

    const interval = setInterval(() => {
      if (isUnlimitedMode) {
        setElapsedSeconds((prev) => prev + 1);
      } else {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, quizFinished, isTimerPaused, isUnlimitedMode]);

  useEffect(() => {
    if (quizStarted && !quizFinished && !isTimerPaused && !isUnlimitedMode && timeLeft <= 0) {
      void finishQuiz();
    }
    // finishQuiz intentionally omitted: the timer expiration is the only trigger here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quizStarted, quizFinished, isTimerPaused, isUnlimitedMode]);

  useEffect(() => {
    if (!quizStarted || !questions[currentIndex] || !activeAttemptId) return;
    const question = questions[currentIndex];
    const exposureKey = `${activeAttemptId}-${question.id}`;
    if (exposedInAttemptRef.current.has(exposureKey)) return;
    exposedInAttemptRef.current.add(exposureKey);
    questionOpenedAtRef.current = Date.now();
    onQuestionExposure({
      id: `exposure-${exposureKey}`,
      questionId: question.id,
      shownAt: new Date().toISOString(),
      mode: activeExamType === "errors_notebook" ? "errors" : examMode,
      attemptId: activeAttemptId,
    });
  }, [activeAttemptId, activeExamType, currentIndex, examMode, onQuestionExposure, questions, quizStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (qIdx: number, optIndex: number) => {
    if (quizFinished) return;
    if (examMode === "study" && lockedStudyAnswers[qIdx]) return;
    if (selectedAnswers[qIdx] === undefined) {
      setResponseTimesMs((previous) => ({
        ...previous,
        [qIdx]: Math.max(0, Date.now() - questionOpenedAtRef.current),
      }));
    }
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIndex }));
    if (examMode === "study" || activeExamType === "errors_notebook") {
      setLockedStudyAnswers((previous) => ({ ...previous, [qIdx]: true }));
    }
  };

  const flagCurrentError = () => {
    const question = questions[currentIndex];
    const selectedIndex = selectedAnswers[currentIndex];
    if (!question || selectedIndex === undefined || !setCadernoErros) return;

    setCadernoErros(previous => {
      if (previous.some(item => item.questionText === question.question)) return previous;
      return [...previous, {
        id: `error-${question.id}-${Date.now()}`,
        questionId: question.id,
        questionText: question.question,
        options: [...question.options],
        correctIndex: question.correctIndex,
        userAnswer: question.options[selectedIndex],
        correctAnswer: question.options[question.correctIndex],
        explanation: question.explanation,
        category: question.category,
        dateAdded: new Date().toISOString(),
        cognitiveType: question.cognitiveType,
        criticality: question.criticality,
      }];
    });
  };

  const recordCompletedAttempt = (
    correctedQuestions: ExamQuestion[],
    finalScore: number,
    validForBenchmark: boolean,
    noveltyRate: number,
    benchmarkScore?: number | null,
  ) => {
    const finalAnswers = selectedAnswersRef.current;
    const finalResponseTimes = responseTimesRef.current;
    const finalConfidence = confidenceRef.current;
    const finalExternalFlags = seenExternallyRef.current;
    const totalTimeSecs = isUnlimitedMode ? elapsedSecondsRef.current : (examDurationSec - timeLeftRef.current);
    const effectiveMode: ExamMode = activeExamType === "errors_notebook" ? "study" : examMode;
    const answeredCount = Object.keys(finalAnswers).length;

    const newAttempt: ExamAttempt = {
      id: activeAttemptId || `att-${Date.now()}`,
      date: getLocalDateKey(),
      examName: effectiveMode === "benchmark"
        ? validForBenchmark
          ? ENARE_2026_BLUEPRINT.name
          : `${ENARE_2026_BLUEPRINT.name} (não comparável)`
        : effectiveMode === "study"
          ? "Sessão de estudo com feedback"
          : "Treino cronometrado",
      score: finalScore,
      totalQuestions: correctedQuestions.length,
      timeSpent: formatTime(totalTimeSecs),
      questions: [...correctedQuestions],
      selectedAnswers: { ...finalAnswers },
      responseTimesMs: { ...finalResponseTimes },
      confidenceByQuestion: { ...finalConfidence },
      mode: effectiveMode,
      blueprintId: effectiveMode === "benchmark" ? ENARE_2026_BLUEPRINT.id : undefined,
      noveltyRate,
      validForBenchmark,
      feedbackDeferred: effectiveMode !== "study",
    };

    onAddAttempt(newAttempt);
    if (activeExamType === "errors_notebook" && setCadernoErros) {
      setCadernoErros((previous) => previous.map((item) => {
        const questionIndex = correctedQuestions.findIndex((question) => (
          question.id === item.questionId || question.question === item.questionText
        ));
        if (questionIndex < 0 || finalAnswers[questionIndex] === undefined) return item;
        const isCorrect = finalAnswers[questionIndex] === correctedQuestions[questionIndex].correctIndex;
        const confidence = finalConfidence[questionIndex];
        const rating: ReviewRating = !isCorrect
          ? "again"
          : confidence === 3
            ? "easy"
            : confidence === 1
              ? "hard"
              : "good";
        return scheduleCadernoErrorReview(item, rating, correctedQuestions[questionIndex]);
      }));
    }
    correctedQuestions.forEach((question, index) => {
      const selected = finalAnswers[index];
      if (selected === undefined && !finalExternalFlags[index]) return;
      onQuestionExposure({
        id: `result-${newAttempt.id}-${question.id}`,
        questionId: question.id,
        shownAt: new Date().toISOString(),
        mode: effectiveMode,
        attemptId: newAttempt.id,
        correct: selected === question.correctIndex,
        responseMs: finalResponseTimes[index],
        confidence: finalConfidence[index],
        seenExternally: finalExternalFlags[index] || false,
      });
    });
    onQuestionsAnswered(answeredCount);
    setCompletedResult({ score: finalScore, benchmarkScore, noveltyRate, validForBenchmark });
    quizFinishedRef.current = true;
    setQuizFinished(true);
  };

  const finishQuiz = async () => {
    if (questions.length === 0 || quizFinishedRef.current || isSubmittingRef.current) return;

    if (secureAttemptId) {
      isSubmittingRef.current = true;
      setIsSubmittingExam(true);
      setIsTimerPaused(true);
      try {
        if (!supabase) throw new Error("Conexão autenticada indisponível.");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (sessionError || !accessToken) throw new Error("Sua sessão expirou. Entre novamente para entregar a prova.");

        const response = await fetch(`/api/exams/${encodeURIComponent(secureAttemptId)}/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: questions.map((question, index) => ({
              questionId: question.id,
              selectedPosition: selectedAnswersRef.current[index] ?? null,
              responseMs: responseTimesRef.current[index],
              confidence: confidenceRef.current[index],
              seenExternally: seenExternallyRef.current[index] || false,
            })),
          }),
        });
        const payload = await response.json().catch(() => ({})) as Partial<SecureExamSubmitResponse> & { error?: string };
        if (!response.ok) throw new Error(payload.error || "Não foi possível corrigir a prova segura.");
        if (typeof payload.score !== "number" || !payload.results) {
          throw new Error("O servidor devolveu uma correção incompleta.");
        }

        const resultByQuestion = new Map(payload.results.map((result) => [result.questionId, result]));
        const correctedQuestions = questions.map((question) => {
          const result = resultByQuestion.get(question.id);
          if (!result) throw new Error("O gabarito devolvido não corresponde ao formulário entregue.");
          return {
            ...question,
            correctIndex: result.correctPosition,
            explanation: result.explanation,
            pivotalCues: result.pivotalCues,
            reasoningSteps: result.reasoningSteps,
            distractorExplanations: result.distractorExplanations,
          };
        });
        setQuestions(correctedQuestions);
        recordCompletedAttempt(
          correctedQuestions,
          payload.score,
          payload.validForBenchmark ?? false,
          payload.noveltyRate ?? startingNoveltyRate,
          payload.benchmarkScore,
        );
      } catch (error) {
        alert(error instanceof Error ? error.message : "Não foi possível entregar a prova segura.");
      } finally {
        isSubmittingRef.current = false;
        setIsSubmittingExam(false);
      }
      return;
    }

    let correctCount = 0;
    questions.forEach((question, index) => {
      if (selectedAnswersRef.current[index] === question.correctIndex) correctCount += 1;
    });
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const hasExternalExposure = Object.values(seenExternallyRef.current).some(Boolean);
    const validForBenchmark = !hasExternalExposure && isValidBenchmarkForm(
      questions,
      activeExamType === "errors_notebook" ? "study" : examMode,
      startingNoveltyRate,
      ENARE_2026_BLUEPRINT,
    );
    recordCompletedAttempt(questions, finalScore, validForBenchmark, startingNoveltyRate);
  };

  const currentQuestion = questions[currentIndex];
  const isStudyFeedbackMode = examMode === "study" || activeExamType === "errors_notebook";
  const showCurrentFeedback = Boolean(
    quizFinished
    || (isStudyFeedbackMode
      && selectedAnswers[currentIndex] !== undefined
      && confidenceByQuestion[currentIndex] !== undefined),
  );
  const hasMissingConfidence = isStudyFeedbackMode && Object.keys(selectedAnswers)
    .some((index) => confidenceByQuestion[Number(index)] === undefined);
  const currentFormIsValidBenchmark = quizFinished
    ? completedResult?.validForBenchmark ?? false
    : isValidBenchmarkForm(
        questions,
        activeExamType === "errors_notebook" ? "study" : examMode,
        startingNoveltyRate,
        ENARE_2026_BLUEPRINT,
      );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        {!quizStarted ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <span className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">TREINAMENTO TÉCNICO</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Preparatório para Provas</h3>
              <p className="text-sm text-slate-500 font-medium">Treine com o banco interno; somente formulários revisados e inéditos contam como benchmark.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Modo da sessão">
              {([
                { id: "study", title: "Modo estudo", text: "Feedback após responder; itens reservados ficam protegidos." },
                { id: "practice", title: "Treino cronometrado", text: "Sem explicação até a entrega; nota não é benchmark." },
                { id: "benchmark", title: "Prova ENARE", text: "100 questões, cinco alternativas, 20/80 e cinco horas." },
              ] as const).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setExamMode(mode.id);
                    if (mode.id === "benchmark") {
                      setQuestionsCount(ENARE_2026_BLUEPRINT.questionCount);
                      setExamDurationSec(ENARE_2026_BLUEPRINT.durationMinutes * 60);
                      setIsUnlimitedMode(false);
                    } else if (questionsCount === ENARE_2026_BLUEPRINT.questionCount) {
                      setQuestionsCount(10);
                      setExamDurationSec(1800);
                    }
                  }}
                  aria-pressed={examMode === mode.id}
                  className={`rounded-2xl border p-4 text-left transition-all ${examMode === mode.id ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-800 hover:border-indigo-400"}`}
                >
                  <span className="block text-sm font-extrabold text-slate-900 dark:text-white">{mode.title}</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{mode.text}</span>
                </button>
              ))}
            </div>

            {examMode !== "benchmark" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-bold uppercase text-slate-400 shrink-0">Filtrar por Disciplina</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="all">Todas as Disciplinas (Geral)</option>
                    <option value="Legislação SUS">Legislação do SUS</option>
                    <option value="Políticas de Saúde">Políticas de Saúde</option>
                    <option value="Ética e Gestão">Ética, Legislação e Exercício Profissional</option>
                    <option value="Urgência e UTI">Urgência, Emergência e UTI</option>
                    <option value="Ciclos de Vida">Saúde da Mulher e Criança (Ciclos de Vida)</option>
                    <option value="Prática Clínica">Prática Clínica, Farmacologia e Procedimentos</option>
                    <option value="Saúde Coletiva">Saúde Coletiva e Epidemiologia</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-2 text-xs font-bold uppercase text-slate-400">Quantidade</span>
                  {[5, 10, 20, 50].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setQuestionsCount(count);
                        if (!isUnlimitedMode) setExamDurationSec(count * 180);
                      }}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold ${questionsCount === count ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"}`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Questões</span>
                <span className="text-lg font-extrabold text-sky-500">{questionsCount} Q</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Tempo</span>
                <span className="text-lg font-extrabold text-sky-500">{isUnlimitedMode ? "Livre" : `${examDurationSec / 60}m`}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Mínimo no edital</span>
                <span className="text-lg font-extrabold text-sky-500">{ENARE_2026_BLUEPRINT.minimumPassingPercentage}%</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100">
               <span className="text-xs font-black text-slate-400 uppercase flex items-center space-x-2">
                 <Timer className="h-4 w-4 text-sky-500" />
                 <span>Configuração de Tempo</span>
               </span>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 {(examMode === "benchmark" ? [
                   { label: "5h fixas", sec: 18000, unlimited: false },
                 ] : [
                   { label: "1 min/questão", sec: questionsCount * 60, unlimited: false },
                   { label: "2 min/questão", sec: questionsCount * 120, unlimited: false },
                   { label: "3 min/questão", sec: questionsCount * 180, unlimited: false },
                   { label: "Livre", sec: 0, unlimited: true }
                 ]).map((mode, idx) => (
                   <button
                     key={idx}
                     onClick={() => { setIsUnlimitedMode(mode.unlimited); if (!mode.unlimited) setExamDurationSec(mode.sec); }}
                     className={`py-2 rounded-xl border text-xs font-bold transition-all ${ (isUnlimitedMode && mode.unlimited) || (!isUnlimitedMode && !mode.unlimited && examDurationSec === mode.sec) ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400" }`}
                   >
                     {mode.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100">
                <button onClick={() => setLobbyTab("mocks")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${lobbyTab === "mocks" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"}`}>Treinos por tema</button>
                <button onClick={() => setLobbyTab("past_exams")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${lobbyTab === "past_exams" ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm" : "text-slate-500"}`}>Cadernos internos</button>
                <button onClick={() => setLobbyTab("errors")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${lobbyTab === "errors" ? "bg-white dark:bg-slate-900 text-rose-500 shadow-sm" : "text-slate-500"}`}>Caderno de Erros</button>
                <button onClick={() => setLobbyTab("discursive")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${lobbyTab === "discursive" ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm" : "text-slate-500"}`}>Formato da prova</button>
              </div>

              {lobbyTab === "mocks" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => void startExam("all")} disabled={isStartingExam} className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white dark:bg-slate-950 text-left transition-all group disabled:cursor-wait disabled:opacity-60">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-500">Simulado Geral</h4>
                    <p className="text-xs text-slate-400 mt-1">Questões variadas de todos os tópicos.</p>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase mt-4 block">{isStartingExam ? "Montando prova segura…" : "Iniciar Agora →"}</span>
                  </button>
                  <button onClick={() => startExam("sus_ethics")} className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white dark:bg-slate-950 text-left transition-all group">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-500">SUS & Ética</h4>
                    <p className="text-xs text-slate-400 mt-1">Foco em legislação e ética profissional.</p>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase mt-4 block">Iniciar Agora →</span>
                  </button>
                </div>
              ) : lobbyTab === "past_exams" ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    Estes cadernos são materiais internos e não reproduções oficiais. Rótulos históricos do banco não comprovam autoria da banca; confirme protocolos e normas na fonte vigente.
                  </div>
                  {REAL_EXAMS.map(exam => (
                    <button key={exam.id} onClick={() => startExam(`real_${exam.id}`)} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 bg-white dark:bg-slate-950 flex items-center justify-between group transition-colors">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{exam.title}</h4>
                        <p className="text-[10px] text-slate-400">Banca: {exam.institution} • {exam.questions.length} questões disponíveis</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : lobbyTab === "errors" ? (
                <div className="flex flex-col items-center text-center p-8 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-4">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-rose-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Simulado do Caderno de Erros</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    O treino usa apenas questões que têm as alternativas originais salvas. Questões antigas sem alternativas não serão inventadas.
                    Você tem <strong>{cadernoErros.length}</strong> questão(ões) no caderno e <strong>{reviewableErrors.length}</strong> vencidas e prontas para revisão adaptativa.
                  </p>
                  <button
                    onClick={() => startExam("errors_notebook")}
                    disabled={reviewableErrors.length === 0}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 transition-all cursor-pointer"
                  >
                    Revisar questões salvas
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 space-y-4 text-left">
                   <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase font-mono">
                     <AlertCircle className="h-4 w-4" />
                     <span>Formato da prova: objetiva</span>
                   </div>
                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                     O Edital nº 04/2026 define 100 questões objetivas com cinco alternativas, cinco horas de prova, distribuição 20/80 entre competências gerais e específicas e mínimo de 50% para habilitação. A avaliação discursiva automática foi desativada porque este aplicativo não possui critérios oficiais para atribuir esse tipo de nota.
                   </p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">
                     Use os treinos por tema, o caderno de erros e os flashcards para praticar recuperação ativa. Nenhuma nota será inventada para uma resposta aberta.
                   </p>
                   <a
                     href={ENARE_2026_BLUEPRINT.sourceUrl}
                     target="_blank"
                     rel="noreferrer"
                     className="inline-flex text-xs font-bold text-amber-700 underline underline-offset-4 dark:text-amber-300"
                   >
                     Conferir o edital oficial usado na calibração
                   </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-sky-500/10 text-sky-500 p-2 rounded-lg"><Clock className="h-4 w-4" /></div>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{isUnlimitedMode ? formatTime(elapsedSeconds) : formatTime(timeLeft)}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questão {currentIndex + 1} de {questions.length}</div>
                <span className="text-[9px] font-extrabold uppercase text-indigo-500">
                  {examMode === "study" ? "Estudo" : examMode === "benchmark" ? "Prova ENARE" : "Treino cronometrado"}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{questions[currentIndex].category}</span>
                {currentQuestion.clinicalCase && (
                  <section className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-3" aria-label="Caso clínico">
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300">
                      {currentQuestion.clinicalCase.setting && <span className="rounded-full bg-sky-500/10 px-2 py-1">{currentQuestion.clinicalCase.setting}</span>}
                      {currentQuestion.clinicalCase.ageGroup && <span className="rounded-full bg-sky-500/10 px-2 py-1">{currentQuestion.clinicalCase.ageGroup}</span>}
                    </div>
                    {currentQuestion.clinicalCase.presentingProblem && <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentQuestion.clinicalCase.presentingProblem}</p>}
                    {currentQuestion.clinicalCase.history && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300"><strong>História:</strong> {currentQuestion.clinicalCase.history}</p>}
                    {currentQuestion.clinicalCase.physicalExam && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300"><strong>Exame:</strong> {currentQuestion.clinicalCase.physicalExam}</p>}
                    {currentQuestion.clinicalCase.vitals && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(currentQuestion.clinicalCase.vitals).map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-white dark:bg-slate-900 p-2 text-center border border-slate-200 dark:border-slate-800">
                            <span className="block text-[9px] uppercase text-slate-400">{label}</span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{questions[currentIndex].question}</p>
                {currentQuestion.leadIn && <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{currentQuestion.leadIn}</p>}
                
                <div className="space-y-2">
                  {questions[currentIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    const isCorrect = questions[currentIndex].correctIndex === idx;
                    let style = "border-slate-200 dark:border-slate-800 hover:bg-slate-50";
                    if (isSelected) style = "border-sky-500 bg-sky-500/5 text-sky-600";
                    if (showCurrentFeedback) {
                      if (isCorrect) style = "border-green-500 bg-green-50 text-green-700";
                      else if (isSelected) style = "border-red-500 bg-red-50 text-red-700";
                    }

                    return (
                      <button 
                        key={idx} 
                        disabled={quizFinished || (isStudyFeedbackMode && Boolean(lockedStudyAnswers[currentIndex]))}
                        onClick={() => handleSelectOption(currentIndex, idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start space-x-3 ${style}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}>{String.fromCharCode(65 + idx)}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isStudyFeedbackMode && selectedAnswers[currentIndex] !== undefined && !quizFinished && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                    <span className="block text-[10px] font-extrabold uppercase text-slate-400">Quão confiante você está?</span>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {([
                        [1, "Baixa"],
                        [2, "Média"],
                        [3, "Alta"],
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setConfidenceByQuestion((previous) => ({ ...previous, [currentIndex]: value }))}
                          className={`rounded-lg border px-3 py-2 text-xs font-bold ${confidenceByQuestion[currentIndex] === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {examMode === "benchmark" && !quizFinished && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <input
                      type="checkbox"
                      checked={Boolean(seenExternallyByQuestion[currentIndex])}
                      onChange={(event) => setSeenExternallyByQuestion((previous) => ({
                        ...previous,
                        [currentIndex]: event.target.checked,
                      }))}
                      className="mt-0.5 h-4 w-4 rounded border-amber-400"
                    />
                    <span>
                      <strong>Eu já conhecia esta questão fora do app.</strong> Marcar isto preserva a honestidade da análise, mas torna o resultado não comparável ao benchmark oficial.
                    </span>
                  </label>
                )}

                {showCurrentFeedback && (
                  <div className="p-4 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-xl border border-indigo-500/30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase font-mono">
                        {selectedAnswers[currentIndex] === questions[currentIndex].correctIndex ? "✅ Resposta Correta!" : "❌ Resposta Incorreta"} • Comentário do banco de estudos
                      </span>
                      <button 
                        onClick={flagCurrentError}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center space-x-1 cursor-pointer"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>{cadernoErros.some(item => item.questionText === questions[currentIndex].question) ? "Salva no caderno" : "Salvar no caderno"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{questions[currentIndex].explanation}</p>
                    {currentQuestion.contentStatus !== "published" && (
                      <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        Material interno ainda não publicado pelo fluxo de revisão. Confirme doses, protocolos e normas em fonte oficial vigente.
                      </p>
                    )}
                    {currentQuestion.pivotalCues && currentQuestion.pivotalCues.length > 0 && (
                      <div className="pt-2 border-t border-indigo-500/20">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Dados decisivos</span>
                        <ul className="mt-1 list-disc pl-5 text-xs text-slate-700 dark:text-slate-300">
                          {currentQuestion.pivotalCues.map((cue) => <li key={cue}>{cue}</li>)}
                        </ul>
                      </div>
                    )}
                    {currentQuestion.reasoningSteps && currentQuestion.reasoningSteps.length > 0 && (
                      <div className="pt-2 border-t border-indigo-500/20">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Raciocínio esperado</span>
                        <ol className="mt-1 list-decimal pl-5 text-xs text-slate-700 dark:text-slate-300">
                          {currentQuestion.reasoningSteps.map((step) => <li key={step}>{step}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {quizFinished && (
                  <div className={`rounded-2xl border p-4 ${currentFormIsValidBenchmark ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                    <span className={`text-xs font-extrabold uppercase ${currentFormIsValidBenchmark ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                      {currentFormIsValidBenchmark ? "Benchmark ENARE válido" : "Resultado de treino"}
                    </span>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Nota: <strong>{completedResult?.score ?? 0}%</strong> • novidade do formulário: <strong>{completedResult?.noveltyRate ?? startingNoveltyRate}%</strong>. {!currentFormIsValidBenchmark && "Esta nota não deve ser comparada diretamente à prova real."}
                    </p>
                    {currentFormIsValidBenchmark && completedResult && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {completedResult.score >= ENARE_2026_BLUEPRINT.minimumPassingPercentage
                          ? "Atingiu o mínimo de habilitação do edital; isso não garante vaga ou classificação."
                          : "Ficou abaixo do mínimo de habilitação previsto no edital vigente."}
                      </p>
                    )}
                    {completedResult?.benchmarkScore !== undefined && completedResult.benchmarkScore !== null && !currentFormIsValidBenchmark && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Desempenho exploratório sem itens marcados como conhecidos: <strong>{completedResult.benchmarkScore}%</strong>.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex space-x-2">
                  <button onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    disabled={currentIndex === questions.length - 1 || (isStudyFeedbackMode && selectedAnswers[currentIndex] !== undefined && confidenceByQuestion[currentIndex] === undefined)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-30"
                    aria-label="Próxima questão"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {!quizFinished ? (
                  <button
                    onClick={() => void finishQuiz()}
                    disabled={Object.keys(selectedAnswers).length === 0 || hasMissingConfidence || isSubmittingExam}
                    title={hasMissingConfidence ? "Informe a confiança das questões respondidas antes de finalizar." : undefined}
                    className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-sky-500 disabled:opacity-50"
                  >
                    {isSubmittingExam ? "Corrigindo…" : hasMissingConfidence ? "Informe a confiança" : `Finalizar (${Object.keys(selectedAnswers).length}/${questions.length})`}
                  </button>
                ) : (
                  <button onClick={() => setQuizStarted(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Voltar ao Painel</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-sky-500" />
            <span>Últimos Resultados</span>
          </h4>
          <div className="space-y-3">
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhum simulado realizado ainda.</p>
            ) : (
              attempts.slice(0, 3).map((att) => (
                <div key={att.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-800 truncate max-w-[120px]">{att.examName}</span>
                    <span className={`text-[10px] font-bold ${att.score >= 70 ? "text-green-500" : "text-amber-500"}`}>{att.score}%</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>{att.date}</span>
                    <span>{att.timeSpent}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
