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
    id: "enare-2025-oficial",
    year: 2025,
    institution: "ENARE / FGV",
    title: "ENARE 2024/2025 - Exame Nacional de Residência (Gabarito Oficial)",
    questions: [
      {
        id: "enare-2025-q1",
        question: "De acordo com a Resolução COFEN nº 736/2024, que atualizou as diretrizes sobre a Sistematização da Assistência de Enfermagem (SAE) e o Processo de Enfermagem em todo o território nacional, o Processo de Enfermagem deve ser realizado de modo deliberado e sistemático, organizado em cinco etapas inter-relacionadas. Assinale a alternativa que indica corretamente a denominação atual da PRIMEIRA etapa do Processo de Enfermagem:",
        options: [
          "A) Histórico de Enfermagem.",
          "B) Investigação de Enfermagem.",
          "C) Avaliação de Enfermagem.",
          "D) Anamnese Assistencial.",
          "E) Exame Físico Inicial."
        ],
        correctIndex: 2,
        explanation: "Fundamentação Legal: A Resolução COFEN nº 736/2024 renomeou formalmente a 1ª etapa para 'Avaliação de Enfermagem' (que engloba a coleta de dados de anamnese e exame físico). As 5 etapas são: 1. Avaliação, 2. Diagnóstico, 3. Planejamento, 4. Implementação, 5. Evolução.",
        leadIn: "Qual a denominação oficial da primeira etapa do Processo de Enfermagem segundo o COFEN?",
        cognitiveType: "protocol",
        category: "Ética e Gestão"
      },
      {
        id: "enare-2025-q2",
        question: "Durante o atendimento pré-hospitalar a um adulto vítima de colisão auto x poste, a equipe identifica sangramento ativo abundante e pulsátil no membro inferior direito. De acordo com as diretrizes internacionais do PHTLS (Prehospital Trauma Life Support, 10ª edição) para o manejo inicial do trauma, qual a conduta prioritária Imediata a ser adotada no protocolo XABCDE?",
        options: [
          "A) Realizar a abertura das vias aéreas com manobra de Jaw-thrust e estabilização cervical (A).",
          "B) Aplicar compressão direta sobre a ferida e/ou garroteamento/torniquete imediato na extremidade afetada (X).",
          "C) Ofertar oxigênio sob máscara com reservatório a 15 L/min para prevenir a hipóxia (B).",
          "D) Puncionar dois acessos venosos periféricos de grosso calibre e aquecer soluções cristalóides (C).",
          "E) Avaliar o nível de consciência através da Escala de Coma de Glasgow (D)."
        ],
        correctIndex: 1,
        explanation: "Fundamentação Técnica (PHTLS 10ª Edição): A letra 'X' refere-se ao controle de hemorragias exanguinantes graves de extremidades antes de qualquer outra etapa. Sangramentos pulsáteis arteriais devem ser contidos com torniquete imediato antes da abordagem de vias aéreas (A).",
        leadIn: "Qual a ação prioritária inicial na abordagem ao trauma grave segundo o algoritmo XABCDE?",
        cognitiveType: "clinical_reasoning",
        clinicalCase: {
          setting: "Atendimento Pré-Hospitalar (SAMU)",
          ageGroup: "Adulto",
          presentingProblem: "Colisão automobilística com sangramento em jato no membro inferior",
          physicalExam: "Hemorragia maciça pulsátil em coxa direita, palidez cutânea e diaforese."
        },
        category: "Urgência e UTI"
      },
      {
        id: "enare-2025-q3",
        question: "Uma paciente de 28 anos, primigesta com 34 semanas de gestação, dá entrada no Pronto Atendimento Obstétrico apresentando PA 165/110 mmHg, cefaleia intensa, escotomas cintilantes e dor epigástrica. O diagnóstico médico é Pré-eclâmpsia Grave. O médico prescreve o protocolo de ataque com Sulfato de Magnésio EV para prevenção de eclampsia. Durante a infusão e manutenção do sulfato de magnésio, a enfermeira deve realizar a monitorização rigorosa dos sinais de intoxicação. Quais são os 3 parâmetros clínicos obrigatórios que devem ser avaliados antes de cada dose de manutenção?",
        options: [
          "A) Frequência cardíaca > 100 bpm, pressão arterial sistólica > 140 mmHg e ausculta pulmonar sem esterptores.",
          "B) Presença de reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese > 25 a 30 mL/hora.",
          "C) Glicemia capilar > 70 mg/dL, saturação de O2 > 95% e escala de dor menor que 3.",
          "D) Temperatura axilar < 37,5°C, tempo de enchimento capilar < 2s e nível de consciência alerta.",
          "E) Pulsos periféricos cheios, diurese de 10 mL/h e reflexo aquileu abolido."
        ],
        correctIndex: 1,
        explanation: "Fundamentação Técnica (Diretrizes Ministério da Saúde / PNAISM): Os 3 critérios de segurança para infusão de Sulfato de Magnésio são: 1) Reflexo patelar presente; 2) Frequência respiratória ≥ 16 irpm (para evitar depressão respiratória); 3) Débito urinário ≥ 25 a 30 mL/h (pois a eliminação do sulfato é puramente renal). Antídoto: Gluconato de Cálcio 10%.",
        leadIn: "Quais parâmetros clínicos condicionam a manutenção da infusão de Sulfato de Magnésio na Pré-eclâmpsia?",
        cognitiveType: "clinical_reasoning",
        clinicalCase: {
          setting: "Emergência Obstétrica",
          ageGroup: "Adulto (28 anos)",
          presentingProblem: "Pré-eclâmpsia grave com sinais de iminência de eclampsia",
          vitals: { "PA": "165/110 mmHg", "FR": "18 irpm" }
        },
        category: "Ciclos de Vida"
      },
      {
        id: "enare-2025-q4",
        question: "De acordo com o Código de Ética dos Profissionais de Enfermagem (Resolução COFEN nº 564/2017), o descumprimento dos deveres e violação das proibições sujeita o infror a penalidades disciplinares aplicadas pelos Conselhos de Enfermagem. Assinale a opção que apresenta uma penalidade cuja aplicação é de competência EXCLUSIVA do Conselho Federal de Enfermagem (COFEN):",
        options: [
          "A) Advertência verbal.",
          "B) Aplicação de Multa até 10 vezes o valor da anuidade.",
          "C) Censura pública em jornal de grande circulação.",
          "D) Suspensão do exercício profissional por até 90 dias.",
          "E) Cassação do direito ao exercício profissional."
        ],
        correctIndex: 4,
        explanation: "Fundamentação Legal (COFEN 564/2017, Art. 108, § 5º): A penalidade de CASSAÇÃO do direito ao exercício profissional é de competência EXCLUSIVA do Conselho Federal de Enfermagem (Cofen). As demais penalidades (advertência, multa, censura e suspensão de até 90 dias) podem ser aplicadas pelos Conselhos Regionais (Coren).",
        leadIn: "Qual penalidade ético-disciplinar é de competência exclusiva do Cofen?",
        cognitiveType: "protocol",
        category: "Ética e Gestão"
      },
      {
        id: "enare-2025-q5",
        question: "O Decreto Presidencial nº 7.508/2011 regulamentou a Lei Orgânica da Saúde (Lei nº 8.080/1990) para dispor sobre a organização do SUS, o planejamento da saúde, a assistência à saúde e a articulação interfederativa. Segundo este Decreto, a porta de entrada prioritária no Sistema Único de Saúde para as ações e serviços de atenção à saúde é a:",
        options: [
          "A) Atenção Hospitalar de Média Complexidade.",
          "B) Rede de Urgência e Emergência (UPAs 24h).",
          "C) Atenção Primária à Saúde (Atenção Básica).",
          "D) Vigilância Sanitária e Ambiental.",
          "E) Atenção Ambulatorial Especializada."
        ],
        correctIndex: 2,
        explanation: "Fundamentação Legal (Decreto 7.508/11, Art. 9º): As Portas de Entrada às ações e serviços de saúde nas Redes de Atenção à Saúde são os serviços de: I - Atenção Primária (porta preferencial/ordenadora); II - Urgência e Emergência; III - Atenção Psicossocial; IV - Serviços Especiais de Acesso Aberto.",
        leadIn: "Qual a porta de entrada preferencial da Rede de Atenção à Saúde segundo o Decreto 7.508/11?",
        cognitiveType: "protocol",
        category: "Legislação SUS"
      }
    ]
  },
  {
    id: "enare-2024-oficial",
    year: 2024,
    institution: "ENARE / FGV",
    title: "ENARE 2023/2024 - Prova Objetiva de Enfermagem",
    questions: [
      {
        id: "enare-2024-q1",
        question: "Paciente do sexo masculino, 55 anos, em pós-operatório imediato de cirurgia abdominal de grande porte, encontra-se internado na Unidade de Terapia Intensiva sob ventilação mecânica invasiva. O médico prescreve infusão contínua de Noradrenalina 0,1 mcg/kg/min em bomba de infusão. Durante a assistência de enfermagem, qual cuidado técnico é INDISPENSÁVEL ao administrar drogas vasoativas como a Noradrenalina?",
        options: [
          "A) Administrar preferencialmente em veia periférica de pequeno calibre em dorso da mão.",
          "B) Infundir a medicação em bolus rápido se ocorrer queda abrupta da Pressão Arterial Média.",
          "C) Utilizar via venosa central exclusiva em bomba de infusão e monitorar constantemente a Pressão Arterial Média (PAM).",
          "D) Interromper bruscamente a infusão sempre que a saturação de O2 ultrapassar 98%.",
          "E) Diluir a Noradrenalina exclusivamente em Solução Ringer Lactato com Bicarbonato."
        ],
        correctIndex: 2,
        explanation: "Fundamentação Técnica (Diretrizes de Terapia Intensiva / Enfermagem em UTI): A noradrenalina é um potente vasopressor alfa-1 que causa intensa vasoconstrição. Deve ser administrada exclusivamente em Acesso Venoso Central em Bomba de Infusão Contínua, pois a extravasamento em veia periférica pode causar isquemia e necrose tecidual grave.",
        leadIn: "Qual é o cuidado técnico prioritário na administração de Noradrenalina em UTI?",
        cognitiveType: "clinical_reasoning",
        category: "Urgência e UTI"
      },
      {
        id: "enare-2024-q2",
        question: "Na assistência ao RN na sala de parto, o enfermeiro avalia o Índice de Apgar no 1º e no 5º minuto de vida. Um recém-nascido apresenta: frequência cardíaca de 110 bpm, choro forte e vigoroso, flexão ativa das extremidades, espirro ao aspirar as narinas, corpo rosado mas extremidades cianóticas (acrocianose). Qual a pontuação do Índice de Apgar atribuída a este recém-nascido?",
        options: [
          "A) 10 pontos.",
          "B) 9 pontos.",
          "C) 8 pontos.",
          "D) 7 pontos.",
          "E) 6 pontos."
        ],
        correctIndex: 1,
        explanation: "Pontuação do Apgar: 1) Frequência cardíaca > 100 bpm = 2; 2) Esforço respiratório (choro forte) = 2; 3) Tônus muscular (flexão ativa) = 2; 4) Irritabilidade reflexa (espirro) = 2; 5) Cor (corpo rosado e extremidades cianóticas - acrocianose) = 1. Total = 2+2+2+2+1 = 9 pontos.",
        leadIn: "Qual a nota do Apgar para um RN com acrocianose e demais parâmetros normais?",
        cognitiveType: "clinical_reasoning",
        category: "Ciclos de Vida"
      }
    ]
  }
];
