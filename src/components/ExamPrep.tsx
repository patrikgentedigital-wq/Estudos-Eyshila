import { useState, useEffect } from "react";
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
  X
} from "lucide-react";
import { Language, ExamQuestion, ExamAttempt, translations, CadernoErroItem } from "../types";
import { MOCK_QUESTIONS } from "../data";
import { REAL_EXAMS } from "../data/realExams";

interface ExamPrepProps {
  language: Language;
  onQuestionsAnswered: (count: number) => void;
  attempts: ExamAttempt[];
  onAddAttempt: (attempt: ExamAttempt) => void;
  cadernoErros: CadernoErroItem[];
}

export default function ExamPrep({
  language,
  onQuestionsAnswered,
  attempts,
  onAddAttempt,
  cadernoErros
}: ExamPrepProps) {
  const [lobbyTab, setLobbyTab] = useState<"mocks" | "past_exams" | "errors">("mocks");
  const [activeExamType, setActiveExamType] = useState<string>("all");
  const [questions, setQuestions] = useState<ExamQuestion[]>(MOCK_QUESTIONS);
  
  const [questionsCount, setQuestionsCount] = useState<number>(10);
  const [viewMode, setViewMode] = useState<"single" | "list">("list");
  
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<ExamAttempt | null>(null);
  
  const [examDurationSec, setExamDurationSec] = useState(600);
  const [timeLeft, setTimeLeft] = useState(600);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);

  const t = translations[language];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startExam = (type: string) => {
    let list: ExamQuestion[] = [];
    const countToDraw = questionsCount;

    if (type === "all") {
      list = shuffleArray(MOCK_QUESTIONS);
    } else if (type === "sus_ethics") {
      list = shuffleArray(MOCK_QUESTIONS.filter(q => q.category === "Legislação SUS" || q.category === "Ética e Gestão"));
    } else if (type === "womens_child") {
      list = shuffleArray(MOCK_QUESTIONS.filter(q => q.category === "Ciclos de Vida" || q.category === "Prática Clínica"));
    } else if (type === "errors_notebook") {
      // Create Mock ExamQuestions from CadernoErroItems
      list = cadernoErros.map((item, idx) => ({
        id: `err-${item.id}-${idx}`,
        question: item.questionText,
        options: item.correctAnswer && item.userAnswer 
          ? [item.correctAnswer, item.userAnswer, "Opção Aleatória A", "Opção Aleatória B"] // This is a rough fallback if we don't store full options
          : ["A", "B", "C", "D"], // In a real app we'd store the original options in the CadernoErroItem
        correctIndex: 0, 
        explanation: item.explanation,
        category: item.category
      }));
      // For this mock, we just ensure the correct answer is always index 0, then we shuffle options per question later, or just keep it simple.
      // Wait, we can't shuffle options easily if correctIndex is static. Let's build proper questions if we have them.
      // Since it's a prototype, let's just use the original question data if we can find it by questionText in MOCK_QUESTIONS and REAL_EXAMS.
      const allQs = [...MOCK_QUESTIONS, ...REAL_EXAMS.flatMap(e => e.questions)];
      list = cadernoErros.map(erro => {
        const found = allQs.find(q => q.question === erro.questionText);
        if (found) return found;
        return {
          id: erro.id,
          question: erro.questionText,
          options: [erro.correctAnswer || "Correta", erro.userAnswer || "Errada", "Outra", "Mais uma"],
          correctIndex: 0,
          explanation: erro.explanation,
          category: erro.category
        };
      });
      list = shuffleArray(list);
    } else if (type.startsWith("real_")) {
      const id = type.replace("real_", "");
      const exam = REAL_EXAMS.find(e => e.id === id);
      list = exam ? [...exam.questions] : [];
    } else if (type.startsWith("enare_")) {
      const year = type.split("_")[1];
      list = shuffleArray(MOCK_QUESTIONS.filter(q => q.examSource === `ENARE ${year}`));
    } else {
      list = shuffleArray(MOCK_QUESTIONS);
    }
    
    let finalQuestionsList = list.slice(0, Math.min(list.length, countToDraw));
    
    setQuestions(finalQuestionsList);
    setActiveExamType(type);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setTimeLeft(examDurationSec);
    setElapsedSeconds(0);
    setIsTimerPaused(false);
    setQuizStarted(true);
  };

  useEffect(() => {
    if (!quizStarted || quizFinished || isTimerPaused) return;

    const interval = setInterval(() => {
      if (isUnlimitedMode) {
        setElapsedSeconds((prev) => prev + 1);
      } else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, quizFinished, isTimerPaused, isUnlimitedMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (qIdx: number, optIndex: number) => {
    if (quizFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIndex }));
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correctCount++;
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    const totalTimeSecs = isUnlimitedMode ? elapsedSeconds : (examDurationSec - timeLeft);

    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      examName: "Simulado Prática",
      score: finalScore,
      totalQuestions: questions.length,
      timeSpent: formatTime(totalTimeSecs),
      questions: [...questions],
      selectedAnswers: { ...selectedAnswers }
    };

    onAddAttempt(newAttempt);
    onQuestionsAnswered(questions.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        {!quizStarted ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <span className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">TREINAMENTO TÉCNICO</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Preparatório para Provas</h3>
              <p className="text-sm text-slate-500 font-medium">Treine com questões reais do ENARE e residências em saúde.</p>
            </div>

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
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Meta</span>
                <span className="text-lg font-extrabold text-sky-500">70%</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100">
               <span className="text-xs font-black text-slate-400 uppercase flex items-center space-x-2">
                 <Timer className="h-4 w-4 text-sky-500" />
                 <span>Configuração de Tempo</span>
               </span>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 {[
                   { label: "5m", sec: 300, unlimited: false },
                   { label: "10m", sec: 600, unlimited: false },
                   { label: "15m", sec: 900, unlimited: false },
                   { label: "Livre", sec: 0, unlimited: true }
                 ].map((mode, idx) => (
                   <button
                     key={idx}
                     onClick={() => { setIsUnlimitedMode(mode.unlimited); if (!mode.unlimited) setExamDurationSec(mode.sec); }}
                     className={`py-2 rounded-xl border text-xs font-bold transition-all ${ (isUnlimitedMode && mode.unlimited) || (!isUnlimitedMode && !mode.unlimited && examDurationSec === mode.sec) ? "bg-sky-600 border-sky-600 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400" }`}
                   >
                     {mode.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100">
                <button onClick={() => setLobbyTab("mocks")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${lobbyTab === "mocks" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-500"}`}>Simulados IA</button>
                <button onClick={() => setLobbyTab("past_exams")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${lobbyTab === "past_exams" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-slate-500"}`}>Provas Reais</button>
                <button onClick={() => setLobbyTab("errors")} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${lobbyTab === "errors" ? "bg-white dark:bg-slate-900 text-rose-500 shadow-sm" : "text-slate-500"}`}>Caderno de Erros</button>
              </div>

              {lobbyTab === "mocks" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => startExam("all")} className="p-5 rounded-2xl border border-slate-200 hover:border-sky-500 bg-white dark:bg-slate-950 text-left transition-all group">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-sky-500">Simulado Geral</h4>
                    <p className="text-xs text-slate-400 mt-1">Questões variadas de todos os tópicos.</p>
                    <span className="text-[10px] font-bold text-sky-500 uppercase mt-4 block">Iniciar Agora →</span>
                  </button>
                  <button onClick={() => startExam("sus_ethics")} className="p-5 rounded-2xl border border-slate-200 hover:border-sky-500 bg-white dark:bg-slate-950 text-left transition-all group">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-sky-500">SUS & Ética</h4>
                    <p className="text-xs text-slate-400 mt-1">Foco em legislação e ética profissional.</p>
                    <span className="text-[10px] font-bold text-sky-500 uppercase mt-4 block">Iniciar Agora →</span>
                  </button>
                </div>
              ) : lobbyTab === "past_exams" ? (
                <div className="grid grid-cols-1 gap-3">
                  {REAL_EXAMS.map(exam => (
                    <button key={exam.id} onClick={() => startExam(`real_${exam.id}`)} className="p-4 rounded-xl border border-slate-200 hover:border-sky-500 bg-white dark:bg-slate-950 flex items-center justify-between group transition-colors">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{exam.title}</h4>
                        <p className="text-[10px] text-slate-400">Banca: {exam.institution} • {exam.questions.length} questões disponíveis</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-8 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-rose-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Simulado de Erros</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    A IA criará um simulado focado apenas nas questões que você já errou, ideal para revisão e fixação.
                    Você tem <strong>{cadernoErros.length}</strong> questão(ões) no caderno.
                  </p>
                  <button
                    onClick={() => startExam("errors_notebook")}
                    disabled={cadernoErros.length === 0}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 transition-all"
                  >
                    Gerar Simulado de Erros
                  </button>
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
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questão {currentIndex + 1} de {questions.length}</div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{questions[currentIndex].category}</span>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{questions[currentIndex].question}</p>
                
                <div className="space-y-2">
                  {questions[currentIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentIndex] === idx;
                    const isCorrect = questions[currentIndex].correctIndex === idx;
                    let style = "border-slate-200 dark:border-slate-800 hover:bg-slate-50";
                    if (isSelected) style = "border-sky-500 bg-sky-500/5 text-sky-600";
                    if (quizFinished) {
                      if (isCorrect) style = "border-green-500 bg-green-50 text-green-700";
                      else if (isSelected) style = "border-red-500 bg-red-50 text-red-700";
                    }

                    return (
                      <button 
                        key={idx} 
                        disabled={quizFinished}
                        onClick={() => handleSelectOption(currentIndex, idx)}
                        className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-start space-x-3 ${style}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}>{String.fromCharCode(65 + idx)}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizFinished && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-sky-500 uppercase block mb-1">Explicação</span>
                    <p className="text-xs text-slate-500 leading-relaxed">{questions[currentIndex].explanation}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex space-x-2">
                  <button onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0} className="p-2 border rounded-lg disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setCurrentIndex(prev => prev + 1)} disabled={currentIndex === questions.length - 1} className="p-2 border rounded-lg disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                </div>
                {!quizFinished ? (
                  <button onClick={finishQuiz} disabled={Object.keys(selectedAnswers).length < questions.length} className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-sky-500 disabled:opacity-50">Finalizar</button>
                ) : (
                  <button onClick={() => setQuizStarted(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Voltar</button>
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
