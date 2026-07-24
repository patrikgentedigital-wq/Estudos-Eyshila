import { ExamQuestion } from "../types";

export interface RealExam {
  id: string;
  year: number;
  institution: string;
  title: string;
  questions: ExamQuestion[];
}

export const REAL_EXAMS: RealExam[] = [
  {
    id: "enare-2023",
    year: 2023,
    institution: "EBSERH / ENARE",
    title: "Prova ENARE 2023 - Enfermeiro",
    questions: [
      {
        id: "e23-q1",
        question: "De acordo com o Código de Ética dos Profissionais de Enfermagem (Resolução COFEN nº 564/2017), é direito do profissional de enfermagem:",
        answer: "Recusar-se a ser filmado, fotografado e exposto em mídias sociais durante o desempenho de suas atividades profissionais.",
        options: [
          "Recusar-se a ser filmado, fotografado e exposto em mídias sociais durante o desempenho de suas atividades profissionais.",
          "Registrar no prontuário do paciente as informações inerentes e indispensáveis ao processo de cuidar.",
          "Prestar assistência de enfermagem livre de danos decorrentes de imperícia, negligência ou imprudência.",
          "Promover a eutanásia ou participar em prática destinada a antecipar a morte do paciente."
        ],
        correctIndex: 0,
        explanation: "O Art. 19 define como DIREITO: 'Recusar-se a ser filmado, fotografado e exposto em mídias sociais durante o desempenho de suas atividades profissionais'. As demais opções são deveres (registro, assistência livre de danos) ou proibições (eutanásia).",
        category: "Ética e Gestão"
      },
      {
        id: "e23-q2",
        question: "Na Sistematização da Assistência de Enfermagem (SAE), a etapa que envolve a coleta de dados contínua e deliberada para determinar o estado de saúde do paciente é chamada de:",
        options: [
          "Diagnóstico de Enfermagem.",
          "Planejamento de Enfermagem.",
          "Investigação de Enfermagem (Avaliação).",
          "Implementação da Assistência."
        ],
        correctIndex: 2,
        explanation: "De acordo com a Resolução COFEN nº 736/2024, a primeira etapa do Processo de Enfermagem é a 'Avaliação de Enfermagem' (antiga Investigação), que compreende a coleta de dados (histórico e exame físico).",
        category: "Prática Clínica"
      },
      {
        id: "e23-q3",
        question: "Sobre o Sistema Único de Saúde (SUS), a Lei nº 8.142/1990 dispõe sobre:",
        options: [
          "As condições para promoção, proteção e recuperação da saúde.",
          "A participação da comunidade na gestão do SUS e sobre as transferências intergovernamentais de recursos financeiros.",
          "A organização e o funcionamento das Conferências Estaduais de Saúde exclusivamente.",
          "O Contrato Organizativo de Ação Pública de Saúde (COAP)."
        ],
        correctIndex: 1,
        explanation: "A Lei 8.142/90 trata especificamente do Controle Social (Conferências e Conselhos de Saúde) e do repasse regular e automático de recursos financeiros (Fundo a Fundo).",
        category: "Legislação SUS"
      },
      {
        id: "e23-q4",
        question: "Qual dos princípios abaixo é considerado um princípio DOUTRINÁRIO do SUS?",
        options: [
          "Descentralização.",
          "Regionalização.",
          "Equidade.",
          "Hierarquização."
        ],
        correctIndex: 2,
        explanation: "Os princípios doutrinários (ideológicos) do SUS são: Universalidade, Equidade e Integralidade. Os organizativos são: Descentralização, Regionalização, Hierarquização e Participação Social.",
        category: "Legislação SUS"
      },
      {
        id: "e23-q5",
        question: "No suporte básico de vida (SBV) para adultos, segundo as diretrizes da American Heart Association (AHA), a relação correta de compressões torácicas e ventilações (quando há 1 ou 2 socorristas sem via aérea avançada) é:",
        options: [
          "15 compressões para 2 ventilações.",
          "30 compressões para 2 ventilações.",
          "100 compressões contínuas por minuto, sem ventilação.",
          "50 compressões para 5 ventilações."
        ],
        correctIndex: 1,
        explanation: "Para adultos, a relação é sempre 30 compressões para 2 ventilações, independentemente de haver 1 ou 2 socorristas, até a instalação de uma via aérea avançada.",
        category: "Urgência e UTI"
      }
    ]
  },
  {
    id: "enare-2022",
    year: 2022,
    institution: "EBSERH / ENARE",
    title: "Prova ENARE 2022 - Enfermeiro",
    questions: [
      {
        id: "e22-q1",
        question: "Ao realizar a prescrição de um soro glicosado 5% de 500 mL para correr em 8 horas, qual deverá ser o gotejamento aproximado em gotas por minuto?",
        options: [
          "21 gotas/min.",
          "42 gotas/min.",
          "62 gotas/min.",
          "10 gotas/min."
        ],
        correctIndex: 0,
        explanation: "Fórmula (tempo em horas, gotas): Gotas/min = Volume / (Tempo * 3). Logo: 500 / (8 * 3) = 500 / 24 = 20,83. Arredonda-se para 21 gotas/min.",
        category: "Prática Clínica"
      },
      {
        id: "e22-q2",
        question: "Na classificação de risco (Protocolo de Manchester), o paciente que recebe a cor AMARELA tem como tempo alvo para atendimento médico:",
        options: [
          "Imediato (0 minutos).",
          "Até 10 minutos.",
          "Até 60 minutos.",
          "Até 120 minutos."
        ],
        correctIndex: 2,
        explanation: "Vermelho (Emergência): 0 min. Laranja (Muito Urgente): 10 min. Amarelo (Urgente): 60 min. Verde (Pouco Urgente): 120 min. Azul (Não Urgente): 240 min.",
        category: "Urgência e UTI"
      }
    ]
  }
];
