import React from "react";
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  BookOpen
} from "lucide-react";
import { Language } from "../../types";

interface QuestionItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  leadIn?: string;
  cognitiveType?: "factual" | "protocol" | "clinical_reasoning";
  clinicalCase?: {
    setting?: string;
    ageGroup?: string;
    presentingProblem?: string;
    history?: string;
    physicalExam?: string;
    vitals?: Record<string, string>;
    labs?: Record<string, string>;
  };
  pivotalCues?: string[];
  reasoningSteps?: string[];
  distractorExplanations?: string[];
  source?: string;
}

interface AiQuizProps {
  language: Language;
  questions: QuestionItem[];
  currentQuestionIdx: number;
  setCurrentQuestionIdx: React.Dispatch<React.SetStateAction<number>>;
  selectedAnswers: Record<number, string>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  quizSubmitted: Record<number, boolean>;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  quizFinished: boolean;
  setQuizFinished: (val: boolean) => void;
  savedQuestions: Record<number, boolean>;
  handleSaveQuestionToNotebook: (idx: number) => void;
  handleRetryQuiz: () => void;
  setActiveSubTab: (tab: "summary" | "quiz" | "flashcards" | "full-audio") => void;
}

export default function AiQuiz({
  language,
  questions,
  currentQuestionIdx,
  setCurrentQuestionIdx,
  selectedAnswers,
  setSelectedAnswers,
  quizSubmitted,
  setQuizSubmitted,
  quizFinished,
  setQuizFinished,
  savedQuestions,
  handleSaveQuestionToNotebook,
  handleRetryQuiz,
  setActiveSubTab,
}: AiQuizProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center space-y-3">
        <p className="text-slate-500 text-sm">
          {language === "pt" ? "Nenhuma questão gerada para este material." : "No quiz questions generated for this material."}
        </p>
      </div>
    );
  }

  const activeQuestion = questions[currentQuestionIdx];
  const correctAnswersCount = Object.keys(quizSubmitted).filter(idxStr => {
    const i = Number(idxStr);
    return selectedAnswers[i] === questions[i].answer;
  }).length;

  const handleSelectOption = (optionLetter: string) => {
    if (quizSubmitted[currentQuestionIdx]) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionLetter }));
  };

  const handleSubmitQuestion = () => {
    if (!selectedAnswers[currentQuestionIdx]) return;
    setQuizSubmitted(prev => ({ ...prev, [currentQuestionIdx]: true }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {!quizFinished && activeQuestion ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Progress & Navigator Row */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <span className="bg-sky-500/10 text-sky-500 font-mono font-bold text-xs px-3 py-1 rounded-full border border-sky-500/20">
                QUESTÃO {currentQuestionIdx + 1} DE {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • Simulado Padrão ENARE / FGV
              </span>
            </div>

            {/* Quick jump dots */}
            <div className="flex items-center space-x-1.5">
              {questions.map((q, idx) => {
                const isSubmitted = quizSubmitted[idx];
                const isCorrect = selectedAnswers[idx] === q.answer;
                const isCurrent = idx === currentQuestionIdx;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      isCurrent 
                        ? "w-6 bg-sky-500" 
                        : isSubmitted 
                          ? isCorrect 
                            ? "w-2.5 bg-emerald-500" 
                            : "w-2.5 bg-rose-500" 
                          : "w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                    }`}
                    title={`Ir para questão ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Lead-in / Clinical Case if present */}
            {activeQuestion.clinicalCase && (
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2 text-xs">
                <span className="font-extrabold text-[10px] uppercase text-sky-500 tracking-wider block">
                  {language === "pt" ? "CASO CLÍNICO DE ESTUDO" : "CLINICAL CASE STUDY"}
                </span>
                {activeQuestion.clinicalCase.presentingProblem && (
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{activeQuestion.clinicalCase.presentingProblem}</p>
                )}
                {activeQuestion.clinicalCase.history && (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{activeQuestion.clinicalCase.history}</p>
                )}
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed">
                {activeQuestion.question}
              </h3>
            </div>

            {/* Options list */}
            <div className="space-y-3 pt-2">
              {activeQuestion.options.map((opt, oIdx) => {
                const letter = opt.substring(0, 1).toUpperCase();
                const isSelected = selectedAnswers[currentQuestionIdx] === letter;
                const isSubmitted = quizSubmitted[currentQuestionIdx];
                const isCorrect = letter === activeQuestion.answer;

                let btnStyle = "border-slate-200 dark:border-slate-800 hover:border-sky-500/50 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300";
                
                if (isSelected && !isSubmitted) {
                  btnStyle = "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold ring-2 ring-sky-500/20";
                } else if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold";
                  } else {
                    btnStyle = "border-slate-100 dark:border-slate-800/60 opacity-50 bg-slate-50 dark:bg-slate-950 text-slate-400";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(letter)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start space-x-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                      isSelected 
                        ? "bg-sky-500 text-white" 
                        : isSubmitted && isCorrect 
                          ? "bg-emerald-500 text-white" 
                          : isSubmitted && isSelected && !isCorrect 
                            ? "bg-rose-500 text-white" 
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {isSubmitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{language === "pt" ? "Anterior" : "Previous"}</span>
              </button>

              {!quizSubmitted[currentQuestionIdx] ? (
                <button
                  id="btn-quiz-submit-question"
                  onClick={handleSubmitQuestion}
                  disabled={!selectedAnswers[currentQuestionIdx]}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{language === "pt" ? "Confirmar Resposta" : "Submit Answer"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  id="btn-quiz-next-question"
                  onClick={handleNextQuestion}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer animate-fade-in"
                >
                  <span>{currentQuestionIdx + 1 < questions.length ? (language === "pt" ? "Próxima Questão" : "Next Question") : (language === "pt" ? "Ver Resultado" : "View Results")}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Detailed Explanation / Rationale after submitting */}
            {quizSubmitted[currentQuestionIdx] && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="h-4 w-4 text-sky-500" />
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                      {language === "pt" ? "Fundamentação & Comentário do Mentor" : "Clinical Rationale & Explanation"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSaveQuestionToNotebook(currentQuestionIdx)}
                    disabled={savedQuestions[currentQuestionIdx]}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all flex items-center space-x-1 cursor-pointer ${
                      savedQuestions[currentQuestionIdx]
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{savedQuestions[currentQuestionIdx] ? "Salvo no Caderno! ✓" : "💾 Salvar no Caderno de Erros"}</span>
                  </button>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {activeQuestion.explanation}
                </p>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* Quiz Finish Screen */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center space-y-6 animate-fade-in">
          <div className="inline-flex p-4 bg-sky-500/10 text-sky-500 rounded-full animate-bounce">
            <Award className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              {language === "pt" ? "Simulado Concluído!" : "Quiz Complete!"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              {language === "pt"
                ? "Parabéns por finalizar a bateria de questões sobre este documento! Veja seu aproveitamento abaixo."
                : "Great job completing all practice questions! Check your score breakdown below."}
            </p>
          </div>

          {/* Metrics */}
          <div className="flex items-center justify-center space-x-8 max-w-md mx-auto py-4 px-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{language === "pt" ? "ACERTOS" : "CORRECT"}</span>
              <span className="text-2xl font-black text-emerald-500 font-mono mt-0.5">{correctAnswersCount}</span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{language === "pt" ? "ERROS" : "INCORRECT"}</span>
              <span className="text-2xl font-black text-rose-500 font-mono mt-0.5">{questions.length - correctAnswersCount}</span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === "pt" ? "APROVEITAMENTO" : "ACCURACY"}</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                {Math.round((correctAnswersCount / questions.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={handleRetryQuiz}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg shadow-sky-600/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{language === "pt" ? "Refazer Simulado" : "Retry Quiz"}</span>
            </button>

            <button
              onClick={() => setActiveSubTab("flashcards")}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>{language === "pt" ? "Praticar Flashcards" : "Practice Flashcards"}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
