import React, { useState, useEffect, useCallback } from "react";
import { Menu, X, GraduationCap, Calendar, Bell, Shield } from "lucide-react";

import { Tab, Language, UserProfile, StudyModule, Flashcard, ExamAttempt, translations, RoadmapWeek, RoadmapTask } from "./types";
import { INITIAL_PROFILE, INITIAL_MODULES, INITIAL_FLASHCARDS, INITIAL_ATTEMPTS } from "./data";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./utils/storage";

// Firestore
import { db, auth as firebaseAuth } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth?.currentUser?.uid,
      email: firebaseAuth?.currentUser?.email,
      emailVerified: firebaseAuth?.currentUser?.emailVerified,
      isAnonymous: firebaseAuth?.currentUser?.isAnonymous,
      tenantId: firebaseAuth?.currentUser?.tenantId,
      providerInfo: firebaseAuth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Named component imports
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import StudyModules from "./components/StudyModules";
import ExamPrep from "./components/ExamPrep";
import Flashcards from "./components/Flashcards";
import Performance from "./components/Performance";
import ProfileSettings from "./components/ProfileSettings";
import AiStudy from "./components/AiStudy";
import Roadmap from "./components/Roadmap";

import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function App() {
  const auth = getAuth();
  
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
  const [checklist, setChecklist] = useState<any[]>([]);
  const [cadernoErros, setCadernoErros] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);

  // Default Roadmap Data based on PDF
  const DEFAULT_ROADMAP: RoadmapWeek[] = [
    {
      week: 1,
      label: "Fundações e Legislação SUS",
      topics: ["Lei 8080/90", "Lei 8142/90", "Decreto 7508/11", "RES 453/12"],
      status: "current",
      tasks: [
        { id: "w1-t1", title: "Responder 50 questões de Legislação SUS", completed: false },
        { id: "w1-t2", title: "Resumir principais pontos da Lei 8080/8142", completed: false },
        { id: "w1-t3", title: "Praticar 10min de flashcards diários", completed: false }
      ]
    },
    {
      week: 2,
      label: "Políticas e Saúde Coletiva",
      topics: ["PNAB", "ESF", "Saúde Coletiva", "Humanização", "Vigilância"],
      status: "locked",
      tasks: [
        { id: "w2-t1", title: "Estudar Política Nacional de Atenção Básica", completed: false },
        { id: "w2-t2", title: "Simulado 1 (Foco em SUS e Políticas)", completed: false }
      ]
    },
    {
      week: 3,
      label: "Prática Clínica e SAE",
      topics: ["SAE/NANDA/NIC", "Semiologia", "Exame Físico"],
      status: "locked",
      tasks: [
        { id: "w3-t1", title: "Dominar Etapas da SAE e Taxonomias", completed: false },
        { id: "w3-t2", title: "Revisar Semiologia por sistemas", completed: false }
      ]
    },
    {
      week: 4,
      label: "Procedimentos e Urgência",
      topics: ["Fundamentos", "Sondagens", "Cateteres", "ABCDE", "Traumas"],
      status: "locked",
      tasks: [
        { id: "w4-t1", title: "Estudar Protocolo XABCDE e Choques", completed: false },
        { id: "w4-t2", title: "Revisar Procedimentos Básicos de Enfermagem", completed: false }
      ]
    },
    {
      week: 5,
      label: "Saúde da Mulher e Materno-Infantil",
      topics: ["Ciclo Gravídico", "Puericultura", "Vacinação (CRIE)", "Neonatologia"],
      status: "locked",
      tasks: [
        { id: "w5-t1", title: "Estudar Calendário Vacinal 2024", completed: false },
        { id: "w5-t2", title: "Simulado 2 (Materno-Infantil e Pediatria)", completed: false }
      ]
    },
    {
      week: 6,
      label: "Saúde Mental e Idoso",
      topics: ["Depressão", "Demência", "Geriatria", "Urgências Psiquiátricas"],
      status: "locked",
      tasks: [
        { id: "w6-t1", title: "Revisão de Erros dos Simulados 1 e 2", completed: false },
        { id: "w6-t2", title: "Estudar Síndromes Geriátricas", completed: false }
      ]
    },
    {
      week: 7,
      label: "Consolidação e Simulados Finais",
      topics: ["Revisão Geral", "Gestão de Ansiedade"],
      status: "locked",
      tasks: [
        { id: "w7-t1", title: "Simulado 4 (Condições Reais)", completed: false },
        { id: "w7-t2", title: "Simulado 5 (Condições Reais)", completed: false }
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

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Load user-specific data from Firestore when userId changes
  useEffect(() => {
    const loadUserData = async () => {
      if (isLoggedIn && userId && db && !isAuthLoading) {
        setIsLoading(true);
        try {
          const userDocRef = doc(db, "users", userId);
          let docSnap;
          try {
            docSnap = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${userId}`);
            return;
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profile) setProfile(data.profile);
            if (data.modules) setModules(data.modules);
            if (data.flashcards) setFlashcards(data.flashcards);
            if (data.attempts) setAttempts(data.attempts);
            if (data.questionsCount !== undefined) setQuestionsCount(data.questionsCount);
            if (data.checklist) setChecklist(data.checklist);
            else setChecklist(INITIAL_CHECKLIST);
            if (data.cadernoErros) setCadernoErros(data.cadernoErros);
            else setCadernoErros([]);
            if (data.roadmap) setRoadmap(data.roadmap);
            else setRoadmap(DEFAULT_ROADMAP);
          } else {
            // First time user, initialize Firestore with initial data
            const initialData = {
              profile: INITIAL_PROFILE,
              modules: INITIAL_MODULES,
              flashcards: INITIAL_FLASHCARDS,
              attempts: INITIAL_ATTEMPTS,
              questionsCount: 0,
              checklist: INITIAL_CHECKLIST,
              cadernoErros: [],
              roadmap: DEFAULT_ROADMAP,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            try {
              await setDoc(userDocRef, initialData);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${userId}`);
              return;
            }
            setProfile(INITIAL_PROFILE);
            setModules(INITIAL_MODULES);
            setFlashcards(INITIAL_FLASHCARDS);
            setAttempts(INITIAL_ATTEMPTS);
            setQuestionsCount(0);
            setChecklist(INITIAL_CHECKLIST);
            setCadernoErros([]);
            setRoadmap(DEFAULT_ROADMAP);
          }
        } catch (error) {
          console.error("Error loading user data from Firestore:", error);
          // Fallback to localStorage if Firestore fails
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
          if (savedCaderno) setCadernoErros(JSON.parse(savedCaderno));
        } finally {
          setIsLoading(false);
        }
      } else if (!isLoggedIn) {
        // Reset states when logged out
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
  }, [userId, isLoggedIn]);

  // Debounced save to Firestore
  const syncToFirestore = useCallback(async (dataToSync: any) => {
    if (isLoggedIn && userId && db) {
      const path = `users/${userId}`;
      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          ...dataToSync,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error syncing to Firestore:", error);
        // We catch here but we could also use handleFirestoreError if we want it to crash/show more info
        // For sync, maybe just log is better for UX, but skill says MUST catch and throw specific JSON
        handleFirestoreError(error, OperationType.UPDATE, path);
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
      const timer = setTimeout(() => syncToFirestore({ profile }), 1000);
      return () => clearTimeout(timer);
    }
  }, [profile, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_modules_${userId}`, JSON.stringify(modules));
      const timer = setTimeout(() => syncToFirestore({ modules }), 2000);
      return () => clearTimeout(timer);
    }
  }, [modules, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_flashcards_${userId}`, JSON.stringify(flashcards));
      const timer = setTimeout(() => syncToFirestore({ flashcards }), 2000);
      return () => clearTimeout(timer);
    }
  }, [flashcards, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_attempts_${userId}`, JSON.stringify(attempts));
      const timer = setTimeout(() => syncToFirestore({ attempts }), 2000);
      return () => clearTimeout(timer);
    }
  }, [attempts, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_questions_count_${userId}`, String(questionsCount));
      const timer = setTimeout(() => syncToFirestore({ questionsCount }), 2000);
      return () => clearTimeout(timer);
    }
  }, [questionsCount, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_checklist_${userId}`, JSON.stringify(checklist));
      const timer = setTimeout(() => syncToFirestore({ checklist }), 2000);
      return () => clearTimeout(timer);
    }
  }, [checklist, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_caderno_${userId}`, JSON.stringify(cadernoErros));
      const timer = setTimeout(() => syncToFirestore({ cadernoErros }), 2000);
      return () => clearTimeout(timer);
    }
  }, [cadernoErros, userId, isLoggedIn, syncToFirestore]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      safeSetItem(`residency_roadmap_${userId}`, JSON.stringify(roadmap));
      const timer = setTimeout(() => syncToFirestore({ roadmap }), 2000);
      return () => clearTimeout(timer);
    }
  }, [roadmap, userId, isLoggedIn, syncToFirestore]);

  // Auth operations
  const handleLoginSuccess = (email: string, uid: string) => {
    setIsLoggedIn(true);
    setUserId(uid);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    getAuth().signOut();
    setIsLoggedIn(false);
    setUserId(null);
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
        
        {/* TOP COMPREHENSIVE HEADER ROW */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-900/60 h-16 px-6 flex items-center justify-between">
          
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
            <div className="bg-sky-500/10 dark:bg-sky-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-sky-600 dark:text-sky-400 font-mono hidden md:inline-block uppercase tracking-wider">
              {profile.residencyYear.includes("Mentora") || profile.residencyYear.includes("Preceptor") 
                ? "🎓 Mentoria" 
                : "📝 Estudante ENARE"}
            </div>

            {/* Notification bell mock */}
            <button 
              id="btn-header-notifs"
              onClick={() => alert("Sua caixa de notificações está limpa! ✓")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            </button>
          </div>

        </header>

        {/* MAIN BODY SCROLL CONTAINER */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderTabContent()}
        </main>

        {/* MINI DESKTOP FOOTER */}
        <footer className="py-4 px-8 border-t border-slate-100 dark:border-slate-900/60 text-center text-[10px] text-slate-400 dark:text-slate-600 font-mono">
          <span>Portal de Estudos • Foco Enfermagem</span>
        </footer>

      </div>

    </div>
  );
}