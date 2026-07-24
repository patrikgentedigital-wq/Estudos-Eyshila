import { useState, useEffect } from "react";
import { 
  Search, 
  BookOpen, 
  CheckCircle, 
  Play, 
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Heart,
  Baby,
  ShieldAlert,
  Brain,
  CheckCircle2,
  Pause,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { Language, StudyModule, Lesson, translations } from "../types";
import { OFFICIAL_MODULES } from "../data/officialModules";
import { useTTS } from "../hooks/useTTS";

interface StudyModulesProps {
  language: Language;
  modules: StudyModule[];
  onToggleLesson: (moduleId: string, lessonId: string) => void;
}

export default function StudyModules({
  language,
  modules,
  onToggleLesson
}: StudyModulesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed" | "official">("all");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>("mod-basicos");
  const [activeLesson, setActiveLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(null);

  // TTS Hook
  const { speak, pause, resume, stop, isSpeaking, isPaused, supported: ttsSupported } = useTTS();

  // Pomodoro Timer States
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");

  // Flashcards States
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const flashcards = [
    {
      front: "Qual a Resolução do COFEN que aprova o novo Código de Ética?",
      back: "Resolução COFEN nº 564/2017.",
      hint: "Legislação"
    },
    {
      front: "Quais os 3 parâmetros do Triângulo de Avaliação Pediátrica?",
      back: "Aparência, Trabalho Respiratório e Circulação Cutânea.",
      hint: "Pediatria"
    },
    {
      front: "O que o acrônimo 'GCS-P' adiciona à Escala de Glasgow?",
      back: "Adiciona a Reatividade Pupilar.",
      hint: "Neurologia"
    }
  ];

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerRunning(false);
      if (timerMode === "focus") {
        setTimerMode("break");
        setPomodoroTime(5 * 60);
        alert("Tempo de foco encerrado! Descanse por 5 minutos.");
      } else {
        setTimerMode("focus");
        setPomodoroTime(25 * 60);
        alert("Intervalo encerrado! Hora de focar.");
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime, timerMode]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const t = translations[language];

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart": return <Heart className="h-5 w-5 text-rose-500" />;
      case "Baby": return <Baby className="h-5 w-5 text-sky-500" />;
      case "ShieldAlert": return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case "Brain": return <Brain className="h-5 w-5 text-purple-500" />;
      default: return <BookOpen className="h-5 w-5 text-sky-500" />;
    }
  };

  // Combine user modules and official modules without duplicates
  const existingIds = new Set(modules.map(m => m.id));
  const uniqueOfficial = OFFICIAL_MODULES.filter(om => !existingIds.has(om.id));
  const allAvailableModules = [...modules, ...uniqueOfficial];

  const filteredModules = allAvailableModules.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "official") return (m as any).isOfficial;
    if (filter === "my_modules") return !(m as any).isOfficial;

    const total = m.lessons.length;
    const completed = m.lessons.filter((l) => l.completed).length;

    if (filter === "completed") return completed === total && total > 0;
    if (filter === "in-progress") return completed > 0 && completed < total;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Módulos de Estudo</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">Grade curricular recomendada para residência em enfermagem.</p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
          />
        </div>
      </div>

      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px space-x-6 text-sm font-semibold">
        {[
          { id: "all", label: "Todos os Módulos" },
          { id: "official", label: "Módulos Oficiais (ENARE)" },
          { id: "my_modules", label: "Meus Módulos (IA)" },
          { id: "in-progress", label: "Em Progresso" },
          { id: "completed", label: "Concluídos" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`pb-3 transition-all border-b-2 ${filter === tab.id ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400">
              <BookOpenCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold">Nenhum módulo encontrado.</p>
            </div>
          ) : (
            filteredModules.map((m) => {
              const isExpanded = expandedModuleId === m.id;
              const completedCount = m.lessons.filter((l) => l.completed).length;
              const totalCount = m.lessons.length;
              const percent = Math.round((completedCount / totalCount) * 100);

              return (
                <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                  <div 
                    onClick={() => setExpandedModuleId(isExpanded ? null : m.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">{getModuleIcon(m.iconName)}</div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.category}</span>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{m.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="hidden sm:flex flex-col items-end text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{completedCount} / {totalCount} aulas</span>
                        <span className="text-[10px] text-slate-400">{percent}% concluído</span>
                      </div>
                      {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 px-5 py-4 space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400 pb-2 leading-relaxed">{m.description}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {m.lessons.map((lesson, index) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <button
                                onClick={() => onToggleLesson(m.id, lesson.id)}
                                className={`p-1 rounded-full ${lesson.completed ? "text-sky-500 bg-sky-500/10" : "text-slate-300 bg-slate-50"}`}
                              >
                                <CheckCircle className="h-5 w-5 fill-current" />
                              </button>
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">AULA 0{index + 1}</span>
                                <h4 
                                  onClick={() => setActiveLesson({ moduleId: m.id, lesson })}
                                  className={`text-sm font-semibold truncate cursor-pointer ${lesson.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"}`}
                                >
                                  {lesson.title}
                                </h4>
                              </div>
                            </div>
                            <button onClick={() => setActiveLesson({ moduleId: m.id, lesson })} className="p-1.5 hover:text-sky-500"><Play className="h-4 w-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-sky-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Método Pomodoro</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${timerMode === "focus" ? "bg-rose-500/10 text-rose-500" : "bg-teal-500/10 text-teal-500"}`}>
                {timerMode === "focus" ? "Foco" : "Pausa"}
              </span>
            </div>
            <div className="text-center py-4">
              <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">{formatTimer(pomodoroTime)}</span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{timerMode === "focus" ? "Sessão de Foco" : "Intervalo de Descanso"}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-xl flex items-center justify-center space-x-2">
                {isTimerRunning ? <><Pause className="h-4 w-4" /> <span>Pausar</span></> : <><Play className="h-4 w-4 fill-current" /> <span>Iniciar</span></>}
              </button>
              <button onClick={() => { setIsTimerRunning(false); setPomodoroTime(25 * 60); setTimerMode("focus"); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Revisão Rápida</h4>
              </div>
            </div>
            <div onClick={() => setIsCardFlipped(!isCardFlipped)} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 min-h-[120px] flex flex-col justify-between cursor-pointer">
              <div>
                <span className="text-[9px] font-bold text-purple-500 uppercase block mb-1">{flashcards[currentCardIndex].hint}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{isCardFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}</p>
              </div>
              <p className="text-[9px] text-slate-400 text-center uppercase font-bold">{isCardFlipped ? "Clique para ver pergunta" : "Clique para ver resposta"}</p>
            </div>
            <div className="flex space-x-2">
              <button disabled={currentCardIndex === 0} onClick={() => { setCurrentCardIndex(prev => prev - 1); setIsCardFlipped(false); }} className="flex-1 bg-slate-100 dark:bg-slate-800 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={currentCardIndex === flashcards.length - 1} onClick={() => { setCurrentCardIndex(prev => prev + 1); setIsCardFlipped(false); }} className="flex-1 bg-slate-100 dark:bg-slate-800 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 flex items-center justify-center"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-950 h-full p-8 shadow-2xl overflow-y-auto animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-sky-500/10 text-sky-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">AULA DE HOJE</span>
              <button onClick={() => setActiveLesson(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">✕</button>
            </div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight pr-4">{activeLesson.lesson.title}</h3>
                
                {/* TTS Botões */}
                {ttsSupported && (
                  <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-1.5 py-1">
                    {!isSpeaking && !isPaused ? (
                      <button onClick={() => speak(activeLesson.lesson.content)} className="text-slate-600 dark:text-slate-400 hover:text-sky-500 transition-colors p-1" title="Ouvir Aula">
                        <Play className="h-4 w-4" />
                      </button>
                    ) : (
                      <>
                        <button onClick={isPaused ? resume : pause} className="text-sky-500 hover:text-sky-600 transition-colors p-1" title={isPaused ? "Retomar" : "Pausar"}>
                          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </button>
                        <button onClick={stop} className="text-red-400 hover:text-red-500 transition-colors p-1" title="Parar">
                          <span className="text-[10px] font-bold px-1 uppercase">Stop</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-2 font-bold uppercase">
                <Clock className="h-3 w-3" /> <span>{activeLesson.lesson.duration}</span> <span>•</span> <span>Residência Enfermagem</span>
              </div>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-4">
              <p className="whitespace-pre-wrap">{activeLesson.lesson.content}</p>
              <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl mt-8">
                <span className="font-bold text-[10px] text-sky-600 dark:text-sky-400 uppercase tracking-widest block mb-1">Dica de Prova</span>
                <p className="text-xs text-sky-800 dark:text-sky-300">Este assunto é recorrente no ENARE. Foque nos conceitos principais e legislações citadas.</p>
              </div>
            </div>
            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button
                onClick={() => {
                  onToggleLesson(activeLesson.moduleId, activeLesson.lesson.id);
                  setActiveLesson({ ...activeLesson, lesson: { ...activeLesson.lesson, completed: !activeLesson.lesson.completed } });
                }}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeLesson.lesson.completed ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20"}`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{activeLesson.lesson.completed ? "Desmarcar Aula" : "Marcar como Concluída"}</span>
              </button>
              <button onClick={() => setActiveLesson(null)} className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 py-3 px-8 rounded-xl text-xs font-bold">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
