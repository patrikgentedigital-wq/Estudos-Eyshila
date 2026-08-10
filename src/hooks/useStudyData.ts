import { useState, useEffect, useCallback } from "react";
import { 
  UserProfile, 
  StudyModule, 
  Flashcard, 
  ExamAttempt, 
  QuestionExposure, 
  ChecklistItem, 
  CadernoErroItem, 
  RoadmapWeek 
} from "../types";
import { INITIAL_PROFILE, INITIAL_MODULES, INITIAL_FLASHCARDS } from "../data";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/storage";
import { supabase, isSupabaseConfigured } from "../supabase";
import { measureQuery } from "../dbLogger";

const cloneData = <T,>(value: T): T => structuredClone(value);

const DEFAULT_ROADMAP_TASKS = [
  {
    week: 1,
    label: "Dias 1-7: Competências gerais ENARE (20%)",
    topics: ["Inclusão em saúde", "Humanização", "Segurança do paciente", "NR-32"],
    status: "current" as const,
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
    status: "locked" as const,
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
    status: "locked" as const,
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
    status: "locked" as const,
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
    status: "locked" as const,
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
    status: "locked" as const,
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
    status: "locked" as const,
    tasks: [
      { id: "w7-t1", title: "Fazer um simulado objetivo de 100 questões em até 5 horas", completed: false },
      { id: "w7-t2", title: "Revisar o desempenho por competência do ENARE", completed: false },
      { id: "w7-t3", title: "Revisão Final de 100% das questões do Caderno de Erros", completed: false }
    ]
  }
];

const INITIAL_CHECKLIST = [
  { id: "theory", label: "Estudar Módulos de Enfermagem (SUS / Ética / UTI)", completed: false },
  { id: "questions", label: "Resolver 300 questões recomendadas", completed: false },
  { id: "caderno", label: "Alimentar Caderno de Erros", completed: false },
  { id: "flashcards", label: "Revisar Flashcards com Resumos Rápidos", completed: false },
  { id: "mock", label: "Realizar Simulado Parcial no Fim de Semana", completed: false }
];

const normalizeProfile = (value: Partial<UserProfile> | null | undefined, fallback: UserProfile): UserProfile => ({
  ...fallback,
  ...(value || {}),
  hoursPerWeek: value?.hoursPerWeek ?? fallback.hoursPerWeek ?? 15,
  onboarded: value ? (value.onboarded ?? true) : fallback.onboarded,
});

const normalizeModules = (value: StudyModule[] | null | undefined): StudyModule[] => {
  const defaults = cloneData(INITIAL_MODULES);
  if (!Array.isArray(value)) return defaults;
  const defaultIds = new Set(defaults.map((m) => m.id));
  const normalizedDefaults = defaults.map((defaultModule) => {
    const savedModule = value.find((m) => m.id === defaultModule.id);
    if (!savedModule) return defaultModule;
    const isLegacy = defaultModule.id === "mod-basicos" && /portugu[eê]s|inform[aá]tica/i.test(`${savedModule.title}`);
    return isLegacy ? defaultModule : savedModule;
  });
  return [...normalizedDefaults, ...value.filter((m) => !defaultIds.has(m.id))];
};

const normalizeRoadmap = (value: RoadmapWeek[] | null | undefined): RoadmapWeek[] => {
  const defaults = cloneData(DEFAULT_ROADMAP_TASKS);
  if (!Array.isArray(value)) return defaults;
  return defaults.map((defaultWeek) => {
    const savedWeek = value.find((w) => w.week === defaultWeek.week);
    if (!savedWeek) return defaultWeek;
    return {
      ...defaultWeek,
      status: savedWeek.status,
      tasks: defaultWeek.tasks.map((task) => ({
        ...task,
        completed: savedWeek.tasks.find((st) => st.id === task.id)?.completed ?? false,
      })),
    };
  });
};

export function useStudyData(isLoggedIn: boolean, userId: string | null, isAuthLoading: boolean) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUserDataHydrated, setIsUserDataHydrated] = useState<boolean>(false);
  const [remoteLoadFailed, setRemoteLoadFailed] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>(() => cloneData(INITIAL_PROFILE));
  const [modules, setModules] = useState<StudyModule[]>(() => cloneData(INITIAL_MODULES));
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => cloneData(INITIAL_FLASHCARDS));
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [questionExposures, setQuestionExposures] = useState<QuestionExposure[]>([]);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [cadernoErros, setCadernoErros] = useState<CadernoErroItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>(DEFAULT_ROADMAP_TASKS);

  // Load user data
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
              setProfile(normalizeProfile(data.profile, cloneData(INITIAL_PROFILE)));
              setModules(normalizeModules(data.modules));
              setFlashcards(data.flashcards || cloneData(INITIAL_FLASHCARDS));
              setAttempts(data.attempts || []);
              setQuestionExposures(data.question_exposures || []);
              setQuestionsCount(data.questions_count ?? 0);
              setChecklist(data.checklist || INITIAL_CHECKLIST);
              setCadernoErros(data.caderno_erros || []);
              setRoadmap(normalizeRoadmap(data.roadmap));
              return;
            }
          }

          // Fallback LocalStorage
          const savedProfile = safeGetItem(`residency_profile_${userId}`);
          const savedModules = safeGetItem(`residency_modules_${userId}`);
          const savedFlashcards = safeGetItem(`residency_flashcards_${userId}`);
          const savedAttempts = safeGetItem(`residency_attempts_${userId}`);
          const savedExposures = safeGetItem(`residency_question_exposures_${userId}`);
          const savedQuestions = safeGetItem(`residency_questions_count_${userId}`);
          const savedChecklist = safeGetItem(`residency_checklist_${userId}`);
          const savedCaderno = safeGetItem(`residency_caderno_${userId}`);
          const savedRoadmap = safeGetItem(`residency_roadmap_${userId}`);

          setProfile(normalizeProfile(savedProfile ? JSON.parse(savedProfile) : null, cloneData(INITIAL_PROFILE)));
          setModules(normalizeModules(savedModules ? JSON.parse(savedModules) : null));
          setFlashcards(savedFlashcards ? JSON.parse(savedFlashcards) : cloneData(INITIAL_FLASHCARDS));
          setAttempts(savedAttempts ? JSON.parse(savedAttempts) : []);
          setQuestionExposures(savedExposures ? JSON.parse(savedExposures) : []);
          setQuestionsCount(savedQuestions ? Number(savedQuestions) : 0);
          setChecklist(savedChecklist ? JSON.parse(savedChecklist) : INITIAL_CHECKLIST);
          setCadernoErros(savedCaderno ? JSON.parse(savedCaderno) : []);
          setRoadmap(normalizeRoadmap(savedRoadmap ? JSON.parse(savedRoadmap) : null));
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
          setRemoteLoadFailed(true);
          setProfile(cloneData(INITIAL_PROFILE));
          setModules(cloneData(INITIAL_MODULES));
          setFlashcards(cloneData(INITIAL_FLASHCARDS));
          setAttempts([]);
          setQuestionExposures([]);
          setQuestionsCount(0);
          setChecklist(INITIAL_CHECKLIST);
          setCadernoErros([]);
          setRoadmap(cloneData(DEFAULT_ROADMAP_TASKS));
        } finally {
          setIsLoading(false);
          setIsUserDataHydrated(true);
        }
      } else if (!isLoggedIn) {
        setProfile(cloneData(INITIAL_PROFILE));
        setModules(cloneData(INITIAL_MODULES));
        setFlashcards(cloneData(INITIAL_FLASHCARDS));
        setAttempts([]);
        setQuestionExposures([]);
        setQuestionsCount(0);
        setChecklist(INITIAL_CHECKLIST);
        setCadernoErros([]);
        setRoadmap(cloneData(DEFAULT_ROADMAP_TASKS));
        setRemoteLoadFailed(false);
        setIsUserDataHydrated(true);
      }
    };

    loadUserData();
  }, [userId, isLoggedIn, isAuthLoading]);

  // Debounced Supabase Sync
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
        if (error) console.warn("[Supabase Sync Warning]", error.message);
      } catch (err) {
        console.error("Erro ao sincronizar no Supabase:", err);
      }
    }
  }, [isLoggedIn, userId, isUserDataHydrated, remoteLoadFailed]);

  // Persistence effect
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

  const resetAllData = useCallback(() => {
    setProfile(cloneData(INITIAL_PROFILE));
    setModules(cloneData(INITIAL_MODULES));
    setFlashcards(cloneData(INITIAL_FLASHCARDS));
    setAttempts([]);
    setQuestionExposures([]);
    setQuestionsCount(0);
    setChecklist(INITIAL_CHECKLIST);
    setCadernoErros([]);
    setRoadmap(cloneData(DEFAULT_ROADMAP_TASKS));
  }, []);

  return {
    isLoading,
    isUserDataHydrated,
    profile,
    setProfile,
    modules,
    setModules,
    flashcards,
    setFlashcards,
    attempts,
    setAttempts,
    questionExposures,
    setQuestionExposures,
    questionsCount,
    setQuestionsCount,
    checklist,
    setChecklist,
    cadernoErros,
    setCadernoErros,
    roadmap,
    setRoadmap,
    resetAllData,
  };
}
