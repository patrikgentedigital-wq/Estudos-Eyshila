import React from "react";
import { BookOpen, Info } from "lucide-react";
import { ExamAttempt } from "../types";
import { inferQuestionScope } from "../utils/studyEngine";

interface WeightHeatmapProps {
  attempts?: ExamAttempt[];
}

interface WeightSubject {
  name: string;
  weight: string;
  userAccuracy: number | null;
  questionsAnswered: number;
  badge: string;
}

export default function WeightHeatmap({ attempts = [] }: WeightHeatmapProps) {
  const answeredQuestions = attempts.flatMap(attempt =>
    (attempt.questions || []).map((question, index) => ({
      isCorrect: attempt.selectedAnswers?.[index] === question.correctIndex,
      isGeneral: inferQuestionScope(question) === "general",
    }))
  );

  const getAccuracy = (general: boolean): number | null => {
    const questions = answeredQuestions.filter(question => question.isGeneral === general);
    if (questions.length === 0) return null;
    return Math.round((questions.filter(question => question.isCorrect).length / questions.length) * 100);
  };

  const subjects: WeightSubject[] = [
    {
      name: "Competências específicas de Enfermagem",
      weight: "80% da prova",
      userAccuracy: getAccuracy(false),
      questionsAnswered: answeredQuestions.filter(question => !question.isGeneral).length,
      badge: "Maior parte da prova",
    },
    {
      name: "Competências gerais e políticas de saúde",
      weight: "20% da prova",
      userAccuracy: getAccuracy(true),
      questionsAnswered: answeredQuestions.filter(question => question.isGeneral).length,
      badge: "Base comum",
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-extrabold">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Composição do ENARE</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
          Desempenho por bloco da prova
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          A acurácia só aparece quando as questões e respostas do simulado foram salvas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map(subject => (
          <div key={subject.name} className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block bg-indigo-600 text-white">
                {subject.badge} · {subject.weight}
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-3 leading-snug">{subject.name}</h4>
            </div>
            <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Sua acurácia:</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                  {subject.userAccuracy === null ? "—" : `${subject.userAccuracy}%`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Questões respondidas:</span>
                <span className="font-extrabold text-indigo-500 font-mono">{subject.questionsAnswered}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${subject.userAccuracy || 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-300 font-medium flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-500 shrink-0" />
        <span>A divisão é uma referência do edital vigente; a classificação em “gerais” e “específicas” é inferida pelo tema cadastrado no treino e não substitui a conferência do edital oficial.</span>
      </div>
    </div>
  );
}
