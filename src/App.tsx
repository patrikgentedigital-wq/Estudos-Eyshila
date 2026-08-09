import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, GraduationCap, Calendar, Bell, Shield, LayoutDashboard, BookOpen, Award, Sparkles, Compass } from "lucide-react";
import Toast, { ToastMessage } from "./components/Toast";

import { Tab, Language, UserProfile, StudyModule, Flashcard, ExamAttempt, translations, RoadmapWeek, RoadmapTask, ChecklistItem, CadernoErroItem, QuestionExposure, ReviewRating } from "./types";
import { INITIAL_PROFILE, INITIAL_MODULES, INITIAL_FLASHCARDS, INITIAL_ATTEMPTS } from "./data";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./utils/storage";
import { scheduleFlashcardReview } from "./utils/studyEngine";

// Supabase Client
import { supabase, isSupabaseConfigured } from "./supabase";

// Sidebar & Login imports
import Sidebar from "./components/Sidebar";
import { measureQuery } from "./dbLogger";
import Login from "./components/Login";
import { OnboardingModal } from "./components/OnboardingModal";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-loaded tab components for code splitting
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const StudyModules = React.lazy(() => import("./components/StudyModules"));
const ExamPrep = React.lazy(() => import("./components/ExamPrep"));
const Flashcards = React.lazy(() => import("./components/Flashcards"));
const Performance = React.lazy(() => import("./components/Performance"));
const ProfileSettings = React.lazy(() => import("./components/ProfileSettings"));
const AiStudy = React.lazy(() => import("./components/AiStudy"));
const Roadmap = React.lazy(() => import("./components/Roadmap"));

// Default 45-Day ENARE Study Plan (7 Weeks / 1h daily)
const DEFAULT_ROADMAP: RoadmapWeek[] = [
  {
    week: 1,
    label: "Dias 1-7: Competências gerais ENARE (20%)",
    topics: ["Inclusão em saúde", "Humanização", "Segurança do paciente", "NR-32"],
    status: "current",
    tasks: [
      { id: "w1-t1", title: "Estudar inclusão e cuidado de grupos vulnerabilizados", completed: false },
      { id: "w1-t2", title: "Revisar Humanização, Educação Permanente e trabalho em equipe", completed: false },
      { id: "w1-t3", title: "Resolver questões de Segurança do Paciente, Vigilância e NR-32", completed: false }
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
    topics: ["Protocolo XABCDE", "PCR AHA 2025", "Protocolo Manchester", "Drogas Vasoativas"],
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
    topics: ["Pré-Natal", "Calendário PNI vigente", "Puericultura", "Atenção ao parto e nascimento"],
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
    label: "Dias 42-45: Reta final ENARE (objetiva)",
    topics: ["Simulado de 100 questões", "Gestão do tempo", "Revisão Caderno de Erros"],
    status: "locked",
    tasks: [
      { id: "w7-t1", title: "Fazer um simulado objetivo de 100 questões em até 5 horas", completed: false },
      { id: "w7-t2", title: "Revisar o desempenho por competência do ENARE", completed: false },
      { id: "w7-t3", title: "Revisão Final de 100% das questões do Caderno de Erros", completed: false }
    ]
  }
];

const normalizeProfile = (value: Partial<UserProfile> | null | undefined, fallback: UserProfile): UserProfile => ({
  ...fallback,
  ...(value || {}),
  hoursPerWeek: value?.hoursPerWeek ?? fallback.hoursPerWeek ?? 15,
  onboarded: value ? (value.onboarded ?? true) : fallback.onboarded,
});

const cloneData = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const normalizeModules = (value: StudyModule[] | null | undefined): StudyModule[] => {
  const defaults = cloneData(INITIAL_MODULES);
  if (!Array.isArray(value)) return defaults;
  const defaultIds = new Set(defaults.map((module) => module.id));
  const normalizedDefaults = defaults.map((defaultModule) => {
    const savedModule = value.find((module) => module.id === defaultModule.id);
    if (!savedModule) return defaultModule;
    const isLegacyGeneralModule = defaultModule.id === "mod-basicos"
      && /portugu[eê]s|inform[aá]tica|common basics/i.test(`${savedModule.title} ${savedModule.category}`);
    return isLegacyGeneralModule ? defaultModule : savedModule;
  });
  return [...normalizedDefaults, ...value.filter((module) => !defaultIds.has(module.id))];
};

const normalizeRoadmap = (value: RoadmapWeek[] | null | undefined): RoadmapWeek[] => {
  const defaults = cloneData(DEFAULT_ROADMAP);
  if (!Array.isArray(value)) return defaults;
  return defaults.map((defaultWeek) => {
    const savedWeek = value.find((week) => week.week === defaultWeek.week);
    if (!savedWeek) return defaultWeek;
    const legacyWeekOne = defaultWeek.week === 1
      && `${savedWeek.topics.join(" ")} ${savedWeek.tasks.map((task) => task.title).join(" ")}`.match(/interpreta[cç][aã]o|coes[aã]o textual/i);
    if (legacyWeekOne) return defaultWeek;
    return {
      ...defaultWeek,
      status: savedWeek.status,
      tasks: defaultWeek.tasks.map((task) => ({
        ...task,
        completed: savedWeek.tasks.find((savedTask) => savedTask.id === task.id)?.completed ?? false,
      })),
    };
  });
};

export default function App() {
  
  // Session & UI States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  
  const [language, setLanguage] = useState<Language>(() => {
    return (safeGetItem("app_language") as Language) || "pt";
  });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return safeGetItem("residency_dark_mode") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUserDataHydrated, setIsUserDataHydrated] = useState<boolean>(false);
  const [remoteLoadFailed, setRemoteLoadFailed] = useState<boolean>(false);
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

  // Business Data States
  const clone = cloneData;
  
  const [profile, setProfile] = useState<UserProfile>(() => clone(INITIAL_PROFILE));
  const [modules, setModules] = useState<StudyModule[]>(() => clone(INITIAL_MODULES));
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => clone(INITIAL_FLASHCARDS));
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [questionExposures, setQuestionExposures] = useState<QuestionExposure[]>([]);
  const [questionsCount, setQuestionsCount] = useState<number>(0);

  const INITIAL_CHECKLIST = [
    { id: "theory", label: "Estudar Módulos de Enfermagem (SUS / Ética / UTI)", completed: false },
    { id: "questions", label: "Resolver 300 questões recomendadas", completed: false },
    { id: "caderno", label: "Alimentar Caderno de Erros", completed: false },
    { id: "flashcards", label: "Revisar Flashcards com Resumos Rápidos", completed: false },
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
        setIsUserDataHydrated(false);
        setRemoteLoadFailed(false);
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
              setRemoteLoadFailed(true);
            }

            if (data) {
              setProfile(normalizeProfile(data.profile, clone(INITIAL_PROFILE)));
              setModules(normalizeModules(data.modules));
              setFlashcards(data.flashcards || clone(INITIAL_FLASHCARDS));
              setAttempts(data.attempts || []);
              setQuestionExposures(data.question_exposures || []);
              setQuestionsCount(data.questions_count ?? 0);
              setChecklist(data.checklist || INITIAL_CHECKLIST);
              setCadernoErros(data.caderno_erros || []);
              setRoadmap(normalizeRoadmap(data.roadmap));
              return;
            }
          }

          // Fallback to LocalStorage
          const savedProfile = safeGetItem(`residency_profile_${userId}`);
          const savedModules = safeGetItem(`residency_modules_${userId}`);
          const savedFlashcards = safeGetItem(`residency_flashcards_${userId}`);
          const savedAttempts = safeGetItem(`residency_attempts_${userId}`);
          const savedExposures = safeGetItem(`residency_question_exposures_${userId}`);
          const savedQuestions = safeGetItem(`residency_questions_count_${userId}`);
          const savedChecklist = safeGetItem(`residency_checklist_${userId}`);
          const savedCaderno = safeGetItem(`residency_caderno_${userId}`);
          const savedRoadmap = safeGetItem(`residency_roadmap_${userId}`);

          const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;
          setProfile(normalizeProfile(parsedProfile, clone(INITIAL_PROFILE)));
          setModules(normalizeModules(savedModules ? JSON.parse(savedModules) : null));
          setFlashcards(savedFlashcards ? JSON.parse(savedFlashcards) : clone(INITIAL_FLASHCARDS));
          setAttempts(savedAttempts ? JSON.parse(savedAttempts) : []);
          setQuestionExposures(savedExposures ? JSON.parse(savedExposures) : []);
          setQuestionsCount(savedQuestions ? Number(savedQuestions) : 0);
          setChecklist(savedChecklist ? JSON.parse(savedChecklist) : INITIAL_CHECKLIST);
          setCadernoErros(savedCaderno ? JSON.parse(savedCaderno) : []);
          setRoadmap(normalizeRoadmap(savedRoadmap ? JSON.parse(savedRoadmap) : null));
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
          setRemoteLoadFailed(true);
          setProfile(clone(INITIAL_PROFILE));
          setModules(clone(INITIAL_MODULES));
          setFlashcards(clone(INITIAL_FLASHCARDS));
          setAttempts([]);
          setQuestionExposures([]);
          setQuestionsCount(0);
          setChecklist(INITIAL_CHECKLIST);
          setCadernoErros([]);
          setRoadmap(clone(DEFAULT_ROADMAP));
        } finally {
          setIsLoading(false);
          setIsUserDataHydrated(true);
        }
      } else if (!isLoggedIn) {
        setProfile(clone(INITIAL_PROFILE));
        setModules(clone(INITIAL_MODULES));
        setFlashcards(clone(INITIAL_FLASHCARDS));
        setAttempts([]);
        setQuestionExposures([]);
        setQuestionsCount(0);
        setChecklist(INITIAL_CHECKLIST);
        setCadernoErros([]);
        setRoadmap(clone(DEFAULT_ROADMAP));
        setRemoteLoadFailed(false);
        setIsUserDataHydrated(true);
      }
    };

    loadUserData();
  }, [userId, isLoggedIn, isAuthLoading]);

  // Debounced save to Supabase
  const syncToSupabase = useCallback(async (dataToSync: any) => {
    if (isLoggedIn && userId && isSupabaseConfigured && supabase && isUserDataHydrated && !remoteLoadFailed) {
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
  }, [isLoggedIn, userId, isUserDataHydrated, remoteLoadFailed]);


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

  // Single debounced sync to Supabase and immediate LocalStorage persistence
  useEffect(() => {
    if (!isLoggedIn || !userId || !isUserDataHydrated) return;

    safeSetItem(`residency_profile_${userId}`, JSON.stringify(profile));
    safeSetItem(`residency_modules_${userId}`, JSON.stringify(modules));
    safeSetItem(`residency_flashcards_${userId}`, JSON.stringify(flashcards));
    safeSetItem(`residency_attempts_${userId}`, JSON.stringify(attempts));
    safeSetItem(`residency_question_exposures_${userId}`, JSON.stringify(questionExposures));
    safeSetItem(`residency_questions_count_${userId}`, String(questionsCount));
    safeSetItem(`residency_checklist_${userId}`, JSON.stringify(checklist));
    safeSetItem(`residency_caderno_${userId}`, JSON.stringify(cadernoErros));
    safeSetItem(`residency_roadmap_${userId}`, JSON.stringify(roadmap));

    const timer = setTimeout(() => {
      syncToSupabase({
        profile,
        modules,
        flashcards,
        attempts,
        question_exposures: questionExposures,
        questions_count: questionsCount,
        checklist,
        caderno_erros: cadernoErros,
        roadmap,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    profile,
    modules,
    flashcards,
    attempts,
    questionExposures,
    questionsCount,
    checklist,
    cadernoErros,
    roadmap,
    userId,
    isLoggedIn,
    isUserDataHydrated,
    syncToSupabase,
  ]);

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
    setProfile(clone(INITIAL_PROFILE));
    setModules(clone(INITIAL_MODULES));
    setFlashcards(clone(INITIAL_FLASHCARDS));
    setAttempts([]);
    setQuestionExposures([]);
    setQuestionsCount(0);
    setChecklist(INITIAL_CHECKLIST);
    setCadernoErros([]);
    setRoadmap(clone(DEFAULT_ROADMAP));
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
      const updated = JSON.parse(JSON.stringify(prev));
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

  const handleQuestionExposure = (exposure: QuestionExposure) => {
    setQuestionExposures((previous) => {
      if (previous.some((item) => item.id === exposure.id)) return previous;
      return [exposure, ...previous].slice(0, 5000);
    });
  };

  const handleToggleLanguage = () => {
    const newLang: Language = language === "pt" ? "en" : "pt";
    setLanguage(newLang);
    safeSetItem("app_language", newLang);
  };

  const handleAddFlashcard = (newCard: Flashcard) => {
    setFlashcards(prev => [newCard, ...prev]);
  };

  const handleDeleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(f => f.id !== id));
  };

  const handleReviewFlashcard = (card: Flashcard, rating: ReviewRating) => {
    const reviewedCard = scheduleFlashcardReview(card, rating);

    setFlashcards(prev => {
      const exists = prev.some(f => f.id === card.id);
      return exists ? prev.map(f => f.id === card.id ? reviewedCard : f) : [reviewedCard, ...prev];
    });
  };

  const handleOnboardingComplete = (data: { institution: string; hoursPerWeek: number; focusAreas: string[] }) => {
    setProfile(prev => ({
      ...prev,
      institution: data.institution,
      focusAreas: data.focusAreas,
      hoursPerWeek: data.hoursPerWeek,
      onboarded: true
    }));
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
            setCadernoErros={setCadernoErros}
            questionExposures={questionExposures}
            onQuestionExposure={handleQuestionExposure}
          />
        );
      case "flashcards":
        return (
          <Flashcards
            language={language}
            flashcards={flashcards}
            t={translations[language]}
            onAddFlashcard={handleAddFlashcard}
            onDeleteFlashcard={handleDeleteFlashcard}
            onReviewFlashcard={handleReviewFlashcard}
          />
        );
      case "performance":
        return <Performance language={language} attempts={attempts} />;
      case "ai-study":
        return (
          <AiStudy 
            language={language} 
            onSaveFlashcards={(newCards) => {
              setFlashcards(prev => [...newCards, ...prev]);
              setToasts(prev => [...prev, { id: String(Date.now()), text: `Flashcards Salvos! ${newCards.length} cartões foram adicionados ao seu Banco Pessoal.`, type: "success" }]);
            }}
            onSaveCadernoError={(item) => {
              setCadernoErros(prev => [item, ...prev]);
              setToasts(prev => [...prev, { id: String(Date.now()), text: "Questão Salva! A questão foi adicionada ao seu Caderno de Estudos/Erros.", type: "success" }]);
            }}
          />
        );
      case "roadmap":
        return <Roadmap roadmap={roadmap} onToggleTask={handleToggleRoadmapTask} setActiveTab={setActiveTab} hoursPerWeek={profile.hoursPerWeek} />;
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

    return language === "en" ? titlesEn[activeTab] : titlesPt[activeTab];
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

  if (!isUserDataHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black p-6">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Carregando seus dados de estudo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-300 ${darkMode ? "bg-black text-slate-100" : "bg-slate-100 text-slate-800"}`}>
      
      {/* Modal de Onboarding de Boas-Vindas */}
      {isLoggedIn && !profile.onboarded && (
        <OnboardingModal
          language={language}
          onComplete={handleOnboardingComplete}
        />
      )}

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
                aria-label="Fechar menu"
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
        
        {/* TOP COMPREHENSIVE HEADER ROW */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-16 px-6 flex items-center justify-between transition-colors">
          
          {/* Left Column: Title / Hamburger */}
          <div className="flex items-center space-x-4">
            <button
              id="btn-open-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                {getTabTitle()}
              </h2>
            </div>
          </div>

          {/* Right Column: Mini Stats and Quick Indicator badges */}
          <div className="flex items-center space-x-3.5">
            
            {/* Calendar indicators */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              <span>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Quick preceptor alert */}
            <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3.5 py-1 rounded-full text-[10px] font-extrabold hidden md:inline-block uppercase tracking-wider">
              {profile.residencyYear.includes("Mentora") || profile.residencyYear.includes("Preceptor") 
                ? "🎓 Mentoria" 
                : "📝 Estudante ENARE"}
            </div>

            {/* Notification bell */}
            <button 
              id="btn-header-notifs"
              onClick={() => addToast("Sua caixa de notificações está limpa! ✓", "success")}
              aria-label="Abrir notificações"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all relative cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </button>
          </div>

        </header>

        {/* MAIN BODY SCROLL CONTAINER */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto pb-20 lg:pb-8 bg-slate-50 dark:bg-[#0b0f19]">
          <ErrorBoundary>
            <React.Suspense fallback={
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-medium animate-pulse">Carregando módulo...</span>
              </div>
            }>
              {renderTabContent()}
            </React.Suspense>
          </ErrorBoundary>
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
