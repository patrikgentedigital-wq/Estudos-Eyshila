import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, GraduationCap, Calendar, Bell, Shield, LayoutDashboard, BookOpen, Award, Sparkles, Compass } from "lucide-react";
import Toast, { ToastMessage } from "./components/Toast";

import { Tab, Language, UserProfile, StudyModule, Flashcard, ExamAttempt, translations, RoadmapWeek, RoadmapTask, ChecklistItem, CadernoErroItem } from "./types";
import { INITIAL_PROFILE, INITIAL_MODULES, INITIAL_FLASHCARDS, INITIAL_ATTEMPTS } from "./data";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./utils/storage";

// Supabase Client
import { supabase, isSupabaseConfigured } from "./supabase";

// Sidebar & Login imports
import Sidebar from "./components/Sidebar";
import { measureQuery } from "./dbLogger";
import Login from "./components/Login";

// Lazy-loaded tab components for code splitting
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const StudyModules = React.lazy(() => import("./components/StudyModules"));
const ExamPrep = React.lazy(() => import("./components/ExamPrep"));
const Flashcards = React.lazy(() => import("./components/Flashcards"));
const Performance = React.lazy(() => import("./components/Performance"));
const ProfileSettings = React.lazy(() => import("./components/ProfileSettings"));
const AiStudy = React.lazy(() => import("./components/AiStudy"));
const Roadmap = React.lazy(() => import("./components/Roadmap"));

export default function App() {
  
  // Session & UI States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  
  const language: Language = "pt";
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return safeGetItem("residency_dark_mode") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [cadernoErros, setCadernoErros] = useState<CadernoErroItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: "success" | "error" | "info" = "info") => {
    const id = "toast-" + Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Default 45-Day ENADE/ENARE Study Plan (7 Weeks / 1h daily)
  const DEFAULT_ROADMAP: RoadmapWeek[] = [
    {
      week: 1,
      label: "Dias 1-7: Formação Geral ENADE (Peso 25%)",
      topics: ["Direitos Humanos", "Ética Global", "Sustentabilidade", "Interpretação de Texto"],
      status: "current",
      tasks: [
        { id: "w1-t1", title: "Estudar 5 questões de Formação Geral (Direitos Humanos e Diversidade)", completed: false },
        { id: "w1-t2", title: "Treino de Interpretação e Coesão Textual aplicada a Saúde Pública", completed: false },
        { id: "w1-t3", title: "Prática de 10 min de flashcards de Formação Geral", completed: false }
      ]
    },
    {
      week: 2,
      label: "Dias 8-14: Legislação Estruturante do SUS",
      topics: ["Lei 8080/90", "Lei 8142/90", "Decreto 7508/11", "Controle Social"],
      status: "locked",
      tasks: [
        { id: "w2-t1", title: "Dominar Princípios Doutrinários x Organizativos do SUS", completed: false },
        { id: "w2-t2", title: "Resumir Regiões de Saúde e Portas de Entrada (Decreto 7.508)", completed: false },
        { id: "w2-t3", title: "Simulado 1 (20 questões de Legislação SUS)", completed: false }
      ]
    },
    {
      week: 3,
      label: "Dias 15-21: Processo de Enfermagem (COFEN 736/2024)",
      topics: ["5 Etapas SAE", "NANDA-I", "Taxonomia NIC/NOC", "Código de Ética 564/17"],
      status: "locked",
      tasks: [
        { id: "w3-t1", title: "Mapear as 5 etapas do Processo de Enfermagem segundo Res. COFEN 736/24", completed: false },
        { id: "w3-t2", title: "Estudo de Caso: Formulação de Diagnóstico de Enfermagem", completed: false },
        { id: "w3-t3", title: "Revisar Direitos e Proibições no Código de Ética", completed: false }
      ]
    },
    {
      week: 4,
      label: "Dias 22-28: Urgência, Emergência e UTI",
      topics: ["Protocolo XABCDE", "PCR AHA 2020", "Protocolo Manchester", "Drogas Vasoativas"],
      status: "locked",
      tasks: [
        { id: "w4-t1", title: "Memorizar Ritmos Chocáveis x Não Chocáveis na PCR", completed: false },
        { id: "w4-t2", title: "Cálculos de Gotejamento de Soro e Doses de Inotrópicos", completed: false },
        { id: "w4-t3", title: "Simulado 2 (Urgência, Emergência e UTI)", completed: false }
      ]
    },
    {
      week: 5,
      label: "Dias 29-35: Saúde da Mulher, Criança e Imunização",
      topics: ["Pré-Natal", "Calendário PNI 2024", "Puericultura", "Rede Cegonha"],
      status: "locked",
      tasks: [
        { id: "w5-t1", title: "Revisar Esquema Vacinal do Recém-Nascido e Criança (PNI)", completed: false },
        { id: "w5-t2", title: "Consultas de Pré-Natal e Intercorrências Gravídicas", completed: false },
        { id: "w5-t3", title: "Prática de Flashcards de Imunização e Puericultura", completed: false }
      ]
    },
    {
      week: 6,
      label: "Dias 36-41: Gestão, Saúde Mental e Biossegurança",
      topics: ["Dimensionamento COFEN", "RAPS", "NR-32", "Vigilância Epidemiológica"],
      status: "locked",
      tasks: [
        { id: "w6-t1", title: "Estudar Dimensionamento de Pessoal de Enfermagem", completed: false },
        { id: "w6-t2", title: "Rede de Atenção Psicossocial (RAPS) e Saúde Mental", completed: false },
        { id: "w6-t3", title: "Revisar Lista de Notificação Compulsória Imediata", completed: false }
      ]
    },
    {
      week: 7,
      label: "Dias 42-45: Reta Final ENADE (Simulado & Discursivas)",
      topics: ["Simulado Geral", "Questão Discursiva com Espelho", "Revisão Caderno de Erros"],
      status: "locked",
      tasks: [
        { id: "w7-t1", title: "Redigir 1 Questão Discursiva no formato ENADE", completed: false },
        { id: "w7-t2", title: "Simulado Geral ENADE (100 Questões Multidisciplinares)", completed: false },
        { id: "w7-t3", title: "Revisão Final de 100% das questões do Caderno de Erros", completed: false }
      ]
    }
  ];

  // Business Data States
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [modules, setModules] = useState<StudyModule[]>(INITIAL_MODULES);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [attempts, setAttempts] = useState<ExamAttempt[]>(INITIAL_ATTEMPTS);
  const [questionsCount, setQuestionsCount] = useState<number>(0);

  const INITIAL_CHECKLIST = [
    { id: "theory", label: "Estudar Módulos de Enfermagem (SUS / Ética / UTI)", completed: true },
    { id: "questions", label: "Resolver 300 questões recomendadas", completed: false },
    { id: "caderno", label: "Alimentar Caderno de Erros", completed: false },
    { id: "flashcards", label: "Revisar Flashcards com Resumos Rápidos", completed: true },
    { id: "mock", label: "Realizar Simulado Parcial no Fim de Semana", completed: false }
  ];

  // Supabase Auth Observer
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
        }
        setIsAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
        }
        setIsAuthLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local fallback mode when Supabase env vars not provided
      const savedLoggedIn = safeGetItem("residency_logged_in") === "true";
      const savedUid = safeGetItem("residency_uid");
      setIsLoggedIn(savedLoggedIn);
      setUserId(savedUid || (savedLoggedIn ? "user-local-session" : null));
      setIsAuthLoading(false);
    }
  }, []);

  // Load user-specific data from Supabase (or LocalStorage fallback)
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && userId && !isAuthLoading) {
        setIsLoading(true);
        try {
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await measureQuery("fetch_user_data", () => 
              supabase
                .from("user_data")
                .select("*")
                .eq("id", userId)
                .maybeSingle()
            );

            if (error) {
              console.warn("[Supabase Data Load Error]", error.message);
            }

            if (data) {
              if (data.profile) setProfile(data.profile);
              if (data.modules) setModules(data.modules);
              if (data.flashcards) setFlashcards(data.flashcards);
              if (data.attempts) setAttempts(data.attempts);
              if (data.questions_count !== undefined) setQuestionsCount(data.questions_count);
              if (data.checklist) setChecklist(data.checklist);
              else setChecklist(INITIAL_CHECKLIST);
              if (data.caderno_erros) setCadernoErros(data.caderno_erros);
              else setCadernoErros([]);
              if (data.roadmap) setRoadmap(data.roadmap);
              else setRoadmap(DEFAULT_ROADMAP);
              setIsLoading(false);
              return;
            }
          }

          // Fallback to LocalStorage
          const savedProfile = safeGetItem(`residency_profile_${userId}`);
          const savedModules = safeGetItem(`residency_modules_${userId}`);
          const savedFlashcards = safeGetItem(`residency_flashcards_${userId}`);
          const savedAttempts = safeGetItem(`residency_attempts_${userId}`);
          const savedQuestions = safeGetItem(`residency_questions_count_${userId}`);
          const savedChecklist = safeGetItem(`residency_checklist_${userId}`);
          const savedCaderno = safeGetItem(`residency_caderno_${userId}`);

          if (savedProfile) setProfile(JSON.parse(savedProfile));
          if (savedModules) setModules(JSON.parse(savedModules));
          if (savedFlashcards) setFlashcards(JSON.parse(savedFlashcards));
          if (savedAttempts) setAttempts(JSON.parse(savedAttempts));
          if (savedQuestions) setQuestionsCount(Number(savedQuestions));
          if (savedChecklist) setChecklist(JSON.parse(savedChecklist));
          else setChecklist(INITIAL_CHECKLIST);
          if (savedCaderno) setCadernoErros(JSON.parse(savedCaderno));
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!isLoggedIn) {
        setProfile(INITIAL_PROFILE);
        setModules(INITIAL_MODULES);
        setFlashcards(INITIAL_FLASHCARDS);
        setAttempts(INITIAL_ATTEMPTS);
        setQuestionsCount(0);
        setChecklist([]);
        setCadernoErros([]);
      }
    };

    loadUserData();
  }, [userId, isLoggedIn, isAuthLoading]);

  // Debounced save to Supabase
  const syncToSupabase = useCallback(async (dataToSync: any) => {
    if (isLoggedIn && userId && isSupabaseConfigured && supabase) {
      try {
        const { error } = await measureQuery("upsert_user_data", () => 
          supabase.from("user_data").upsert({
            id: userId,
            ...dataToSync,
            updated_at: new Date().toISOString(),
          })
        );
        if (error) {
          console.warn("[Supabase Sync Warning]", error.message);
        }
      } catch (err) {
        console.error("Erro ao sincronizar no Supabase:", err);
      }
    }
  }, [isLoggedIn, userId]);


  // Synchronize state preferences into LocalStorage
  useEffect(() => {
    safeSetItem("residency_logged_in", String(isLoggedIn));
    if (!isLoggedIn) {
      safeRemoveItem("residency_uid");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (userId) {
      safeSetItem("residency_uid", userId);
    }
  }, [userId]);

  useEffect(() => {
    safeSetItem("residency_dark_mode", String(darkMode));
    // Apply standard HTML dark class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_profile_${userId}`, JSON.stringify(profile));
      const timer = setTimeout(() => syncToSupabase({ profile }), 1000);
      return () => clearTimeout(timer);
    }
  }, [profile, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_modules_${userId}`, JSON.stringify(modules));
      const timer = setTimeout(() => syncToSupabase({ modules }), 2000);
      return () => clearTimeout(timer);
    }
  }, [modules, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_flashcards_${userId}`, JSON.stringify(flashcards));
      const timer = setTimeout(() => syncToSupabase({ flashcards }), 2000);
      return () => clearTimeout(timer);
    }
  }, [flashcards, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_attempts_${userId}`, JSON.stringify(attempts));
      const timer = setTimeout(() => syncToSupabase({ attempts }), 2000);
      return () => clearTimeout(timer);
    }
  }, [attempts, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_questions_count_${userId}`, String(questionsCount));
      const timer = setTimeout(() => syncToSupabase({ questions_count: questionsCount }), 2000);
      return () => clearTimeout(timer);
    }
  }, [questionsCount, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_checklist_${userId}`, JSON.stringify(checklist));
      const timer = setTimeout(() => syncToSupabase({ checklist }), 2000);
      return () => clearTimeout(timer);
    }
  }, [checklist, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_caderno_${userId}`, JSON.stringify(cadernoErros));
      const timer = setTimeout(() => syncToSupabase({ caderno_erros: cadernoErros }), 2000);
      return () => clearTimeout(timer);
    }
  }, [cadernoErros, userId, isLoggedIn, syncToSupabase]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_roadmap_${userId}`, JSON.stringify(roadmap));
      const timer = setTimeout(() => syncToSupabase({ roadmap }), 2000);
      return () => clearTimeout(timer);
    }
  }, [roadmap, userId, isLoggedIn, syncToSupabase]);

  // Auth operations
  const handleLoginSuccess = (email: string, uid: string) => {
    setIsLoggedIn(true);
    setUserId(uid);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setUserId(null);
    safeRemoveItem("residency_logged_in");
    safeRemoveItem("residency_uid");
    setActiveTab("dashboard");
  };

  const handleToggleLesson = (moduleId: string, lessonId: string) => {
    setModules((prevModules) =>
      prevModules.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) => {
            if (l.id !== lessonId) return l;
            return { ...l, completed: !l.completed };
          })
        };
      })
    );
  };

  const handleToggleRoadmapTask = (weekIdx: number, taskIdx: number) => {
    setRoadmap((prev) => {
      const updated = [...prev];
      updated[weekIdx].tasks[taskIdx].completed = !updated[weekIdx].tasks[taskIdx].completed;
      
      const allCompleted = updated[weekIdx].tasks.every(t => t.completed);
      if (allCompleted) {
        updated[weekIdx].status = "completed";
        if (weekIdx + 1 < updated.length && updated[weekIdx + 1].status === "locked") {
          updated[weekIdx + 1].status = "current";
        }
      } else {
        updated[weekIdx].status = "current";
      }
      return updated;
    });
  };

  const handleAddExamAttempt = (newAttempt: ExamAttempt) => {
    setAttempts((prev) => [newAttempt, ...prev]);
  };

  const handleQuestionsAnswered = (count: number) => {
    setQuestionsCount((prev) => prev + count);
  };

  const handleToggleLanguage = () => {
    // No-op or removed
  };

  // Render correct views based on Tab selection
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            language={language}
            profile={profile}
            modules={modules}
            flashcards={flashcards}
            attempts={attempts}
            setActiveTab={setActiveTab}
            questionsCount={questionsCount}
            onQuestionsAnswered={handleQuestionsAnswered}
            checklist={checklist}
            setChecklist={setChecklist}
            cadernoErros={cadernoErros}
            setCadernoErros={setCadernoErros}
          />
        );
      case "modules":
        return (
          <StudyModules
            language={language}
            modules={modules}
            onToggleLesson={handleToggleLesson}
          />
        );
      case "exams":
        return (
          <ExamPrep
            language={language}
            onQuestionsAnswered={handleQuestionsAnswered}
            attempts={attempts}
            onAddAttempt={handleAddExamAttempt}
            cadernoErros={cadernoErros}
          />
        );
      case "flashcards":
        return (
          <Flashcards
            language={language}
            flashcards={flashcards}
            t={translations[language]}
          />
        );
      case "performance":
        return <Performance language={language} attempts={attempts} />;
      case "ai-study":
        return <AiStudy language={language} />;
      case "roadmap":
        return <Roadmap roadmap={roadmap} onToggleTask={handleToggleRoadmapTask} setActiveTab={setActiveTab} />;
      case "settings":
        return (
          <ProfileSettings
            language={language}
            profile={profile}
            onSaveProfile={setProfile}
          />
        );
      default:
        return <div className="text-center py-12">Tab not implemented.</div>;
    }
  };

  const getTabTitle = () => {
    const titlesPt: Record<Tab, string> = {
      dashboard: "Painel de Controle",
      modules: "Módulos de Estudo",
      exams: "Central de Simulados",
      flashcards: "Flashcards de Revisão",
      performance: "Análise de Desempenho",
      settings: "Configurações de Perfil",
      "ai-study": "Estudos e Questões com IA",
      roadmap: "Roteiro de Estudos Personalizado"
    };

    const titlesEn: Record<Tab, string> = {
      dashboard: "Study Dashboard",
      modules: "Study Curriculum Modules",
      exams: "ENARE Board Mock Exams",
      flashcards: "Revision Flashcards",
      performance: "Study Performance",
      settings: "Profile & Settings",
      "ai-study": "AI Study Co-Pilot",
      roadmap: "Personalized Study Roadmap"
    };

    return titlesPt[activeTab];
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black p-6">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Iniciando ambiente de estudos...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        language={language}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${darkMode ? "bg-black text-slate-100" : "bg-slate-100 text-slate-800"}`}>
      
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          profile={profile}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Slide-out Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Backdrop mask */}
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
          />
          {/* Drawer container */}
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 text-white h-full shadow-2xl">
            {/* Close trigger inside sidebar top */}
            <div className="absolute top-5 right-5 z-10">
              <button
                id="btn-close-mobile-menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Sidebar component body */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              language={language}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              profile={profile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* RIGHT SIDEBAR: Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* TOP COMPREHENSIVE HEADER ROW (NotebookLM Style) */}
        <header className="sticky top-0 z-30 bg-[#f8f9fa]/90 dark:bg-[#131314]/90 backdrop-blur-md border-b border-[#e3e3e3] dark:border-[#2d2d30] h-16 px-6 flex items-center justify-between">
          
          {/* Left Column: Title / Hamburger */}
          <div className="flex items-center space-x-4">
            <button
              id="btn-open-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                {getTabTitle()}
              </h2>
            </div>
          </div>

          {/* Right Column: Mini Stats and Quick Indicator badges */}
          <div className="flex items-center space-x-3.5">
            
            {/* Calendar indicators */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Calendar className="h-3.5 w-3.5 text-sky-500" />
              <span>16 de Julho de 2026</span>
            </div>

            {/* Quick preceptor alert */}
            <div className="notebook-chip px-3 py-1 rounded-full text-[10px] font-bold font-mono hidden md:inline-block uppercase tracking-wider">
              {profile.residencyYear.includes("Mentora") || profile.residencyYear.includes("Preceptor") 
                ? "🎓 Mentoria" 
                : "📝 Estudante ENARE"}
            </div>

            {/* Notification bell */}
            <button 
              id="btn-header-notifs"
              onClick={() => addToast("Sua caixa de notificações está limpa! ✓", "success")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            </button>
          </div>

        </header>

        {/* MAIN BODY SCROLL CONTAINER (NotebookLM Background) */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto pb-20 lg:pb-8 bg-[#f8f9fa] dark:bg-[#131314]">
          <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-medium animate-pulse">Carregando módulo...</span>
            </div>
          }>
            {renderTabContent()}
          </React.Suspense>
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around items-center">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === "dashboard" ? "text-sky-500 font-extrabold" : "text-slate-400"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Painel</span>
          </button>

          <button
            onClick={() => setActiveTab("modules")}
            className={`flex flex-col items-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === "modules" ? "text-sky-500 font-extrabold" : "text-slate-400"
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Módulos</span>
          </button>

          <button
            onClick={() => setActiveTab("ai-study")}
            className={`flex flex-col items-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === "ai-study" ? "text-sky-500 font-extrabold" : "text-slate-400"
            }`}
          >
            <div className="p-1 bg-sky-500 text-white rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="mt-0.5">IA</span>
          </button>

          <button
            onClick={() => setActiveTab("exams")}
            className={`flex flex-col items-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === "exams" ? "text-sky-500 font-extrabold" : "text-slate-400"
            }`}
          >
            <Award className="w-5 h-5 mb-0.5" />
            <span>Simulados</span>
          </button>

          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex flex-col items-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
              activeTab === "roadmap" ? "text-sky-500 font-extrabold" : "text-slate-400"
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span>Roteiro</span>
          </button>
        </div>


        {/* MINI DESKTOP FOOTER */}
        <footer className="hidden lg:block py-4 px-8 border-t border-slate-100 dark:border-slate-900/60 text-center text-[10px] text-slate-400 dark:text-slate-600 font-mono">
          <span>Portal de Estudos • Foco Enfermagem</span>
        </footer>

      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}