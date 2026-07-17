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
  Sparkles
} from "lucide-react";
import { Language, translations, StudyModule, Flashcard, ExamAttempt, UserProfile } from "../types";
import { IMAGES, MOCK_SCHEDULE } from "../data";
import { getStudyRecommendation } from "../utils/performance";

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
  attempts = [],
  setActiveTab,
  questionsCount,
  onQuestionsAnswered,
  checklist,
  setChecklist,
  cadernoErros,
  setCadernoErros
}: DashboardProps) {
  const [activeSyllabusTab, setActiveSyllabusTab] = useState<"basics" | "specifics" | "strategy">("basics");
  const t = translations[language];

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-800 to-slate-900 p-8 text-white shadow-lg border border-sky-700/20">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase inline-flex items-center space-x-1">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Preparação ENARE: Ativa</span>
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">{t.welcomeBack} {profile.firstName}!</h2>
          <p className="text-slate-300 text-sm font-medium leading-relaxed">{t.portalSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-sky-500/10 p-3 rounded-xl text-sky-600"><BookOpen className="h-6 w-6" /></div>
            <span className="text-xs font-semibold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">{percentLessons}% total</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aulas Concluídas</p>
            <p className="text-2xl font-black">{completedLessons} / {totalLessons}</p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${percentLessons}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-600"><Target className="h-6 w-6" /></div>
            <span className="text-xs font-semibold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">{weeklyQuestionsPercent}%</span>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meta Semanal</p>
            <p className="text-2xl font-black">{weeklyQuestionsDone} / 300 Q</p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${weeklyQuestionsPercent}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-amber-500/10 p-3 rounded-xl text-amber-600"><Award className="h-6 w-6" /></div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Média nos Simulados</p>
            <p className="text-2xl font-black">{attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0}%</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tight">Performance Geral</p>
        </div>
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
