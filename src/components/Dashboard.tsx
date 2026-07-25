import React, { useState } from "react";
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Activity, 
  Heart,
  ChevronRight,
  UserCheck,
  Stethoscope,
  Plus,
  Trash2,
  ListTodo,
  Flame,
  Target,
  GraduationCap,
  Sparkles,
  Zap,
  Building2,
  AlertCircle
} from "lucide-react";
import { Language, translations, StudyModule, Flashcard, ExamAttempt, UserProfile } from "../types";
import { IMAGES, MOCK_SCHEDULE, MOCK_QUESTIONS } from "../data";
import { getStudyRecommendation } from "../utils/performance";
import { ENARE_INSTITUTIONS } from "../data/enareCutoffs";

interface DashboardProps {
  language: Language;
  profile: UserProfile;
  modules: StudyModule[];
  flashcards: Flashcard[];
  attempts?: ExamAttempt[];
  setActiveTab: (tab: any) => void;
  questionsCount: number;
  onQuestionsAnswered?: (count: number) => void;
  checklist: any[];
  setChecklist: (checklist: any[]) => void;
  cadernoErros: any[];
  setCadernoErros: (caderno: any[]) => void;
}

export default function Dashboard({
  language,
  profile,
  modules,
  flashcards,
  attempts = [],
  setActiveTab,
  questionsCount,
  onQuestionsAnswered,
  checklist,
  setChecklist,
  cadernoErros = [],
  setCadernoErros
}: DashboardProps) {
  const [activeSyllabusTab, setActiveSyllabusTab] = useState<"basics" | "specifics" | "strategy">("basics");
  const t = translations[language];

  // Target Institution Simulator State
  const [selectedInstId, setSelectedInstId] = useState<string>("ebserh-nacional");
  const selectedInstitution = ENARE_INSTITUTIONS.find(i => i.id === selectedInstId) || ENARE_INSTITUTIONS[0];

  // Calculate current score average
  const currentAvgScore = attempts.length > 0 
    ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) 
    : 78; // Default initial benchmark

  const cutoffGap = selectedInstitution.cutoffPercentage - currentAvgScore;
  const isAboveCutoff = currentAvgScore >= selectedInstitution.cutoffPercentage;

  // Daily 3-Question Challenge State
  const dailyQuestions = MOCK_QUESTIONS.slice(0, 3);
  const [dailyAnswers, setDailyAnswers] = useState<{ [key: number]: number }>({});
  const [dailySubmitted, setDailySubmitted] = useState<boolean>(false);

  const toggleChecklistItem = (id: string) => {
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated);
  };

  const [newError, setNewError] = useState({ topic: "Legislação do SUS", concept: "", correction: "" });
  const [showAddError, setShowAddError] = useState(false);

  const handleAddError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newError.concept.trim() || !newError.correction.trim()) return;
    const item = {
      id: "err-" + Date.now(),
      topic: newError.topic,
      concept: newError.concept,
      correction: newError.correction,
      date: new Date().toISOString().split("T")[0]
    };
    setCadernoErros([item, ...cadernoErros]);
    setNewError({ topic: "Legislação do SUS", concept: "", correction: "" });
    setShowAddError(false);
  };

  const weeklyQuestionsTarget = 300;
  const weeklyQuestionsDone = questionsCount;
  const weeklyQuestionsPercent = Math.min(Math.round((weeklyQuestionsDone / weeklyQuestionsTarget) * 100), 100);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0);
  const percentLessons = Math.round((completedLessons / totalLessons) * 100) || 0;

  const recommendation = getStudyRecommendation(attempts, modules);
  const cardiModule = recommendation?.recommendedModule || modules[0];
  const cardiCompleted = cardiModule.lessons.filter(l => l.completed).length;
  const cardiTotal = cardiModule.lessons.length;
  const cardiPercent = Math.round((cardiCompleted / cardiTotal) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner Principal com Gradiente e Widget de Ofensiva */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-sky-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase inline-flex items-center space-x-1.5 backdrop-blur-md">
                <Activity className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                <span>Foco ENARE 2026/2027</span>
              </span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase inline-flex items-center space-x-1.5 backdrop-blur-md">
                <Clock className="h-3.5 w-3.5 text-purple-400" />
                <span>Reta Final de Estudos</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
              {t.welcomeBack}, <span className="bg-gradient-to-r from-sky-300 via-teal-200 to-white bg-clip-text text-transparent">{profile.firstName}!</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              {t.portalSubtitle} Continue mantendo o ritmo diário para garantir sua vaga na residência!
            </p>
          </div>

          {/* Widgets de Status (Streak + Countdown) */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Streak Widget */}
            <div className="bg-white/10 dark:bg-slate-900/70 border border-white/20 p-4 rounded-2xl backdrop-blur-md flex items-center space-x-3.5 shadow-xl neon-border-flame">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-rose-500 text-white rounded-xl shadow-md">
                <Flame className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block font-mono">Ofensiva Viva</span>
                <p className="text-lg font-black text-white font-mono">7 Dias 🔥</p>
              </div>
            </div>

            {/* Target Countdown Widget */}
            <div className="bg-white/10 dark:bg-slate-900/70 border border-white/20 p-4 rounded-2xl backdrop-blur-md flex items-center space-x-3.5 shadow-xl neon-border-sky">
              <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl shadow-md">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-sky-300 uppercase tracking-widest block font-mono">Prova Objetiva ENARE</span>
                <p className="text-lg font-black text-white font-mono">13/09/2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Aulas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover-glow">
          <div className="flex justify-between items-start">
            <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-500"><BookOpen className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">{percentLessons}% Concluído</span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Aulas Concluídas</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">{completedLessons} <span className="text-base font-medium text-slate-400">/ {totalLessons}</span></p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${percentLessons}%` }} />
          </div>
        </div>

        {/* Card Meta Semanal */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover-glow">
          <div className="flex justify-between items-start">
            <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500"><Target className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">{weeklyQuestionsPercent}% Meta</span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Meta Semanal de Questões</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">{weeklyQuestionsDone} <span className="text-base font-medium text-slate-400">/ 300 Q</span></p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${weeklyQuestionsPercent}%` }} />
          </div>
        </div>

        {/* Card Desempenho Simulados */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover-glow">
          <div className="flex justify-between items-start">
            <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500"><Award className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">{attempts.length} Simulados</span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Média Geral nos Simulados</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0}%
            </p>
          </div>
          <p className="text-[10px] text-emerald-500 font-bold mt-4 uppercase font-mono flex items-center space-x-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Desempenho acima da média nacional</span>
          </p>
        </div>
      </div>


      {/* Widget Especial: Hospital dos Sonhos & Simulador de Aprovação ENARE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-extrabold text-indigo-300">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Hospital dos Sonhos • Residência Enfermagem</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              Simulador de Nota de Corte ENARE
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-medium">
              Escolha a instituição onde deseja conquistar sua vaga de residência e acompanhe a distância exata até a nota de corte histórica.
            </p>
          </div>

          {/* Institutional Selector */}
          <div className="shrink-0 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md space-y-1.5 w-full sm:w-80">
            <label className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block font-mono">
              Selecione seu Hospital dos Sonhos
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs font-extrabold p-2.5 rounded-xl border border-indigo-500/40 outline-none cursor-pointer"
            >
              {ENARE_INSTITUTIONS.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.cutoffPercentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Instituição Alvo</span>
              <p className="text-sm font-black text-white">{selectedInstitution.name}</p>
              <span className="text-[10px] text-indigo-400 font-bold">{selectedInstitution.badge} • {selectedInstitution.vacancies} Vagas</span>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center space-x-3.5">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Nota de Corte Histórica</span>
              <p className="text-2xl font-black text-white font-mono">{selectedInstitution.cutoffPercentage}%</p>
              <span className="text-[10px] text-slate-400 font-medium">Média mínima estimada</span>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center space-x-3.5">
            <div className={`p-3 rounded-xl ${isAboveCutoff ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              {isAboveCutoff ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Status da Sua Média</span>
              <p className={`text-2xl font-black font-mono ${isAboveCutoff ? "text-emerald-400" : "text-amber-400"}`}>
                {currentAvgScore}%
              </p>
              <span className="text-[10px] font-bold">
                {isAboveCutoff 
                  ? "🎉 Você está ACIMA da nota de corte!" 
                  : `Faltam ${cutoffGap.toFixed(1)}% para a nota de corte!`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Especial: Desafio Diário ENARE em 5 Minutos */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-teal-500 text-white rounded-xl shadow-md">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                ⚡ Desafio Diário ENARE (3 Questões do Dia)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Responda às 3 questões do dia para manter sua Ofensiva Viva ativada!
              </p>
            </div>
          </div>
          {dailySubmitted && (
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-black">
              ✓ Desafio Concluído Hoje! (+1 Dia na Ofensiva)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {dailyQuestions.map((q, qIdx) => (
            <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-500 font-mono block">Questão {qIdx + 1} • {q.category}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-3">
                  {q.question}
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = dailyAnswers[qIdx] === optIdx;
                  const isCorrect = optIdx === q.correctIndex;
                  let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                  
                  if (dailySubmitted) {
                    if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold";
                    else if (isSelected) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-extrabold";
                  } else if (isSelected) {
                    btnStyle = "bg-indigo-600 text-white font-extrabold border-indigo-600";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={dailySubmitted}
                      onClick={() => setDailyAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                      className={`w-full text-left p-2 rounded-xl border text-[11px] font-medium transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!dailySubmitted && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setDailySubmitted(true);
                if (onQuestionsAnswered) onQuestionsAnswered(3);
              }}
              disabled={Object.keys(dailyAnswers).length < 3}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 hover:scale-[1.02] text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              Concluir Desafio Diário ✨
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
            <div className="w-full sm:w-2/5 h-48 sm:h-auto bg-slate-900">
              <img src={IMAGES.anatomicalHeart} alt="Cardiology" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="bg-sky-500/10 text-sky-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{cardiModule.category}</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{cardiModule.title}</h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{cardiModule.description}</p>
                {recommendation && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500 border border-slate-100">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Dica da Tutoria:</span> {recommendation.reason}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cardiPercent}% concluído</span>
                <button onClick={() => setActiveTab("modules")} className="bg-sky-600 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center space-x-1">
                  <span>Estudar</span> <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center space-x-2">
                <ListTodo className="h-4 w-4 text-sky-500" />
                <span>Checklist da Semana</span>
              </h4>
              <div className="space-y-3">
                {checklist.map(item => (
                  <label key={item.id} className="flex items-center space-x-3 text-xs cursor-pointer group">
                    <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(item.id)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
                    <span className={item.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-rose-500" />
                  <span>Caderno de Erros</span>
                </h4>
                <button onClick={() => setShowAddError(!showAddError)} className="text-[10px] font-bold bg-slate-100 p-1.5 rounded-lg text-slate-600"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {cadernoErros.length === 0 ? <p className="text-[10px] text-slate-400 text-center py-4">Nenhum erro registrado ainda.</p> : cadernoErros.map(err => (
                  <div key={err.id} className="p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 relative group">
                    <button onClick={() => setCadernoErros(cadernoErros.filter(e => e.id !== err.id))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-slate-400" /></button>
                    <span className="text-[9px] font-bold text-sky-500 uppercase">{err.topic}</span>
                    <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">{err.concept}</h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
            <Calendar className="h-5 w-5 text-sky-500" />
            <h3 className="font-bold text-lg">Agenda Semanal</h3>
          </div>
          <div className="space-y-3">
            {MOCK_SCHEDULE.map(event => (
              <div key={event.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center space-x-4">
                <div className="text-center border-r pr-3 min-w-[50px]">
                  <span className="block text-[10px] font-bold text-sky-500 uppercase">{event.date.split(" ")[0]}</span>
                  <span className="block text-[10px] font-bold text-slate-400">{event.date.split(" ")[1]}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{event.time}</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{event.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
