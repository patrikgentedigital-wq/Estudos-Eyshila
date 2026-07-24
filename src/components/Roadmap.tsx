import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  BookOpen, 
  ClipboardCheck, 
  Lock, 
  ChevronRight, 
  Clock,
  Layout,
  Flashlight,
  Sparkles,
  AlertTriangle,
  Flame
} from "lucide-react";
import { RoadmapWeek, Tab } from "../types";

interface RoadmapProps {
  roadmap: RoadmapWeek[];
  onToggleTask: (weekIdx: number, taskIdx: number) => void;
  setActiveTab: (tab: Tab) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ roadmap, onToggleTask, setActiveTab }) => {
  // Target Exam Date State (Default: 2026-10-20, typical ENARE exam period)
  const [examDate, setExamDate] = useState<string>("2026-10-20");

  // Calculate days & weeks remaining until target date
  const today = new Date();
  const target = new Date(examDate);
  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));

  // Progress metrics
  const totalTasks = roadmap.reduce((acc, w) => acc + w.tasks.length, 0);
  const completedTasks = roadmap.reduce((acc, w) => acc + w.tasks.filter(t => t.completed).length, 0);
  const remainingTasks = totalTasks - completedTasks;

  // Pace indicator: Tasks per week needed
  const neededTasksPerWeek = Math.ceil(remainingTasks / weeksRemaining);
  
  let paceStatus = { text: "No Ritmo Ideal", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Sparkles };
  if (neededTasksPerWeek > 5) {
    paceStatus = { text: "Necessário Acelerar", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: AlertTriangle };
  } else if (neededTasksPerWeek <= 2) {
    paceStatus = { text: "Ritmo Confortável", color: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Flame };
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header & Adaptive Date Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-xs font-bold uppercase tracking-wider">Edital Esquematizado</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${paceStatus.color}`}>
                <paceStatus.icon className="h-3 w-3 inline" />
                {paceStatus.text}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mt-2">
              Roteiro Adaptativo ENARE
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Plano dinâmico que recalcula sua carga de estudos conforme a data da prova.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Calendar className="h-5 w-5 text-sky-500 shrink-0" />
            <div className="flex flex-col">
              <label htmlFor="exam-date-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data do Concurso</label>
              <input 
                id="exam-date-input"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-hidden cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Adaptive Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dias Restantes</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{daysRemaining} dias</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semanas Úteis</span>
            <span className="text-xl font-black text-sky-600 dark:text-sky-400">{weeksRemaining} sem</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meta Semanal</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{neededTasksPerWeek} tópicos/sem</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conclusão Edital</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{Math.round((completedTasks / (totalTasks || 1)) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-2 bg-sky-500 text-white rounded-lg">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-sky-600 uppercase">Seg-Sex</h4>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">50m Temas + 10m Flashcards</p>
          </div>
        </div>
        <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-2 bg-indigo-500 text-white rounded-lg">
            <Layout className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-indigo-600 uppercase">Fim de Semana</h4>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">1 Simulado (80Q) - 3h30min</p>
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-2 bg-amber-500 text-white rounded-lg">
            <Flashlight className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-amber-600 uppercase">Foco</h4>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Questões &gt; Resumos</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {roadmap.map((week, wIdx) => (
          <motion.div 
            key={week.week}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wIdx * 0.1 }}
            className={`relative p-1 rounded-3xl ${
              week.status === "current" 
                ? "bg-linear-to-r from-sky-500 to-indigo-500" 
                : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                    week.status === "completed" 
                      ? "bg-green-500 text-white" 
                      : week.status === "current"
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {week.week}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semana</span>
                      {week.status === "current" && (
                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[8px] font-bold rounded-full uppercase">Atual</span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                      {week.label}
                    </h3>
                  </div>
                </div>
                {week.status === "completed" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                {week.status === "locked" && <Lock className="h-5 w-5 text-slate-300" />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <BookOpen className="h-3 w-3" />
                    <span>Tópicos Prioritários</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {week.topics.map((topic, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-100 dark:border-slate-750">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <ClipboardCheck className="h-3 w-3" />
                    <span>Metas da Semana</span>
                  </h4>
                  <div className="space-y-3">
                    {week.tasks.map((task, tIdx) => (
                      <button
                        key={task.id}
                        onClick={() => onToggleTask(wIdx, tIdx)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-2xl border transition-all ${
                          task.completed 
                            ? "bg-green-50 border-green-100 dark:bg-green-500/10 dark:border-green-500/20" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800"
                        }`}
                      >
                        {task.completed ? (
                          <div className="bg-green-500 rounded-lg p-1">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <Circle className="h-3 w-3 text-slate-300" />
                          </div>
                        )}
                        <span className={`text-xs font-bold text-left ${
                          task.completed ? "text-green-700 dark:text-green-400 line-through" : "text-slate-600 dark:text-slate-300"
                        }`}>
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {week.status === "current" && (
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                  <button 
                    onClick={() => setActiveTab("modules")}
                    className="group flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-sky-500/20 transition-all"
                  >
                    <span>Ir para Módulos de Estudo</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-linear-to-br from-indigo-600 to-violet-700 rounded-[32px] text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight">Dicas Finais para o Sucesso</h3>
            <ul className="space-y-2 text-sm text-indigo-100 font-medium list-disc list-inside">
              <li>Consistência: 1h todo dia &gt; 5h no fim de semana.</li>
              <li>Simulados são ouro: Fazer questões &gt; Resumir.</li>
              <li>Foco nos erros: Cada questão errada é uma aula grátis.</li>
              <li>Sono é essencial: 7-8h por noite consolida a memória.</li>
            </ul>
          </div>
          <div className="shrink-0">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Mensagem de Apoio</p>
               <p className="text-sm font-bold italic">"Prepara-se o cavalo para o dia da batalha, mas o Senhor é que dá a vitória."</p>
               <p className="text-[10px] font-bold mt-2 opacity-60">Provérbios 21:31</p>
             </div>
          </div>
        </div>
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>
    </div>
  );
};

export default Roadmap;
