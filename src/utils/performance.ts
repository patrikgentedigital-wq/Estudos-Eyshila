import { ExamAttempt, StudyModule } from "../types";

export interface CalculatedSubject {
  id: string;
  name: string;
  percent: number;
  iconName: string;
  color: string;
  moduleId: string;
}

export function getSubjectScores(attempts: ExamAttempt[] = []): CalculatedSubject[] {
  // Baselines should be 0 for new accounts
  let urgencia = 0;
  let mulherCrianca = 0;
  let etica = 0;
  let neuro = 0;
  let procedimentos = 0;
  let sus = 0;

  // Track attempts per subject
  const urgenciaAttempts = attempts.filter(a => 
    a.examName.toLowerCase().includes("trauma") || 
    a.examName.toLowerCase().includes("urgência") || 
    a.examName.toLowerCase().includes("acls") || 
    a.examName.toLowerCase().includes("choque")
  );
  if (urgenciaAttempts.length > 0) {
    const sum = urgenciaAttempts.reduce((acc, curr) => acc + curr.score, 0);
    urgencia = Math.round(sum / urgenciaAttempts.length);
  }

  const mulherCriancaAttempts = attempts.filter(a => 
    a.examName.toLowerCase().includes("mulher") || 
    a.examName.toLowerCase().includes("criança") || 
    a.examName.toLowerCase().includes("gestante")
  );
  if (mulherCriancaAttempts.length > 0) {
    const sum = mulherCriancaAttempts.reduce((acc, curr) => acc + curr.score, 0);
    mulherCrianca = Math.round(sum / mulherCriancaAttempts.length);
  }

  const eticaAttempts = attempts.filter(a => 
    a.examName.toLowerCase().includes("ética") || 
    a.examName.toLowerCase().includes("cofen")
  );
  if (eticaAttempts.length > 0) {
    const sum = eticaAttempts.reduce((acc, curr) => acc + curr.score, 0);
    etica = Math.round(sum / eticaAttempts.length);
  }

  const neuroAttempts = attempts.filter(a => 
    a.examName.toLowerCase().includes("neurológica") || 
    a.examName.toLowerCase().includes("avc") || 
    a.examName.toLowerCase().includes("glasgow")
  );
  if (neuroAttempts.length > 0) {
    const sum = neuroAttempts.reduce((acc, curr) => acc + curr.score, 0);
    neuro = Math.round(sum / neuroAttempts.length);
  }

  const procedimentosAttempts = attempts.filter(a => 
    a.examName.toLowerCase().includes("procedimentos") || 
    a.examName.toLowerCase().includes("farmacologia") || 
    a.examName.toLowerCase().includes("clínica")
  );
  if (procedimentosAttempts.length > 0) {
    const sum = procedimentosAttempts.reduce((acc, curr) => acc + curr.score, 0);
    procedimentos = Math.round(sum / procedimentosAttempts.length);
  }

  const susAttempts = attempts.filter(a => 
    a.examName.toLowerCase().includes("sus") || 
    a.examName.toLowerCase().includes("legislação")
  );
  if (susAttempts.length > 0) {
    const sum = susAttempts.reduce((acc, curr) => acc + curr.score, 0);
    sus = Math.round(sum / susAttempts.length);
  }

  return [
    { 
      id: "procedimentos", 
      name: "Procedimentos Clínicos / Farmacologia", 
      percent: procedimentos, 
      iconName: "Compass", 
      color: "text-sky-500 bg-sky-500/10", 
      moduleId: "mod-procedimentos" 
    },
    { 
      id: "etica", 
      name: "Ética e Legislação COFEN", 
      percent: etica, 
      iconName: "ShieldCheck", 
      color: "text-amber-500 bg-amber-500/10", 
      moduleId: "mod-etica" 
    },
    { 
      id: "sus", 
      name: "Legislação do SUS / Saúde Coletiva", 
      percent: sus, 
      iconName: "BookOpen", 
      color: "text-teal-500 bg-teal-500/10", 
      moduleId: "mod-sus" 
    },
    { 
      id: "mulher_crianca", 
      name: "Saúde da Mulher e da Criança", 
      percent: mulherCrianca, 
      iconName: "Baby", 
      color: "text-sky-500 bg-sky-500/10", 
      moduleId: "mod-ciclos" 
    },
    { 
      id: "neuro", 
      name: "Avaliação Neurológica (AVC)", 
      percent: neuro, 
      iconName: "Brain", 
      color: "text-purple-500 bg-purple-500/10", 
      moduleId: "mod-urgencia" 
    },
    { 
      id: "urgencia", 
      name: "Urgência e UTI / Alta Complexidade", 
      percent: urgencia, 
      iconName: "Heart", 
      color: "text-rose-500 bg-rose-500/10", 
      moduleId: "mod-urgencia" 
    }
  ];
}

export interface Recommendation {
  subject: CalculatedSubject;
  recommendedModule: StudyModule;
  reason: string;
}

export function getStudyRecommendation(attempts: ExamAttempt[] = [], modules: StudyModule[] = []): Recommendation | null {
  if (modules.length === 0) return null;

  const subjects = getSubjectScores(attempts);
  
  // Sort subjects by score ascending (lowest score first)
  const sortedSubjects = [...subjects].sort((a, b) => a.percent - b.percent);
  
  // Weakest subject
  const weakestSubject = sortedSubjects[0];
  
  // Find matching module
  const recommendedModule = modules.find(m => m.id === weakestSubject.moduleId) || modules[0];

  // Dynamic explanations based on the weakest topic
  let reason = "";

  switch (weakestSubject.id) {
    case "procedimentos":
      reason = "Seu desempenho em procedimentos clínicos e farmacologia é a sua área mais vulnerável atualmente. Recomendamos revisar técnicas de exame físico, sondagens e cálculo de dosagem de medicamentos.";
      break;
    case "etica":
      reason = "O Código de Ética (COFEN 564) e as penalidades administrativas têm peso relevante na prova. Recomendamos reforçar seus direitos, deveres e proibições profissionais.";
      break;
    case "sus":
      reason = "As leis orgânicas do SUS (8.080 e 8.142) e a participação social apresentam margem para melhoria. Foque em controle social e competências federativas.";
      break;
    case "mulher_crianca":
      reason = "A saúde materno-infantil e o calendário do PNI são cobrados de forma detalhada no ENARE. Revise a Regra de Naegele e as vacinas do primeiro ano de vida.";
      break;
    case "neuro":
      reason = "Avaliação neurológica e atendimento ao AVC agudo exigem exatidão no tempo de resposta e protocolos. Foque no mnemônico SAMU e Escala de Glasgow-P.";
      break;
    case "urgencia":
      reason = "O suporte avançado à vida (ACLS/PALS) e o atendimento ao trauma (XABCDE) são vitais para a sua aprovação. Revise ritmos chocáveis e controle de hemorragias.";
      break;
    default:
      reason = "Com base no seu histórico de erros, este módulo reforçará os tópicos de maior peso da ementa de residência do ENARE.";
  }

  return {
    subject: weakestSubject,
    recommendedModule,
    reason
  };
}
