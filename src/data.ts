import { StudyModule, ExamQuestion, ExamAttempt, Flashcard } from "./types";

export const IMAGES = {
  loginBg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCINX4rcIXmcNHmhKDoH61cmlzI09AuPXwRuutnRAEepB7IU_DyoEhml-EFOgb3RXNvd-9vp6EaR7ChdEy5hEZIJbXh1PisP8Cjqd44VbKXEcbsj3wMqut-VeoRMHOsZ4VS4fvnKRpFadRBbLpgcCSTZ0MSF3KorJVnmaJMHtA5Oqm0PPoRrLmd4JeZn3DJb3066arhk9z2QnJ_F4EoSpxdC-n3CHxcevvTC3iJrorMBDSdp-7fz5fkgw",
  anatomicalHeart: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2wxRSNELdVPOgYc7BNUE0rhBJ0OI9K_9EVlgLxJxeeYJaEfeEkAOO8cZtfdx_y5mbcUatEULlKzxXyJsdL4-voRPPeY1lqklMezeYqSKvYMQGPn6qcZPNf6pKDufnqOSVzsnMdTtcnHIVtTgIlbGWc54HKUWLNkx05-wZiz0VycDrFXEKJQ5-zwJDCZgp6Y9gEUqJFD_TfSM6DivsMP0ktVPum9sGERRDb2TAYveyoDYUpDLh-C2wJQ"
};

export const INITIAL_PROFILE = {
  firstName: "Estudante",
  lastName: "",
  email: "",
  institution: "Portal de Estudos",
  residencyYear: "Foco: Enfermagem",
  focusAreas: ["Legislação do SUS", "Código de Ética COFEN", "Urgência e UTI", "Saúde da Mulher e da Criança"],
  avatar: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=150&h=150&fit=crop",
  notifications: {
    reminders: true,
    deadlines: true,
    approvals: true
  }
};

export const MOCK_SCHEDULE = [
  {
    id: "s1",
    date: "18 Jul",
    time: "14:00",
    title: "Resolução de Questões: Legislações do SUS (Banca FGV)",
    titleEn: "Practice Questions: SUS Legislation (FGV Board)",
    type: "exam"
  },
  {
    id: "s2",
    date: "20 Jul",
    time: "09:00",
    title: "Estudo de Teoria por Flashcards: Código de Ética (COFEN 564)",
    titleEn: "Flashcard Theory Study: Code of Ethics (COFEN 564)",
    type: "class"
  },
  {
    id: "s3",
    date: "22 Jul",
    time: "08:00",
    title: "Simulado Geral ENARE: 100 Questões Multidisciplinares",
    titleEn: "General ENARE Mock Exam: 100 Multidisciplinary Questions",
    type: "exam"
  },
  {
    id: "s4",
    date: "24 Jul",
    time: "16:30",
    title: "Revisão e Correção no Caderno de Erros (Mínimo 300 questões/semana)",
    titleEn: "Review & Correction in 'Caderno de Erros' (Min 300 q/week)",
    type: "group"
  }
];

export const INITIAL_MODULES: StudyModule[] = [
  {
    id: "mod-basicos",
    title: "Conhecimentos Básicos - Português e Informática",
    titleEn: "Basic Knowledge - Portuguese & IT",
    category: "Básicos Comuns",
    categoryEn: "Common Basics",
    description: "Tópicos de Língua Portuguesa (interpretação de texto, gramática e redação) e Informática básica (ferramentas de escritório e internet) exigidos no ENARE.",
    descriptionEn: "Portuguese Language (text comprehension, grammar) and basic IT topics required for the common ENARE exam.",
    iconName: "BookOpen",
    lessons: [
      {
        id: "les-bas-1",
        title: "Língua Portuguesa: Interpretação de Texto e Coesão Textual",
        titleEn: "Portuguese: Text Interpretation & Cohesion",
        duration: "30 min",
        completed: false,
        content: "Estudo direcionado para a banca do ENARE. Técnicas de interpretação e compreensão de textos de saúde, análise de coesão referencial e sequencial, inferência de sentidos e identificação da ideia central do autor. Dicas de redação oficial e concordância.",
        contentEn: "Targeted study for ENARE. Techniques for interpreting health-related texts, referential and sequential cohesion, inferring meaning, and finding key ideas."
      },
      {
        id: "les-bas-2",
        title: "Gramática Aplicada: Ortografia, Regência e Crase",
        titleEn: "Grammar: Spelling, Verb Regimen & Crase",
        duration: "35 min",
        completed: false,
        content: "Revisão dos pontos mais cobrados nas provas objetivas de enfermagem: emprego da crase, concordância verbal e nominal, regência verbal e nominal, e colocação pronominal. Questões comentadas de concursos recentes.",
        contentEn: "Review of most tested grammar points in nursing exams: use of 'crase', agreement rules, verb and noun regimen."
      },
      {
        id: "les-bas-3",
        title: "Noções de Informática: Ferramentas de Escritório e Redes",
        titleEn: "IT Basics: Office Tools & Networking",
        duration: "25 min",
        completed: false,
        content: "Noções básicas de informática cobradas no edital: navegação segura na internet, conceitos de computação em nuvem, segurança da informação (senhas, malwares, antivírus) e principais atalhos e ferramentas de escritório (Word, Excel e correio eletrônico).",
        contentEn: "Basic IT concepts for exams: secure browsing, cloud concepts, security basics, and essential office suite tools."
      }
    ]
  },
  {
    id: "mod-sus",
    title: "Conhecimentos Básicos - SUS",
    titleEn: "Basic SUS Healthcare Knowledge",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    description: "História das políticas de saúde, Reforma Sanitária, Leis 8.080/90 e 8.142/90, Decreto 7.508/11, PNAB, PNH, Vigilância e Populações Vulnerabilizadas.",
    descriptionEn: "History of health policies, Sanitary Reform, Laws 8.080/90 & 8.142/90, Decree 7.508/11, PNAB, PNH, Surveillance, and Vulnerable Populations.",
    iconName: "BookOpen",
    lessons: [
      {
        id: "les-sus-1",
        title: "História das Políticas de Saúde no Brasil e Reforma Sanitária",
        titleEn: "History of Health Policies in Brazil & Sanitary Reform",
        duration: "40 min",
        completed: false,
        content: "A evolução histórica da saúde pública brasileira. Períodos marcantes: Caixas de Aposentadoria e Pensões (CAPs), Institutos de Aposentadoria e Pensões (IAPs), INPS/INAMPS, o Movimento de Reforma Sanitária, a VIII Conferência Nacional de Saúde e a promulgação da Constituição Federal de 1988, que declarou a saúde como direito de todos e dever do Estado.",
        contentEn: "The historical evolution of Brazilian public health. Notable periods: CAPs, IAPs, INPS/INAMPS, the Sanitary Reform Movement, the VIII National Health Conference, and the 1988 Federal Constitution, which declared health as a right for all and a duty of the State."
      },
      {
        id: "les-sus-2",
        title: "Legislações Estruturantes: Lei 8.080/90, Lei 8.142/90 e Decreto 7.508/11",
        titleEn: "Core Legislations: Law 8.080, Law 8.142, and Decree 7.508",
        duration: "55 min",
        completed: false,
        content: "Análise profunda das leis orgânicas da saúde. Lei 8.080/1990: define objetivos, atribuições, princípios (universalidade, integralidade, equidade) e a organização do SUS. Lei 8.142/1990: rege a participação da comunidade (Conselhos e Conferências com representação paritária de 50% de usuários) e a transferência de recursos financeiros. Decreto 7.508/2011: regulamenta o SUS, detalhando Regiões de Saúde, Contrato Organizativo de Ação Pública (COAP), Portas de Entrada e Rede de Atenção à Saúde. Atenção ao Controle Social que envolve a participação da comunidade.",
        contentEn: "Deep analysis of the organic health laws. Law 8.080/1990: defines objectives, principles (universality, integrality, equity), and SUS organization. Law 8.142/1990: regulates community participation (Councils and Conferences with 50% parity user representation) and funding transfers. Decree 7.508/2011: regulates SUS, detailing Health Regions, COAP, Gateways, and Healthcare Networks."
      },
      {
        id: "les-sus-3",
        title: "Redes de Atenção à Saúde (RAS) e Estratégia Saúde da Família (ESF)",
        titleEn: "Healthcare Networks (RAS) & Family Health Strategy (ESF)",
        duration: "45 min",
        completed: false,
        content: "Organização estrutural do SUS em redes integradas de serviços de saúde. A Atenção Primária à Saúde (APS) como coordenadora do cuidado e ordenadora da rede. Estratégia Saúde da Família (ESF) como modelo prioritário para a expansão e consolidação da atenção básica, baseada em territórios delimitados, equipes multiprofissionais e vínculo longitudinal.",
        contentEn: "Structural organization of SUS into integrated networks. Primary Healthcare (PHC) as the care coordinator and network organizer. Family Health Strategy (ESF) as the priority model for basic care expansion and consolidation, based on defined territories, multiprofessional teams, and longitudinal relationship."
      },
      {
        id: "les-sus-4",
        title: "Política Nacional de Atenção Básica (PNAB) e Educação Permanente",
        titleEn: "National Basic Care Policy (PNAB) & Continuing Education",
        duration: "40 min",
        completed: false,
        content: "Princípios e diretrizes da PNAB (Portaria de Consolidação nº 2/2017). Diferença entre os princípios (universalidade, equidade, integralidade) e as diretrizes (regionalização, territorialização, adscrição, cuidado centrado na pessoa, resolutividade, longitudinalidade, coordenação do cuidado, ordenação da rede, participação da comunidade). A Política Nacional de Educação Permanente em Saúde (PNEPS - Portaria 198/2004) como estratégia de transformação de práticas por meio do aprendizado no cotidiano do trabalho.",
        contentEn: "Principles and guidelines of PNAB. Difference between principles (universality, equity, integrality) and guidelines (regionalization, territorialization, enrollment, person-centered care, resolutivity, longitudinality, care coordination, network ordering, community participation). The National Policy on Continuing Education in Health (PNEPS - Ordinance 198/2004) as a strategy for transforming work-based learning."
      },
      {
        id: "les-sus-5",
        title: "Políticas Específicas e Inclusão de Grupos Vulnerabilizados",
        titleEn: "Specific Policies & Inclusion of Vulnerable Groups",
        duration: "50 min",
        completed: false,
        content: "Estudo das políticas de inclusão voltadas para populações historicamente excluídas e vulneráveis: Saúde da Criança e do Adolescente, Pessoa Idosa, População LGBTQIA+, Pessoas com Deficiência, Pessoas em Situação de Rua (Consultório na Rua), Povos Originários, População Negra e Comunidades Quilombolas. Garantia da equidade e atenção às especificidades epidemiológicas de cada grupo.",
        contentEn: "Study of inclusion policies aimed at historically excluded and vulnerable populations: Children and Adolescents, Elders, LGBTQIA+ Population, Persons with Disabilities, Homeless (Consultório na Rua), Indigenous, Black Population, and Quilombolas. Guaranteeing equity and addressing specific epidemiological needs."
      },
      {
        id: "les-sus-6",
        title: "Política Nacional de Humanização (PNH) e Vigilância em Saúde (PNVS)",
        titleEn: "National Humanization Policy (PNH) & Health Surveillance (PNVS)",
        duration: "35 min",
        completed: false,
        content: "A PNH (HumanizaSUS) e seus 3 princípios (Transversalidade, Indissociabilidade entre atenção e gestão, Protagonismo/co-responsabilidade dos sujeitos) e as 6 diretrizes (Acolhimento, Classificação de risco, Valorização do trabalhador, Ambiência, Clínica ampliada, Co-gestão). A Política Nacional de Vigilância em Saúde (PNVS): integração entre vigilância epidemiológica, sanitária, em saúde ambiental e em saúde do trabalhador.",
        contentEn: "PNH (HumanizaSUS) and its 3 principles (Transversality, Indissociability of care/management, Subject protagonism) and 6 guidelines (Welcoming, Risk classification, Worker appreciation, Ambiance, Expanded clinical practice, Co-management). PNVS: integrating epidemiological, sanitary, environmental, and occupational health surveillance."
      }
    ]
  },
  {
    id: "mod-etica",
    title: "Ética, Legislação e Processo de Enfermagem",
    titleEn: "Ethics, Legislation & Nursing Process",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    description: "Código de Ética (COFEN 564/2017), Lei do Exercício Profissional, Sistematização da Assistência de Enfermagem (SAE), Diagnósticos NANDA/NIC, Biossegurança e CME.",
    descriptionEn: "Code of Ethics (COFEN 564/2017), Professional Practice Act, Nursing Care Systematization (SAE), NANDA/NIC diagnoses, Biosafety, and Sterile Processing (CME).",
    iconName: "ShieldAlert",
    lessons: [
      {
        id: "les-etica-1",
        title: "Aspectos Éticos e Exercício Profissional da Enfermagem",
        titleEn: "Ethical Aspects & Professional Nursing Exercise",
        duration: "45 min",
        completed: false,
        content: "Estudo da Lei nº 7.498/1986 e Decreto nº 94.406/1987 (exercício profissional, competências privativas do enfermeiro vs. técnicos e auxiliares). Análise da Resolução COFEN nº 564/2017 (Código de Ética dos Profissionais de Enfermagem): Direitos, Deveres e Proibições, com ênfase nas penalidades (advertência verbal, multa, censura, suspensão do exercício profissional por até 90 dias e cassação do direito ao exercício de competência do Conselho Federal).",
        contentEn: "Study of Law No. 7,498/1986 and Decree No. 94,406/1987 (professional practice, private competencies of nurses vs. technicians). Analysis of COFEN Resolution No. 564/2017 (Code of Ethics): Rights, Duties, and Prohibitions, emphasizing penalties (verbal warning, fine, censure, suspension up to 90 days, and license revocation by the Federal Council)."
      },
      {
        id: "les-etica-2",
        title: "Sistematização da Assistência (SAE) e Taxonomias NANDA, NIC e NOC",
        titleEn: "Nursing Process (SAE) & NANDA, NIC, NOC Taxonomies",
        duration: "50 min",
        completed: false,
        content: "Estudo da Resolução COFEN nº 736/2024 (atualização da SAE e do Processo de Enfermagem estruturado em 5 etapas: 1. Investigação/Avaliação, 2. Diagnóstico, 3. Planejamento, 4. Implementação, 5. Evolução). Integração das taxonomias NANDA-I (diagnósticos), NIC (intervenções) e NOC (resultados esperados) para o planejamento científico e individualizado do cuidado de enfermagem.",
        contentEn: "Study of COFEN Resolution No. 736/2024 (SAE and Nursing Process structured in 5 phases: 1. Assessment, 2. Diagnosis, 3. Planning, 4. Implementation, 5. Evaluation). Integration of NANDA-I, NIC, and NOC taxonomies for scientific and customized care planning."
      },
      {
        id: "les-etica-3",
        title: "Biossegurança, Controle de Infecções (IRAS) e Central de Material (CME)",
        titleEn: "Biosafety, Infection Control (HAIs) & Sterile Processing (CME)",
        duration: "50 min",
        completed: false,
        content: "Diretrizes de biossegurança aplicadas à assistência de enfermagem: precauções padrão, precauções por contato, gotículas e aerossóis. Ações para prevenção e controle de IRAS. Funcionamento da Central de Material e Esterilização (CME): etapas de expurgo/limpeza, preparo, esterilização física (autoclave) e química, estocagem e indicadores de controle (biológico/químico). NR 32: segurança e saúde no trabalho em serviços de saúde.",
        contentEn: "Biosafety guidelines: standard, contact, droplet, and airborne precautions. Preventing HAIs. Sterile Processing (CME): cleaning, prep, sterilization (autoclave), storage, and quality indicators. NR 32 workplace safety."
      }
    ]
  },
  {
    id: "mod-urgencia",
    title: "Urgência, Emergência e Terapia Intensiva (UTI)",
    titleEn: "Urgency, Emergency & Intensive Care (ICU)",
    category: "Urgência e UTI",
    categoryEn: "Emergency & ICU",
    description: "Atendimento imediato, RCP (ACLS/PALS), choque, traumas graves (TCE, abdominal, torácico), drogas vasoativas e manejo clínico de animais peçonhentos.",
    descriptionEn: "Immediate emergency care, CPR (ACLS/PALS), shock states, major trauma (TBI, abdominal, thoracic), vasoactive drug infusions, and envenomation clinical management.",
    iconName: "Activity",
    lessons: [
      {
        id: "les-urg-1",
        title: "Ressuscitação Cardiopulmonar (RCP) e Emergências Neurológicas/Cardiovasculares",
        titleEn: "Cardiopulmonary Resuscitation (CPR) & Neuro/Cardio Emergencies",
        duration: "55 min",
        completed: false,
        content: "Diretrizes atualizadas da AHA para Suporte Básico (SBV) e Avançado de Vida (ACLS/PALS). Reconhecimento de ritmos chocáveis (FV/TV sem pulso) e não-chocáveis (Assistolia/AESP). Atendimento ao AVC agudo (Cincinnati e trombólise Porta-Agulha < 60 min) e Infarto Agudo do Miocárdio com supra de ST (Porta-Balão < 90 min).",
        contentEn: "Updated AHA guidelines for BLS, ACLS, and PALS. Distinguishing shockable (VF/pulseless VT) from non-shockable (Asystole/PEA) rhythms. Management of acute stroke (Cincinnati scale & Door-to-Needle < 60 mins) and STEMI (Door-to-Balloon < 90 mins)."
      },
      {
        id: "les-urg-2",
        title: "Assistência de Enfermagem nos Choques e Traumas Graves",
        titleEn: "Nursing Care in Shocks and Major Trauma",
        duration: "50 min",
        completed: false,
        content: "Abordagem fisiopatológica e monitorização nos choques: hipovolêmico, séptico (protocolo de sepse e antibioticoterapia imediata), cardiogênico, neurogênico e anafilático. Cuidados em trauma seguindo o protocolo PHTLS (XABCDE): controle de grandes hemorragias, vias aéreas com controle cervical, ventilação, circulação com infusão de cristaloides e prevenção de tríade da morte (hipotermia, acidose e coagulopatia). Cuidados no Traumatismo Cranioencefálico (TCE), trauma torácico e abdominal.",
        contentEn: "Pathophysiological approach and monitoring in shock states: hypovolemic, septic, cardiogenic, neurogenic, and anaphylactic. Trauma care following PHTLS (XABCDE) protocol: major hemorrhage control, airway with cervical stabilization, breathing, circulation with crystalloid infusion, and avoiding the lethal triad (hypothermia, acidosis, coagulopathy). Brain, thoracic, and abdominal trauma care."
      },
      {
        id: "les-urg-3",
        title: "Drogas Vasoativas, Soluções Críticas e UTI",
        titleEn: "Vasoactive Drugs, Critical Solutions & ICU",
        duration: "45 min",
        completed: false,
        content: "Mecanismo de ação, diluição adequada e cuidados assistenciais indispensáveis na infusão de drogas vasoativas (Noradrenalina, Dobutamina, Nitroglicerina, Nitroprussiato de Sódio) em bomba de infusão contínua por via venosa central exclusiva. Monitorização hemodinâmica invasiva (PAM por linha arterial) e não invasiva. Cuidados de enfermagem com sedativos (Midazolam, Propofol, Fentanil) e bloqueadores neuromusculares. Prevenção de pneumonia associada à ventilação (PAV) e infecção de corrente sanguínea.",
        contentEn: "Mechanism of action, proper dilution, and critical care in vasoactive drug infusions (Norepinephrine, Dobutamine, Nitroglycerin, Sodium Nitroprusside) via continuous infusion pumps in central lines. Hemodynamic monitoring (invasive MAP via arterial line). Nursing care with sedatives, neuromuscular blockers, and preventing HAIs like VAP."
      },
      {
        id: "les-urg-4",
        title: "Manejo Clínico de Acidentes por Animais Peçonhentos",
        titleEn: "Clinical Management of Venous Animal Accidents",
        duration: "30 min",
        completed: false,
        content: "Reconhecimento das manifestações clínicas e conduta terapêutica nos acidentes ofídicos: Botrópico (jararaca - dor, edema, equimose, sangramentos), Crotálico (cascavél - fácies miastênica, ptose palpebral, urina escura/rabdomiólise), Laquético (surucucu - dor local, diarreia, cólicas) e Elapídico (coral - paralisia respiratória aguda). Administração de soros específicos (antiofídicos), prevenção de reação anafilática e cuidados com o sítio da picada (nunca garrotear ou cortar).",
        contentEn: "Recognition of clinical symptoms and antivenom therapy in snakebites: Bothropic (pain, edema, bleeding), Crotalic (myasthenic facies, dark urine/rhabdomyolysis), Lachetic (local pain, diarrhea, cramps), and Elapidic (acute respiratory paralysis). Administration of specific antivenoms and site care (never apply a tourniquet)."
      }
    ]
  },
  {
    id: "mod-ciclos",
    title: "Saúde da Mulher, Criança e Ciclos de Vida",
    titleEn: "Women, Children & Lifespan Health",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    description: "Ciclo gravídico-puerperal (PNAISM), pré-natal, puericultura (saúde da criança), imunização, geriatria (síndromes e demências) e saúde mental.",
    descriptionEn: "Gravid-puerperal cycle (PNAISM), prenatal care, child health/puericulture, immunizations, geriatrics (syndromes and dementia), and mental health.",
    iconName: "Baby",
    lessons: [
      {
        id: "les-ciclos-1",
        title: "Ciclo Gravídico-Puerperal: Pré-Natal, Parto e Aleitamento Materno",
        titleEn: "Pregnancy & Postpartum: Prenatal, Delivery & Breastfeeding",
        duration: "50 min",
        completed: false,
        content: "Atenção pré-natal de baixo risco (PNAISM). Diagnóstico de gravidez (sinais de presunção, probabilidade e certeza). Modificações fisiológicas maternas. Cálculo da Idade Gestacional (IG) e Data Provável do Parto (DPP) pela Regra de Naegele (+7 dias ao primeiro dia da DUM, -3 meses ou +9 meses ao ano). Cuidados no parto humanizado, prevenção da violência obstétrica e manejo clínico do aleitamento materno (prevenção de fissuras, pega correta, ingurgitamento mamário).",
        contentEn: "Low-risk prenatal care (PNAISM). Pregnancy diagnosis. Maternal physiological changes. Calculating Gestational Age (GA) and Estimated Date of Delivery (EDD) using Naegele's Rule (+7 days to LMP, -3 months). Humanized birth, preventing obstetric violence, and clinical breastfeeding management."
      },
      {
        id: "les-ciclos-2",
        title: "Puericultura, Desenvolvimento Infantil e Imunizações",
        titleEn: "Puericulture, Child Development & Immunizations",
        duration: "45 min",
        completed: false,
        content: "Acompanhamento do crescimento (peso, estatura, perímetro cefálico) e marcos do neurodesenvolvimento infantil na consulta de puericultura. Calendário Nacional de Vacinação do Ministério da Saúde: vacinas do recém-nascido (BCG e Hepatite B) e do primeiro ano de vida (Pentavalente, VIP/VOP, Rotavírus, Pneumocócica 10-valente, Meningocócica C, Febre Amarela e Tríplice Viral). Cuidados na administração de imunobiológicos, reações adversas e contraindicações.",
        contentEn: "Monitoring infant growth and neurodevelopmental milestones in puericulture. National Immunization Program (PNI) schedule: newborn vaccines (BCG, Hep B), infant schedule, administration techniques, adverse reactions, and contraindications."
      },
      {
        id: "les-ciclos-3",
        title: "Saúde do Idoso, Síndromes Geriátricas e Saúde Mental",
        titleEn: "Elderly Health, Geriatric Syndromes & Mental Health",
        duration: "40 min",
        completed: false,
        content: "Processo de envelhecimento fisiológico (senescência) vs. patológico (senilidade). Principais Síndromes Geriátricas: incapacidade cognitiva, instabilidade postural (quedas), imobilidade, incontinências (urinária/fecal), iatrogenia. Cuidados de enfermagem nas demências comuns (Alzheimer), Doença de Parkinson e depressão/delírium no idoso. Atenção em Saúde Mental: reforma psiquiátrica brasileira, cuidado em CAPS e manejo de crises de ansiedade, ideação suicida e surtos psicóticos.",
        contentEn: "Physiological (senescence) vs. pathological (senility) aging. Key Geriatric Syndromes: cognitive impairment, postural instability (falls), immobility, incontinence, iatrogenesis. Nursing care in Alzheimer's, Parkinson's, and delirium. Mental Health: psychiatric reform, care in CAPS, and crisis management."
      }
    ]
  },
  {
    id: "mod-procedimentos",
    title: "Semiologia, Procedimentos Clínicos e Segurança",
    titleEn: "Semiology, Clinical Procedures & Safety",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice",
    description: "Semiologia clínica, cateteres, sondagens, curativos, cuidados cirúrgicos, segurança do paciente e do trabalhador (NR 32) e pesquisa em enfermagem (PBE).",
    descriptionEn: "Clinical semiology, catheters, tube insertions, dressings, surgical care, patient & worker safety (NR 32), and nursing research (EBP).",
    iconName: "UserCheck",
    lessons: [
      {
        id: "les-proc-1",
        title: "Semiologia, Exame Físico e Procedimentos de Enfermagem",
        titleEn: "Semiology, Physical Assessment & Nursing Procedures",
        duration: "50 min",
        completed: false,
        content: "Técnicas de exame físico: inspeção, palpação, percussão e ausculta (cardíaca, pulmonar e abdominal). Avaliação semiológica dos sistemas adulto e pediátrico. Habilidades técnicas essenciais: cateterismo vesical de alívio e demora, passagem de sonda nasogástrica/nasoenteral, curativos e estomas (traqueostomia, gastrostomia, colostomia). Técnica correta de punção venosa periférica, coleta de sangue, gasometria arterial e administração segura de medicamentos por via IM (técnica em Z, locais adequados), IV, SC e ID.",
        contentEn: "Physical assessment techniques: inspection, palpation, percussion, and auscultation. Semiological assessment of adult and pediatric systems. Technical skills: urinary catheterization, nasogastric/nasoenteral tubes, dressings, and stomas. Peripheral IV lines, arterial blood gas sampling, and safe drug administration."
      },
      {
        id: "les-proc-2",
        title: "Segurança do Paciente, Segurança do Trabalho (NR 32) e PBE",
        titleEn: "Patient Safety, Occupational Safety (NR 32) & EBP",
        duration: "40 min",
        completed: false,
        content: "As 6 Metas Internacionais de Segurança do Paciente do Ministério da Saúde/ANVISA: 1. Identificação correta, 2. Comunicação efetiva, 3. Prescrição e administração segura de medicamentos de alta vigilância, 4. Cirurgia segura (cuidados pré, trans, pós-operatório e SRPA), 5. Higienização das mãos (os 5 momentos), 6. Prevenção de quedas e lesões por pressão. Segurança do trabalhador segundo a NR 32: prevenção de acidentes com perfurocortantes (proibição de reencapar agulhas) e descarte correto de resíduos. Pesquisa em Enfermagem e Prática Baseada em Evidências (PBE) para embasamento científico das condutas.",
        contentEn: "The 6 International Patient Safety Goals. Occupational safety according to NR 32: preventing sharps accidents (prohibiting recapping needles) and correct waste disposal. Nursing Research and Evidence-Based Practice (EBP) to ground nursing actions."
      }
    ]
  },
  {
    id: "mod-epidemiologia",
    title: "Saúde Coletiva e Epidemiologia",
    titleEn: "Public Health & Epidemiology",
    category: "Saúde Coletiva",
    categoryEn: "Public Health",
    description: "Conceitos de epidemiologia, indicadores de saúde, vigilância epidemiológica e controle de doenças transmissíveis e não transmissíveis.",
    descriptionEn: "Epidemiology concepts, health indicators, epidemiological surveillance, and control of communicable and non-communicable diseases.",
    iconName: "Globe",
    lessons: [
      {
        id: "les-epi-1",
        title: "Indicadores de Saúde e Coeficientes Epidemiológicos",
        titleEn: "Health Indicators & Epidemiological Coefficients",
        duration: "45 min",
        completed: false,
        content: "Cálculo e interpretação dos principais indicadores: mortalidade (infantil, materna), morbidade, prevalência vs. incidência, letalidade e esperança de vida ao nascer. Uso desses dados para o planejamento em saúde.",
        contentEn: "Calculating and interpreting key indicators: mortality, morbidity, prevalence vs. incidence, lethality, and life expectancy. Using data for health planning."
      },
      {
        id: "les-epi-2",
        title: "Vigilância Epidemiológica e Doenças de Notificação Compulsória",
        titleEn: "Epidemiological Surveillance & Mandatory Notification",
        duration: "40 min",
        completed: false,
        content: "Fluxo de notificação compulsória (Portaria GM/MS nº 217/2023). Doenças de notificação imediata (24h) e semanal. Investigação de surtos e epidemias em ambiente hospitalar e comunitário.",
        contentEn: "Mandatory notification flow. Immediate (24h) and weekly notification diseases. Investigating outbreaks and epidemics in hospitals and communities."
      }
    ]
  },
  {
    id: "mod-farmaco",
    title: "Manejo Clínico e Farmacologia Aplicada",
    titleEn: "Clinical Management & Applied Pharmacology",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice",
    description: "Cálculo de medicação, farmacocinética, farmacodinâmica e principais classes de fármacos na assistência de enfermagem.",
    descriptionEn: "Medication calculation, pharmacokinetics, pharmacodynamics, and key drug classes in nursing care.",
    iconName: "Pill",
    lessons: [
      {
        id: "les-farm-1",
        title: "Cálculo de Medicamentos e Soluções",
        titleEn: "Medication & Solution Calculations",
        duration: "55 min",
        completed: false,
        content: "Revisão matemática para enfermagem: regra de três, cálculo de gotejamento (micro e macrogotas), transformações de soluções (soro glicosado) e diluição de antibióticos (penicilinas e cefalosporinas).",
        contentEn: "Math review for nursing: rule of three, drip rate calculation, solution transformations, and antibiotic dilution."
      },
      {
        id: "les-farm-2",
        title: "Farmacologia de Urgência e Emergência",
        titleEn: "Emergency Pharmacology",
        duration: "50 min",
        completed: false,
        content: "Principais drogas no carrinho de emergência: Adrenalina, Amiodarona, Adenosina, Atropina e Lidocaína. Indicações, contraindicações e efeitos colaterais críticos.",
        contentEn: "Key emergency cart drugs: Adrenaline, Amiodarone, Adenosine, Atropine, and Lidocaine. Indications, contraindications, and critical side effects."
      }
    ]
  },
  {
    id: "mod-cirurgica",
    title: "Enfermagem Médico-Cirúrgica (Cardiologia e Nefrologia)",
    titleEn: "Medical-Surgical Nursing (Cardiology & Nephrology)",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice",
    description: "Cuidado ao paciente com distúrbios cardiovasculares, renais e metabólicos complexos. Equilíbrio hidroeletrolítico e ácido-básico.",
    descriptionEn: "Care for patients with complex cardiovascular, renal, and metabolic disorders. Fluid, electrolyte, and acid-base balance.",
    iconName: "Activity",
    lessons: [
      {
        id: "les-cir-1",
        title: "Hemodinâmica Invasiva e Monitorização Cardíaca",
        titleEn: "Invasive Hemodynamics & Cardiac Monitoring",
        duration: "50 min",
        completed: false,
        content: "Interpretação de traçados de ECG, reconhecimento de arritmias malignas, monitorização de Pressão Arterial Invasiva (PAI) e Pressão Venosa Central (PVC).",
        contentEn: "ECG interpretation, recognizing lethal arrhythmias, monitoring Invasive Blood Pressure (IBP) and Central Venous Pressure (CVP)."
      },
      {
        id: "les-cir-2",
        title: "Distúrbios Renais e Terapia de Substituição Renal (Diálise)",
        titleEn: "Renal Disorders & Renal Replacement Therapy (Dialysis)",
        duration: "45 min",
        completed: false,
        content: "Cuidado ao paciente em Insuficiência Renal Aguda e Crônica. Princípios de hemodiálise, diálise peritoneal e complicações no paciente dialítico.",
        contentEn: "Care for patients in Acute and Chronic Renal Failure. Principles of hemodialysis, peritoneal dialysis, and complications."
      }
    ]
  },
  {
    id: "mod-mental",
    title: "Saúde Mental e Psiquiatria",
    titleEn: "Mental Health & Psychiatry",
    category: "Saúde Coletiva",
    categoryEn: "Public Health",
    description: "Reforma psiquiátrica brasileira, cuidado em rede (RAPS), transtornos mentais comuns e manejo de crises.",
    descriptionEn: "Brazilian psychiatric reform, network care (RAPS), common mental disorders, and crisis management.",
    iconName: "Brain",
    lessons: [
      {
        id: "les-men-1",
        title: "Legislação e Reforma Psiquiátrica no Brasil",
        titleEn: "Legislation & Psychiatric Reform in Brazil",
        duration: "40 min",
        completed: false,
        content: "Histórico da saúde mental no Brasil, Lei 10.216/2001 e a substituição do modelo manicomial pelo cuidado em liberdade (CAPS, SRT, Centros de Convivência).",
        contentEn: "History of mental health in Brazil, Law 10.216/2001, and replacing the asylum model with freedom-based care."
      },
      {
        id: "les-men-2",
        title: "Manejo de Crises e Transtornos de Ansiedade/Depressão",
        titleEn: "Crisis Management & Anxiety/Depression Disorders",
        duration: "50 min",
        completed: false,
        content: "Abordagem ao paciente em surto psicótico, tentativa de autoextermínio e crise de ansiedade. Farmacoterapia psiquiátrica e efeitos colaterais.",
        contentEn: "Approaching patients in psychotic outbreaks, suicide attempts, and anxiety crises. Psychiatric pharmacotherapy."
      }
    ]
  },
  {
    id: "mod-gestao",
    title: "Gestão em Enfermagem e Auditoria",
    titleEn: "Nursing Management & Auditing",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    description: "Gerenciamento de recursos humanos e materiais, liderança, auditoria de contas e prontuários e indicadores de qualidade.",
    descriptionEn: "Management of human and material resources, leadership, auditing of accounts and records, and quality indicators.",
    iconName: "ClipboardCheck",
    lessons: [
      {
        id: "les-ges-1",
        title: "Dimensionamento de Pessoal e Liderança",
        titleEn: "Staff Sizing & Leadership",
        duration: "45 min",
        completed: false,
        content: "Cálculo de dimensionamento de pessoal de enfermagem (Resolução COFEN 543/2017). Teorias de liderança aplicadas à gerência de enfermagem.",
        contentEn: "Calculating nursing staff sizing (COFEN Resolution 543/2017). Leadership theories applied to nursing management."
      },
      {
        id: "les-ges-2",
        title: "Auditoria de Enfermagem e Faturamento Hospitalar",
        titleEn: "Nursing Audit & Hospital Billing",
        duration: "40 min",
        completed: false,
        content: "Conceitos de auditoria retrospectiva e operacional. Importância da anotação de enfermagem para o faturamento e glosas hospitalares.",
        contentEn: "Concepts of retrospective and operational auditing. Importance of nursing notes for billing and preventing denials."
      }
    ]
  }
];

export const MOCK_QUESTIONS: ExamQuestion[] = [
  {
    id: "q-1",
    question: "De acordo com a Lei Orgânica da Saúde nº 8.142/1990 e a Resolução nº 453/2012 do Conselho Nacional de Saúde, que regulamentam o controle social e a participação da comunidade no SUS, qual é a representação recomendada para os Conselhos de Saúde e qual a composição paritária estabelecida?",
    questionEn: "According to Organic Health Law No. 8.142/1990 and Resolution No. 453/2012 of the National Health Council, which regulate social control and community participation in SUS, what is the recommended representation for Health Councils and what is the established parity composition?",
    options: [
      "Representação de 25% de usuários, 25% de profissionais de saúde, 25% de prestadores de serviços e 25% de governo.",
      "Representação paritária de 50% de representantes de usuários, sendo os demais 50% distribuídos entre profissionais de saúde, prestadores de serviço e representantes de governo.",
      "Representação de 60% de representantes do governo para garantir controle fiscal, com 40% distribuídos entre a comunidade de usuários.",
      "Representação livre de acordo com o porte do município, sem exigência de paridade de representação civil."
    ],
    optionsEn: [
      "Representation of 25% users, 25% healthcare professionals, 25% service providers, and 25% government representatives.",
      "Parity representation of 50% user representatives, with the remaining 50% distributed among healthcare professionals, service providers, and government representatives.",
      "Representation of 60% government representatives to ensure fiscal control, with 40% distributed among the user community.",
      "Free representation according to the municipality size, without any requirement for civil parity."
    ],
    correctIndex: 1,
    explanation: "A Lei nº 8.142/1990 e a Resolução nº 453/2012 estipulam que a representação dos usuários nos Conselhos de Saúde deve ser paritária em relação ao conjunto dos demais segmentos, ou seja, os usuários respondem por 50% de todas as vagas, enquanto os outros 50% são divididos entre trabalhadores de saúde, prestadores e gestores governamentais.",
    explanationEn: "Law No. 8,142/1990 and Resolution No. 453/2012 stipulate that user representation in Health Councils must be parity-based relative to the combination of other segments, meaning users account for 50% of all seats, while the other 50% is divided among health workers, providers, and government managers.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation"
  },
  {
    id: "q-2",
    question: "De acordo com o Código de Ética dos Profissionais de Enfermagem (Resolução COFEN nº 564/2017), recusar-se a executar atividades que não sejam de sua competência técnica, científica, ética e legal constitui um(a):",
    questionEn: "According to the Code of Ethics for Nursing Professionals (COFEN Resolution No. 564/2017), refusing to perform activities that are not within one's technical, scientific, ethical, and legal competence constitutes a:",
    options: [
      "Dever do profissional de enfermagem, passível de punição civil caso o faça.",
      "Proibição absoluta em qualquer situação clínica, inclusive de calamidade.",
      "Direito do profissional de enfermagem, assegurando sua segurança e a integridade do paciente.",
      "Infração ética moderada, aceita somente mediante ordem expressa e por escrito da chefia de enfermagem."
    ],
    optionsEn: [
      "Duty of the nursing professional, subject to civil punishment if violated.",
      "Absolute prohibition under any clinical circumstance, including emergencies.",
      "Right of the nursing professional, ensuring their safety and patient integrity.",
      "Moderate ethical infraction, accepted only upon express written order from the nursing director."
    ],
    correctIndex: 2,
    explanation: "O art. 22 da Resolução COFEN nº 564/2017 prevê expressamente como DIREITO do profissional de enfermagem: 'Recusar-se a executar atividades que não sejam de sua competência técnica, científica, ética e legal, ou que não ofereçam segurança ao profissional, à pessoa, à família e à coletividade'.",
    explanationEn: "Article 22 of COFEN Resolution No. 564/2017 explicitly guarantees as a RIGHT of the nursing professional: 'To refuse to perform activities that are not within one's technical, scientific, ethical, and legal competence, or that do not offer safety to the professional, the person, the family, and the community'.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management"
  },
  {
    id: "q-3",
    question: "Uma gestante comparece à primeira consulta de pré-natal na Atenção Básica de Saúde. Ao ser questionada sobre a Data da Última Menstruação (DUM), ela refere o dia 12 de janeiro de 2026. Utilizando a Regra de Naegele para o cálculo da Data Provável do Parto (DPP), qual data estimada o enfermeiro deve registrar no prontuário?",
    questionEn: "A pregnant patient attends her first prenatal visit in Primary Care. When asked about her Last Menstrual Period (LMP), she reports January 12th, 2026. Using Naegele's Rule to calculate the Estimated Date of Delivery (EDD), which date should the nurse record in the chart?",
    options: [
      "19 de Outubro de 2026.",
      "12 de Outubro de 2026.",
      "19 de Setembro de 2026.",
      "15 de Novembro de 2026."
    ],
    optionsEn: [
      "October 19th, 2026.",
      "October 12th, 2026.",
      "September 19th, 2026.",
      "November 15th, 2026."
    ],
    correctIndex: 0,
    explanation: "Pela Regra de Naegele, somamos 7 dias ao primeiro dia da última menstruação (12 + 7 = 19) e subtraímos 3 meses do mês da DUM (Janeiro/mês 1 - 3 meses = Outubro/mês 10), mantendo ou avançando o ano correspondente. Assim, a DPP é 19 de Outubro de 2026.",
    explanationEn: "According to Naegele's Rule, we add 7 days to the first day of the last menstruation (12 + 7 = 19) and subtract 3 months from the LMP month (January/month 1 - 3 months = October/month 10), adjusting the year. Therefore, the EDD is October 19th, 2026.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care"
  },
  {
    id: "q-6",
    question: "O Decreto nº 7.508/2011, que regulamenta a Lei nº 8.080/1990, define a 'Região de Saúde' como um espaço geográfico contínuo constituído por agrupamentos de Municípios limítrofes. Para ser instituída, uma Região de Saúde deve conter, no mínimo, ações e serviços de:",
    questionEn: "Decree No. 7.508/2011, which regulates Law No. 8.080/1990, defines 'Health Region' as a continuous geographic space. To be established, a Health Region must contain at least actions and services of:",
    options: [
      "A) Atenção primária; urgência e emergência; atenção psicossocial; atenção ambulatorial especializada e hospitalar; e vigilância em saúde.",
      "B) Apenas hospitais de alta complexidade e centros de trauma.",
      "C) Unidades de Pronto Atendimento (UPA) e farmácias populares apenas.",
      "D) Somente vigilância sanitária e controle de zoonoses."
    ],
    optionsEn: [
      "A) Primary care; urgency and emergency; psychosocial care; specialized ambulatory and hospital care; and health surveillance.",
      "B) Only high-complexity hospitals and trauma centers.",
      "C) Only Emergency Care Units (UPA) and community pharmacies.",
      "D) Only health surveillance and zoonosis control."
    ],
    correctIndex: 0,
    explanation: "De acordo com o Art. 5º do Decreto 7.508/11, a Região de Saúde deve conter, no mínimo, ações e serviços de: I - atenção primária; II - urgência e emergência; III - atenção psicossocial; IV - atenção ambulatorial especializada e hospitalar; e V - vigilância em saúde.",
    explanationEn: "According to Art. 5 of Decree 7.508/11, a Health Region must include at least: primary care, urgency/emergency, psychosocial care, specialized ambulatory/hospital care, and health surveillance.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation"
  },
  {
    id: "q-7",
    question: "A Política Nacional de Atenção Básica (PNAB 2017) estabelece diretrizes para a organização do cuidado. A diretriz que se refere à capacidade da Atenção Básica de resolver a grande maioria dos problemas de saúde da população, minimizando a necessidade de encaminhamentos, é a:",
    questionEn: "The National Basic Care Policy (PNAB 2017) sets guidelines for care organization. The guideline referring to the capacity of Basic Care to solve the vast majority of population health problems, minimizing referrals, is:",
    options: [
      "A) Longitudinalidade do cuidado.",
      "B) Adscrição de clientela.",
      "C) Resolutividade.",
      "D) Territorialização."
    ],
    optionsEn: [
      "A) Care longitudinality.",
      "B) Client enrollment.",
      "C) Resolutivity.",
      "D) Territorialization."
    ],
    correctIndex: 2,
    explanation: "A Resolutividade na PNAB significa que a Atenção Básica deve ser capaz de resolver a maioria dos problemas de saúde da comunidade (cerca de 80-85%), utilizando tecnologias de baixa densidade mas alta complexidade de cuidado.",
    explanationEn: "Resolutivity in PNAB means Basic Care should solve most community health problems (about 80-85%), using low-density but high-care-complexity technologies.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation"
  },
  {
    id: "q-8",
    question: "A Norma Regulamentadora 32 (NR 32) tem como finalidade estabelecer as diretrizes básicas para a implementação de medidas de proteção à segurança e à saúde dos trabalhadores dos serviços de saúde. Sobre o descarte de perfurocortantes, a NR 32 proíbe expressamente:",
    questionEn: "Regulatory Standard 32 (NR 32) aims to establish safety and health guidelines for health workers. Regarding sharps disposal, NR 32 expressly prohibits:",
    options: [
      "A) O uso de caixas de papelão rígido.",
      "B) O reencape e a desconexão manual de agulhas.",
      "C) O descarte de seringas com agulhas acopladas.",
      "D) A esterilização de materiais antes do descarte."
    ],
    optionsEn: [
      "A) Using rigid cardboard boxes.",
      "B) Recapping and manual disconnection of needles.",
      "C) Disposing of syringes with attached needles.",
      "D) Sterilizing materials before disposal."
    ],
    correctIndex: 1,
    explanation: "A NR 32 proíbe o reencape e a desconexão manual de agulhas para prevenir acidentes com material biológico, que são uma das principais causas de exposição ocupacional a patógenos no ambiente de saúde.",
    explanationEn: "NR 32 prohibits recapping and manual disconnection of needles to prevent accidents with biological material, a major cause of occupational exposure to pathogens.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice"
  },
  {
    id: "q-9",
    question: "A Resolução COFEN nº 736/2024 atualizou as diretrizes para a Sistematização da Assistência de Enfermagem (SAE). De acordo com a nova norma, o Processo de Enfermagem deve ser realizado de modo deliberado e sistemático em todos os ambientes onde ocorre o cuidado. A etapa em que se realiza a interpretação e o agrupamento dos dados coletados para a tomada de decisão é o:",
    questionEn: "COFEN Resolution No. 736/2024 updated guidelines for Nursing Care Systematization (SAE). According to the new rule, the Nursing Process must be deliberate and systematic. The stage involving data interpretation and grouping for decision-making is:",
    options: [
      "A) Diagnóstico de Enfermagem.",
      "B) Planejamento de Enfermagem.",
      "C) Avaliação de Enfermagem.",
      "D) Exame Físico."
    ],
    optionsEn: [
      "A) Nursing Diagnosis.",
      "B) Nursing Planning.",
      "C) Nursing Evaluation.",
      "D) Physical Examination."
    ],
    correctIndex: 0,
    explanation: "O Diagnóstico de Enfermagem é a etapa de julgamento clínico sobre as respostas da pessoa, família ou coletividade a problemas de saúde/processos de vida, servindo de base para a seleção das intervenções de enfermagem.",
    explanationEn: "Nursing Diagnosis is the clinical judgment stage about responses to health problems/life processes, serving as the basis for selecting nursing interventions.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management"
  },
  {
    id: "q-10",
    question: "Foi prescrito para um paciente 500 mL de Soro Glicosado a 5% para ser administrado em 8 horas. Utilizando equipo de macrogotas, quantas gotas por minuto deverão ser administradas, aproximadamente?",
    questionEn: "A patient was prescribed 500 mL of 5% Glucose Serum to be administered over 8 hours. Using a macrodrip set, approximately how many drops per minute should be administered?",
    options: [
      "A) 14 gotas/min.",
      "B) 21 gotas/min.",
      "C) 28 gotas/min.",
      "D) 42 gotas/min."
    ],
    optionsEn: [
      "A) 14 drops/min.",
      "B) 21 drops/min.",
      "C) 28 drops/min.",
      "D) 42 drops/min."
    ],
    correctIndex: 1,
    explanation: "A fórmula para macrogotas é: Gotas = Volume / (Tempo x 3). Logo, Gotas = 500 / (8 x 3) = 500 / 24 = 20,83. Arredondando, temos aproximadamente 21 gotas por minuto.",
    explanationEn: "The macrodrip formula is: Drops = Volume / (Time x 3). So, Drops = 500 / (8 x 3) = 500 / 24 = 20.83. Rounding up, it's approximately 21 drops per minute.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice"
  },
  {
    id: "q-11",
    question: "Na consulta de enfermagem em Puericultura, ao avaliar o desenvolvimento neuropsicomotor de um lactente de 4 meses, qual marco do desenvolvimento é ESPERADO para essa idade?",
    questionEn: "In a Puericulture nursing visit, when assessing the neuro-psychomotor development of a 4-month-old infant, which developmental milestone is EXPECTED for this age?",
    options: [
      "A) Engatinhar e sentar-se sem apoio.",
      "B) Sustentar a cabeça e sorrir socialmente.",
      "C) Pinça digital completa e falar 'ma-ma'.",
      "D) Andar com apoio e apontar para objetos."
    ],
    optionsEn: [
      "A) Crawling and sitting without support.",
      "B) Head support and social smiling.",
      "C) Complete pincer grasp and saying 'ma-ma'.",
      "D) Walking with support and pointing at objects."
    ],
    correctIndex: 1,
    explanation: "Aos 4 meses, espera-se que o lactente já apresente sustentação cefálica firme (controle cervical) e interaja através do sorriso social e emissão de sons guturais. Engatinhar ocorre geralmente aos 9 meses e pinça digital aos 10-12 meses.",
    explanationEn: "At 4 months, the infant is expected to have firm head support (cervical control) and interact through social smiling and guttural sounds. Crawling usually occurs at 9 months and pincer grasp at 10-12 months.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care"
  },
  {
    id: "q-12",
    question: "No período pós-operatório imediato, uma das complicações mais graves é a Hemorragia. Qual sinal clínico precoce pode indicar que o paciente está entrando em Choque Hipovolêmico por perda sanguínea?",
    questionEn: "In the immediate postoperative period, one of the most serious complications is Hemorrhage. Which early clinical sign may indicate the patient is entering Hypovolemic Shock due to blood loss?",
    options: [
      "A) Bradicardia e Hipertensão.",
      "B) Taquicardia e Agitação Psicomotora.",
      "C) Poliúria e Rubor Facial.",
      "D) Sonolência profunda e Hipotermia extrema."
    ],
    optionsEn: [
      "A) Bradycardia and Hypertension.",
      "B) Tachycardia and Psychomotor Agitation.",
      "C) Polyuria and Facial Flushing.",
      "D) Deep sleepiness and extreme Hypothermia."
    ],
    correctIndex: 1,
    explanation: "A taquicardia é um dos primeiros sinais compensatórios do organismo frente à diminuição do volume sistólico (débito cardíaco). A agitação psicomotora reflete a hipóxia cerebral incipiente por má perfusão.",
    explanationEn: "Tachycardia is one of the first compensatory signs of the body in response to decreased stroke volume (cardiac output). Psychomotor agitation reflects incipient cerebral hypoxia due to poor perfusion.",
    category: "Enfermagem Cirúrgica",
    categoryEn: "Surgical Nursing"
  },
  {
    id: "q-13",
    question: "As Redes de Atenção à Saúde (RAS) são organizadas para superar a fragmentação da assistência. O componente da RAS que funciona como o 'centro de comunicação' e o principal ponto de entrada do sistema é a:",
    questionEn: "Health Care Networks (RAS) are organized to overcome care fragmentation. The RAS component functioning as the 'communication center' and main entry point is:",
    options: [
      "A) Atenção Secundária (Ambulatórios Especializados).",
      "B) Atenção Primária à Saúde (APS).",
      "C) Atenção Terciária (Hospitais de Referência).",
      "D) Central de Regulação de Urgências."
    ],
    optionsEn: [
      "A) Secondary Care (Specialized Clinics).",
      "B) Primary Health Care (PHC).",
      "C) Tertiary Care (Reference Hospitals).",
      "D) Emergency Regulation Center."
    ],
    correctIndex: 1,
    explanation: "A Atenção Primária à Saúde (APS) é a base das RAS, sendo responsável pela coordenação do cuidado, ordenação da rede e por ser a porta de entrada preferencial e resolutiva do sistema de saúde.",
    explanationEn: "Primary Health Care (PHC) is the base of RAS, responsible for care coordination, network ordering, and being the preferred and resolutive entry point of the health system.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation"
  },
  {
    id: "q-14",
    question: "De acordo com o Código de Ética dos Profissionais de Enfermagem (Resolução COFEN 564/2017), é um DIREITO do enfermeiro:",
    questionEn: "According to the Nursing Professionals' Code of Ethics (COFEN Resolution 564/2017), it is a RIGHT of the nurse to:",
    options: [
      "A) Registrar informações parciais no prontuário para proteger o paciente.",
      "B) Recusar-se a executar atividades que não sejam de sua competência técnica, científica, ética e legal.",
      "C) Prescrever medicamentos sem a devida autorização em protocolos institucionais.",
      "D) Delegar funções exclusivas do enfermeiro para técnicos de enfermagem experientes."
    ],
    optionsEn: [
      "A) Recording partial information in records to protect the patient.",
      "B) Refusing to perform activities outside their technical, scientific, ethical, and legal competence.",
      "C) Prescribing medications without proper authorization in institutional protocols.",
      "D) Delegating exclusive nurse functions to experienced nursing technicians."
    ],
    correctIndex: 1,
    explanation: "O Art. 22 do Código de Ética estabelece como direito recusar-se a executar atividades que não ofereçam segurança ao profissional, à pessoa, à família e à coletividade, ou que não sejam de sua competência.",
    explanationEn: "Art. 22 of the Code of Ethics establishes the right to refuse activities that do not offer safety to the professional, person, family, or community, or that are not within their competence.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management"
  },
  {
    id: "q-15",
    question: "O Programa Nacional de Segurança do Paciente estabelece protocolos básicos. O protocolo que visa prevenir a ocorrência de erros na administração de medicamentos baseia-se na verificação de diversos 'certos'. Atualmente, fala-se comumente nos '9 certos'. Qual item NÃO faz parte desses 9 certos?",
    questionEn: "The National Patient Safety Program sets basic protocols. The medication error prevention protocol relies on several 'rights'. Currently, '9 rights' are commonly mentioned. Which item is NOT part of these 9 rights?",
    options: [
      "A) Paciente certo.",
      "B) Via certa.",
      "C) Custo certo.",
      "D) Hora certa."
    ],
    optionsEn: [
      "A) Right patient.",
      "B) Right route.",
      "C) Right cost.",
      "D) Right time."
    ],
    correctIndex: 2,
    explanation: "Os '9 certos' incluem: paciente, medicamento, via, hora, dose, registro, orientação, forma farmacêutica e resposta (monitoramento). O 'custo certo' não é um critério de segurança clínica do paciente nesse protocolo.",
    explanationEn: "The '9 rights' include: patient, medication, route, time, dose, documentation, education, dosage form, and response. 'Right cost' is not a clinical safety criterion in this protocol.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice"
  },
  {
    id: "q-16",
    question: "Na avaliação de uma ferida, o enfermeiro observa a presença de tecido de granulação. Qual é a característica visual desse tecido e qual a conduta indicada para o curativo?",
    questionEn: "In a wound assessment, the nurse observes granulation tissue. What is the visual characteristic of this tissue and the indicated dressing procedure?",
    options: [
      "A) Tecido amarelado e úmido; deve ser removido com desbridamento mecânico.",
      "B) Tecido vermelho brilhante, brilhante e granulado; deve ser protegido e mantido úmido.",
      "C) Tecido preto e seco; deve ser mantido seco com PVPI.",
      "D) Tecido esverdeado com odor fétido; deve ser tratado apenas com soro fisiológico morno."
    ],
    optionsEn: [
      "A) Yellowish and moist tissue; must be removed with mechanical debridement.",
      "B) Bright red, shiny, and granular tissue; must be protected and kept moist.",
      "C) Black and dry tissue; must be kept dry with PVPI.",
      "D) Greenish tissue with foul odor; must be treated only with warm saline."
    ],
    correctIndex: 1,
    explanation: "O tecido de granulação indica cicatrização saudável (proliferação). Ele é vermelho vivo, vascularizado e frágil. A conduta é proteger esse tecido (evitar traumas) e manter o meio úmido fisiológico para favorecer a epitelização.",
    explanationEn: "Granulation tissue indicates healthy healing. It is bright red, vascularized, and fragile. The procedure is to protect this tissue and maintain physiological moisture to favor epithelialization.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice"
  },
  {
    id: "q-4",
    question: "No atendimento ao paciente politraumatizado grave na sala de emergência, conforme as diretrizes do PHTLS e a atualização do mnemônico 'XABCDE', qual é a prioridade absoluta na conduta de enfermagem e qual intervenção deve ser realizada imediatamente?",
    questionEn: "During the management of a severe polytrauma patient in the emergency room, according to PHTLS guidelines and the updated 'XABCDE' mnemonic, what is the absolute priority in nursing care and what intervention should be performed immediately?",
    options: [
      "Garantir a permeabilidade da via aérea (A) com controle da coluna cervical.",
      "Controlar hemorragias externas graves e exasanguinantes (X) por meio de compressão direta ou uso imediato de torniquete.",
      "Avaliar o nível de consciência através da escala de Glasgow-P (D) para afastar lesão cerebral.",
      "Instalar oxigenoterapia de alto fluxo e monitorar a oximetria de pulso (B)."
    ],
    optionsEn: [
      "Ensure airway patency (A) with cervical spine stabilization.",
      "Control severe, exsanguinating external hemorrhage (X) using direct pressure or immediate tourniquet application.",
      "Assess neurological status using the Glasgow-P scale (D) to rule out brain injury.",
      "Administer high-flow oxygen therapy and monitor pulse oximetry (B)."
    ],
    correctIndex: 1,
    explanation: "A abordagem atualizada do trauma grave adota o mnemônico XABCDE. O 'X' antecede a via aérea e refere-se ao controle imediato de hemorragia externa exasanguinante. O sangramento maciço pode levar ao choque hipovolêmico letal em poucos minutos, antes mesmo do comprometimento da via aérea.",
    explanationEn: "The updated severe trauma approach uses the XABCDE mnemonic. The 'X' precedes the airway and refers to immediate control of exsanguinating external hemorrhage. Massive bleeding can lead to fatal hypovolemic shock in minutes, even before airway compromise.",
    category: "Urgência e UTI",
    categoryEn: "Emergency & ICU"
  },
  {
    id: "q-5",
    question: "O Programa Nacional de Segurança do Paciente (PNSP) institui protocolos básicos para minimizar riscos nos serviços de saúde. Ao administrar um medicamento de alta vigilância, como um bloqueador neuromuscular, o enfermeiro deve cumprir rigorosamente as metas de segurança. Qual alternativa apresenta a relação correta de condutas de enfermagem de acordo com os protocolos estabelecidos?",
    questionEn: "The National Patient Safety Program (PNSP) establishes basic protocols to minimize risks in health services. When administering a high-alert medication, such as a neuromuscular blocker, the nurse must strictly follow safety goals. Which alternative shows the correct relationship of nursing actions according to established protocols?",
    options: [
      "Confirmar a identidade do paciente com pelo menos dois identificadores (ex: nome completo e data de nascimento), realizar a dupla checagem na preparação e na administração e proibir o reuso de agulhas conforme a NR 32.",
      "Apenas conferir o número do leito antes de injetar, pois o leito é o identificador principal e infalível de segurança.",
      "Administrar o fármaco sem diluição para acelerar o efeito na via aérea e registrar no caderno clínico após 24 horas.",
      "Delegar a administração ao estagiário sem supervisão direta para incentivar o aprendizado prático autônomo."
    ],
    optionsEn: [
      "Confirm patient identity with at least two identifiers (e.g., full name and date of birth), perform double-checking during preparation and administration, and prohibit needle reuse according to NR 32.",
      "Only check the bed number before injecting, as the bed is the primary and foolproof identifier for safety.",
      "Administer the drug undiluted to accelerate the effect on the airway and record it in the clinical notes after 24 hours.",
      "Delegate the administration to the intern without direct supervision to encourage autonomous practical learning."
    ],
    correctIndex: 0,
    explanation: "A Meta 1 (Identificação Correta do Paciente) exige pelo menos dois identificadores exclusivos (nunca o número do leito). A Meta 3 (Segurança na Prescrição e Administração) exige dupla checagem para medicamentos de alta vigilância. E a NR 32 proíbe o reencape de agulhas para prevenir acidentes ocupacionais com perfurocortantes.",
    explanationEn: "Goal 1 (Patient Identification) requires at least two unique identifiers (never the bed number). Goal 3 (Safety in Prescribing and Administration) requires double-checking for high-alert medications. And NR 32 prohibits needle recapping to prevent occupational sharps accidents.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice"
  },
  {
    id: "enare-2024-q1",
    question: "(ENARE 2024) Segundo o Calendário Nacional de Imunização do Ministério da Saúde para gestantes, qual das seguintes vacinas é recomendada a partir da 20ª semana de gestação a cada nova gravidez para prevenir o tétano neonatal e a coqueluche no recém-nascido?",
    questionEn: "(ENARE 2024) According to the National Immunization Schedule of the Brazilian Ministry of Health for pregnant women, which of the following vaccines is recommended starting from the 20th week of pregnancy in every gestation to prevent neonatal tetanus and whooping cough (pertussis) in the newborn?",
    options: [
      "Vacina dTpa (Difteria, Tétano e Coqueluche acelular).",
      "Vacina Tríplice Viral (Sarampo, Caxumba e Rubéola).",
      "Vacina BCG.",
      "Vacina contra HPV."
    ],
    optionsEn: [
      "Tdap vaccine (Tetanus, Diphtheria, and acellular Pertussis).",
      "MMR vaccine (Measles, Mumps, and Rubella).",
      "BCG vaccine.",
      "HPV vaccine."
    ],
    correctIndex: 0,
    explanation: "A vacina dTpa (Difteria, Tétano e Coqueluche acelular) é indicada para gestantes a partir da 20ª semana de gestação, devendo ser administrada a cada nova gestação com o objetivo principal de transferir anticorpos passivamente para o feto, protegendo o recém-nascido da coqueluche e do tétano neonatal.",
    explanationEn: "The Tdap vaccine is recommended for pregnant women starting from the 20th gestational week, and must be administered in every new pregnancy to transfer passive maternal antibodies to the fetus, protecting the newborn against whooping cough and neonatal tetanus.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2023-q1",
    question: "(ENARE 2023) A Resolução COFEN nº 736/2023 atualizou as diretrizes para a Sistematização da Assistência de Enfermagem (SAE) e o Processo de Enfermagem (PE). Com base nessa resolução, o Processo de Enfermagem é composto por quantas etapas integradas e qual delas se refere ao julgamento clínico das respostas da pessoa?",
    questionEn: "(ENARE 2023) COFEN Resolution No. 736/2023 updated the guidelines for the Systematization of Nursing Care (SAE) and the Nursing Process (PE). Based on this resolution, the Nursing Process is comprised of how many integrated stages, and which stage represents the clinical judgment regarding the patient's health responses?",
    options: [
      "3 etapas interdependentes; Diagnóstico de Enfermagem.",
      "5 etapas interdependentes; Diagnóstico de Enfermagem.",
      "6 etapas interdependentes; Planejamento de Enfermagem.",
      "5 etapas interdependentes; Implementação."
    ],
    optionsEn: [
      "3 stages; Nursing Diagnosis.",
      "5 stages; Nursing Diagnosis.",
      "6 stages; Nursing Planning.",
      "5 stages; Implementation."
    ],
    correctIndex: 1,
    explanation: "A Resolução COFEN nº 736/2023 reafirma que o Processo de Enfermagem é composto por 5 etapas interdependentes: 1. Avaliação de Enfermagem (Histórico), 2. Diagnóstico de Enfermagem (julgamento clínico sobre as respostas de saúde), 3. Planejamento de Enfermagem, 4. Implementação de Enfermagem, e 5. Evolução de Enfermagem.",
    explanationEn: "COFEN Resolution No. 736/2023 reaffirms that the Nursing Process consists of 5 interdependent stages: 1. Nursing Assessment (History), 2. Nursing Diagnosis (clinical judgment of health responses), 3. Nursing Planning, 4. Nursing Implementation, and 5. Nursing Evaluation.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2022-q1",
    question: "(ENARE 2022) No que se refere ao armazenamento e conservação de imunobiológicos na sala de vacina ao nível local (unidade de saúde), qual é a faixa de temperatura recomendada para as vacinas de rotina e qual deve ser a conduta diante de uma variação brusca fora desses limites?",
    questionEn: "(ENARE 2022) Regarding the storage and preservation of immunobiologicals at the local clinic level, what is the recommended temperature range for routine vaccines and what action should be taken in case of an abrupt temperature excursion?",
    options: [
      "De -2ºC a +2ºC; descartar imediatamente todas as doses sem notificação.",
      "De 0ºC a +10ºC; manter em geladeira doméstica comum sem controle.",
      "De +2ºC a +8ºC (ideal +5ºC); notificar a ocorrência e aguardar avaliação técnica da instância superior mantendo-as sob temperatura correta.",
      "De +10ºC a +15ºC; congelar as vacinas imediatamente no freezer."
    ],
    optionsEn: [
      "Between -2ºC and +2ºC; discard all doses immediately without reporting.",
      "Between 0ºC and +10ºC; keep in a standard home refrigerator without monitoring.",
      "Between +2ºC and +8ºC (ideal +5ºC); report the incident and wait for higher-level technical evaluation while maintaining correct storage temp.",
      "Between +10ºC and +15ºC; freeze the vaccines immediately in the freezer."
    ],
    correctIndex: 2,
    explanation: "No nível local (unidades de saúde), todas as vacinas de rotina devem ser armazenadas em temperatura positiva entre +2ºC e +8ºC, sendo a temperatura ideal de +5ºC. Caso ocorra alteração térmica fora dessa faixa, o enfermeiro deve restabelecer a temperatura correta, separar o lote e notificar a ocorrência para a área de Vigilância Epidemiológica/Imunizações para análise técnica de estabilidade.",
    explanationEn: "At local units, routine vaccines must be stored between +2ºC and +8ºC (ideal +5ºC). In case of temperature excursions, the nurse must restore correct temp, isolate the batch, and report the occurrence to the epidemiological/immunization team to evaluate the stability.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2021-q1",
    question: "(ENARE 2021) Conforme os critérios de classificação das Lesões por Pressão (LPP) atualizados pelo National Pressure Injury Advisory Panel (NPIAP), a perda parcial da espessura da pele com exposição da derme, apresentando-se como um leito de ferida rosa ou vermelho, úmido, ou como uma bolha intacta ou aberta, caracteriza qual estágio de lesão?",
    questionEn: "(ENARE 2021) According to the classification criteria of Pressure Injuries updated by the National Pressure Injury Advisory Panel (NPIAP), partial-thickness skin loss with exposed dermis, presenting as a pink or red, moist wound bed, or as an intact or ruptured serum-filled blister, characterizes which injury stage?",
    options: [
      "Estágio 1 (eritema que não empalidece).",
      "Estágio 2 (exposição da derme).",
      "Estágio 3 (perda total da espessura com gordura visível).",
      "Estágio 4 (perda total com exposição de osso, músculo ou tendão)."
    ],
    optionsEn: [
      "Stage 1.",
      "Stage 2.",
      "Stage 3.",
      "Stage 4."
    ],
    correctIndex: 1,
    explanation: "A lesão por pressão de Estágio 2 é caracterizada por perda de pele em sua espessura parcial com exposição da derme. O leito da ferida é viável, rosa ou vermelho, úmido, e também pode apresentar-se como uma bolha intacta ou aberta (rompida).",
    explanationEn: "Stage 2 pressure injury is defined as partial-thickness loss of skin with exposed dermis. The wound bed is viable, pink or red, moist, and may also present as an intact or ruptured serum-filled blister.",
    category: "Prática Clínica",
    categoryEn: "Clinical Practice",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2020-q1",
    question: "(ENARE 2020) A Lei Orgânica da Saúde nº 8.080/1990 estabelece os princípios e diretrizes do Sistema Único de Saúde (SUS). O princípio doutrinário que garante a prestação da assistência à saúde sem preconceitos ou privilégios de qualquer espécie, tratando de forma desigual as desigualdades para promover a justiça social, corresponde a:",
    questionEn: "(ENARE 2020) Organic Health Law No. 8.080/1990 establishes the principles and guidelines of the Unified Health System (SUS). The doctrinal principle that guarantees healthcare provision without prejudice or privilege, treating unequal situations unequally to promote social justice, corresponds to:",
    options: [
      "Universalidade de acesso.",
      "Equidade na atenção.",
      "Integralidade de assistência.",
      "Descentralização político-administrativa."
    ],
    optionsEn: [
      "Universality of access.",
      "Equity in care.",
      "Integrality of care.",
      "Political-administrative decentralization."
    ],
    correctIndex: 1,
    explanation: "A Equidade é o princípio que visa diminuir as desigualdades de saúde entre grupos sociais, distribuindo os recursos de forma justa para quem mais necessita (tratar desigualmente os desiguais para alcançar a justiça distributiva).",
    explanationEn: "Equity is the SUS principle aimed at reducing health disparities by allocating resources fairly to those in greatest need, treating unequals unequally to achieve social justice.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2024-q2",
    question: "(ENARE 2024) Paciente do sexo masculino, 62 anos, com suspeita de Acidente Vascular Cerebral (AVC) agudo. Durante a triagem inicial com a Escala de Cincinnati, o enfermeiro avalia três sinais clínicos específicos. Quais são esses três componentes avaliados para detecção precoce do AVC?",
    questionEn: "(ENARE 2024) A 62-year-old male patient presents with suspected acute stroke. During initial triage using the Cincinnati Prehospital Stroke Scale, the nurse evaluates three specific clinical signs. What are the three components evaluated to detect a stroke?",
    options: [
      "Rigidez de nuca, estrabismo e alteração na fala.",
      "Queda facial (paralisia), fraqueza nos braços (deriva) e fala anormal (disartria).",
      "Paresia de membros inferiores, cefaleia súbita e vertigem.",
      "Reatividade pupilar unilateral, sialorreia e hipotensão postural."
    ],
    optionsEn: [
      "Nuchal rigidity, strabismus, and speech difficulty.",
      "Facial droop, arm drift, and abnormal speech.",
      "Lower limb paresis, sudden headache, and vertigo.",
      "Unilateral pupillary reactivity, sialorrhea, and postural hypotension."
    ],
    correctIndex: 1,
    explanation: "A Escala de Cincinnati avalia três sinais clínicos simples e de alta sensibilidade para detecção precoce de AVC: 1) Queda facial (pedir para sorrir e ver se um lado não mexe), 2) Queda do braço (pedir para fechar os olhos e estender os braços por 10 segundos), e 3) Fala anormal (pedir para repetir uma frase e avaliar se há fala arrastada ou uso de palavras incorretas).",
    explanationEn: "The Cincinnati Prehospital Stroke Scale assesses three simple clinical signs: 1) Facial droop (have patient show teeth or smile), 2) Arm drift (have patient close eyes and hold both arms straight out for 10 seconds), and 3) Abnormal speech (have patient say 'you can't teach an old dog new tricks').",
    category: "Avaliação Neurológica",
    categoryEn: "Neurological Assessment",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2023-q2",
    question: "(ENARE 2023) O Decreto Presidencial nº 7.508/2011 regulamenta a Lei nº 8.080/1990 para dispor sobre a organização do SUS. De acordo com este decreto, o espaço geográfico contínuo constituído por agrupamentos de Municípios limítrofes, delimitado a partir de identidades culturais, econômicas e sociais e de redes de comunicação e infraestrutura de transportes compartilhados, é definido como:",
    questionEn: "(ENARE 2023) Presidential Decree No. 7.508/2011 regulates Law No. 8.080/1990 to provide for the organization of SUS. According to this decree, the continuous geographic space consisting of groups of bordering Municipalities, delimited by cultural, economic, and social identities and transport infrastructure, is defined as:",
    options: [
      "Distrito Sanitário Especial.",
      "Região de Saúde.",
      "Rede de Atenção à Saúde (RAS).",
      "Consórcio Intermunicipal de Saúde."
    ],
    optionsEn: [
      "Special Sanitary District.",
      "Health Region.",
      "Healthcare Network (RAS).",
      "Intermunicipal Health Consortium."
    ],
    correctIndex: 1,
    explanation: "Conforme o Decreto 7.508/2011, Artigo 2º, Inciso I, Região de Saúde é o espaço geográfico contínuo constituído por agrupamentos de Municípios limítrofes, delimitado a partir de identidades culturais, econômicas e sociais e de redes de comunicação e infraestrutura de transportes compartilhados, com a finalidade de integrar a organização, o planejamento e a execução de ações e serviços de saúde.",
    explanationEn: "According to Decree 7.508/2011, Article 2, Subsection I, a Health Region is a continuous geographic space composed of groupings of bordering municipalities, delimited by common cultural, economic, and social identities and shared transportation infrastructure, aimed at integrating health planning and actions.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2022-q2",
    question: "(ENARE 2022) Uma gestante comparece à primeira consulta de pré-natal na Unidade Básica de Saúde. Ela informa que o primeiro dia de sua última menstruação (DUM) foi em 10 de maio de 2022. Utilizando a Regra de Naegele, qual é a data provável do parto (DPP) estimada para esta paciente?",
    questionEn: "(ENARE 2022) A pregnant woman attends her first prenatal care visit at the primary care unit. She reports that the first day of her last menstrual period (LMP) was on May 10, 2022. Using Naegele's Rule, what is the estimated due date (EDD) for this patient?",
    options: [
      "17 de Fevereiro de 2023.",
      "17 de Janeiro de 2023.",
      "03 de Março de 2023.",
      "24 de Fevereiro de 2023."
    ],
    optionsEn: [
      "February 17, 2023.",
      "January 17, 2023.",
      "March 3, 2023.",
      "February 24, 2023."
    ],
    correctIndex: 0,
    explanation: "A Regra de Naegele calcula a DPP somando 7 dias ao primeiro dia da DUM e subtraindo 3 meses ao mês da DUM (ou somando 9 meses se o mês for de janeiro a março). No caso: DUM = 10/05/2022. Dia: 10 + 7 = 17. Mês: Maio (05) - 3 meses = Fevereiro (02). Ano: 2022 + 1 = 2023. Logo, a DPP é 17 de fevereiro de 2023.",
    explanationEn: "Naegele's rule calculates the estimated due date by adding 7 days to the first day of the LMP, and subtracting 3 months from the LMP month. LMP = May 10, 2022. Day: 10 + 7 = 17. Month: May (05) - 3 months = February (02). Year: 2022 + 1 = 2023. Thus, EDD is February 17, 2023.",
    category: "Saúde da Mulher",
    categoryEn: "Women's Health",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2021-q2",
    question: "(ENARE 2021) Durante o atendimento a uma parada cardiorrespiratória (PCR) em ambiente intra-hospitalar em um paciente adulto, de acordo com as Diretrizes da American Heart Association (AHA) vigentes, qual deve ser a frequência recomendada de compressões torácicas por minuto e a profundidade correta de compressão?",
    questionEn: "(ENARE 2021) During in-hospital cardiopulmonary resuscitation (CPR) in an adult patient, according to the current American Heart Association (AHA) guidelines, what is the recommended chest compression rate per minute and depth?",
    options: [
      "80 a 100 compressões/min; profundidade de no mínimo 7 cm.",
      "100 a 120 compressões/min; profundidade de pelo menos 5 cm (sem exceder 6 cm).",
      "Exatamente 120 compressões/min; profundidade livre evitando compressão excessiva.",
      "120 a 140 compressões/min; profundidade de no máximo 4 cm."
    ],
    optionsEn: [
      "80 to 100 compressions/min; depth of at least 7 cm.",
      "100 to 120 compressions/min; depth of at least 5 cm (not exceeding 6 cm).",
      "Exactly 120 compressions/min; variable depth avoiding excessive compression.",
      "120 to 140 compressions/min; depth of at most 4 cm."
    ],
    correctIndex: 1,
    explanation: "Conforme as Diretrizes da AHA para RCP de alta qualidade em adultos, a frequência de compressões torácicas deve ser de 100 a 120 compressões por minuto, e a profundidade de compressão deve ser de pelo menos 2 polegadas (5 cm), evitando ultrapassar 2,4 polegadas (6 cm), permitindo o retorno completo do tórax após cada compressão.",
    explanationEn: "According to AHA guidelines for high-quality adult CPR, chest compressions must be performed at a rate of 100 to 120 compressions per minute, and compression depth must be at least 2 inches (5 cm) but not exceed 2.4 inches (6 cm), with complete chest recoil.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency Care",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2020-q2",
    question: "(ENARE 2020) Prescrição de Enfermagem solicita a infusão contínua de 500 mL de Soro Fisiológico 0,9% para correr em 8 horas na enfermaria de clínica médica. Para cumprir rigorosamente essa orientação por gotejamento gravitacional, qual deve ser o cálculo de fluxo estabelecido em gotas por minuto?",
    questionEn: "(ENARE 2020) A nursing prescription requires the infusion of 500 mL of 0.9% Normal Saline over 8 hours using gravity drip. To strictly follow this instruction, what is the required flow rate in drops per minute?",
    options: [
      "Aproximadamente 14 gotas/min.",
      "Aproximadamente 21 gotas/min.",
      "Aproximadamente 28 gotas/min.",
      "Aproximadamente 63 gotas/min."
    ],
    optionsEn: [
      "Approximately 14 drops/min.",
      "Approximately 21 drops/min.",
      "Approximately 28 drops/min.",
      "Approximately 63 drops/min."
    ],
    correctIndex: 1,
    explanation: "A fórmula para cálculo de gotas por minuto é: Gotas/min = Volume (mL) / (Tempo (horas) * 3). Substituindo os valores: Gotas/min = 500 / (8 * 3) = 500 / 24 = 20,83. Arredondando para o número inteiro mais próximo, temos aproximadamente 21 gotas por minuto.",
    explanationEn: "The formula for calculating gravity drip rate in drops per minute is: Drops/min = Volume (mL) / (Time (hours) * 3). Thus: Drops/min = 500 / (8 * 3) = 500 / 24 = 20.83. Rounding to the nearest whole number yields approximately 21 drops per minute.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2024-q3",
    question: "(ENARE 2024) De acordo com a Lei nº 7.498/1986, que regulamenta o exercício da Enfermagem no Brasil, qual das seguintes alternativas apresenta uma atividade que é PRIVATIVA do enfermeiro?",
    questionEn: "(ENARE 2024) According to Law No. 7.498/1986, which regulates the practice of Nursing in Brazil, which of the following is an activity PRIVATE to the registered nurse?",
    options: [
      "Prescrever medicamentos previamente estabelecidos em programas de saúde pública.",
      "Realizar consulta de enfermagem e prescrever a assistência de enfermagem.",
      "Executar curativos simples e de média complexidade em ambiente ambulatorial.",
      "Administrar quimioterápicos sob supervisão médica direta."
    ],
    optionsEn: [
      "Prescribe medications previously established in public health programs.",
      "Conduct nursing consultations and prescribe nursing care.",
      "Execute simple and medium complexity wound dressings in an outpatient setting.",
      "Administer chemotherapy agents under direct medical supervision."
    ],
    correctIndex: 1,
    explanation: "A consulta de enfermagem, o diagnóstico de enfermagem e a prescrição da assistência de enfermagem são atividades de competência privativa do enfermeiro (Artigo 11, Inciso I, alíneas 'i' e 'j' da Lei nº 7.498/1986). Prescrever medicamentos sob protocolos é permitido ao enfermeiro, mas não de forma privativa (outros profissionais também podem participar).",
    explanationEn: "Conducting nursing consultations and prescribing nursing care are private activities of the registered nurse according to Article 11, I, of Law No. 7.498/1986. Prescribing medicines under protocols is allowed but is not exclusive (private) to the nurse.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2024-q4",
    question: "(ENARE 2024) No âmbito do Atendimento Pré-Hospitalar (APH) ao trauma utilizando o protocolo atualizado XABCDE, qual é a prioridade absoluta de intervenção definida pela letra 'X'?",
    questionEn: "(ENARE 2024) In pre-hospital trauma care using the updated XABCDE protocol, what is the absolute priority of intervention defined by the letter 'X'?",
    options: [
      "Controle de vias aéreas com estabilização da coluna cervical.",
      "Controle de hemorragia externa exanguinante.",
      "Avaliação neurológica através da Escala de Coma de Glasgow.",
      "Exposição total do paciente com prevenção de hipotermia."
    ],
    optionsEn: [
      "Airway control with cervical spine stabilization.",
      "Exsanguinating external hemorrhage control.",
      "Neurological evaluation using the Glasgow Coma Scale.",
      "Full exposure of the patient with hypothermia prevention."
    ],
    correctIndex: 1,
    explanation: "No protocolo XABCDE, a letra 'X' representa a hemorragia exanguinante (sangramento externo severo e massivo). O controle desse sangramento tem prioridade absoluta e deve ser feito imediatamente, com torniquetes ou curativos compressivos, antes mesmo de abordar as vias aéreas (letra A).",
    explanationEn: "In the XABCDE protocol, 'X' stands for exsanguinating external hemorrhage. Controlling severe external bleeding has absolute priority and must be initiated immediately, even before airway assessment (A).",
    category: "Urgência e Emergência",
    categoryEn: "Urgency Care",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2023-q3",
    question: "(ENARE 2023) Conforme as diretrizes de Segurança do Paciente estabelecidas pela ANVISA, qual é o prazo máximo recomendado para a notificação de eventos adversos graves que resultaram em óbito no sistema de vigilância NOTIVISA?",
    questionEn: "(ENARE 2023) According to patient safety guidelines established by ANVISA, what is the recommended maximum deadline to report serious adverse events resulting in death to the NOTIVISA system?",
    options: [
      "Até 24 horas a partir da ocorrência do óbito.",
      "Até 72 horas a partir da ocorrência do óbito.",
      "Até 7 dias úteis após o encerramento da investigação interna.",
      "Até 30 dias corridos a partir da data do evento."
    ],
    optionsEn: [
      "Within 24 hours of the occurrence of death.",
      "Within 72 hours of the occurrence of death.",
      "Within 7 business days after the internal investigation completes.",
      "Within 30 calendar days of the event date."
    ],
    correctIndex: 1,
    explanation: "Conforme a regulamentação do Programa Nacional de Segurança do Paciente da ANVISA, os eventos adversos graves que resultarem em óbito do paciente devem ser notificados em no máximo 72 horas a partir da ocorrência.",
    explanationEn: "According to ANVISA's National Patient Safety Program, serious adverse events that result in the death of a patient must be reported within a maximum of 72 hours of the event.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2023-q4",
    question: "(ENARE 2023) Durante o exame físico de rotina de um recém-nascido em alojamento conjunto, o enfermeiro realiza as manobras de Ortolani e Barlow. Essas técnicas propedêuticas têm por finalidade o rastreamento precoce de qual alteração clínica?",
    questionEn: "(ENARE 2023) During the routine physical exam of a newborn in rooming-in, the nurse performs the Ortolani and Barlow maneuvers. These propedeutic techniques are aimed at early screening for which clinical alteration?",
    options: [
      "Displasia de desenvolvimento do quadril.",
      "Pé torto congênito bilateral.",
      "Paralisia cerebral espástica.",
      "Ausência de reflexo de preensão plantar."
    ],
    optionsEn: [
      "Developmental dysplasia of the hip.",
      "Bilateral congenital clubfoot.",
      "Spastic cerebral palsy.",
      "Absence of the plantar grasp reflex."
    ],
    correctIndex: 0,
    explanation: "As manobras de Barlow e Ortolani são testes físicos realizados para identificar a instabilidade do quadril e diagnosticar precocemente a Displasia de Desenvolvimento do Quadril (DDQ) no recém-nascido.",
    explanationEn: "The Barlow and Ortolani maneuvers are clinical physical tests performed to detect hip instability and screen for Developmental Dysplasia of the Hip (DDH) in newborns.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2022-q3",
    question: "(ENARE 2022) O Acolhimento com Classificação de Risco é amplamente utilizado nas portas de urgência do SUS. De acordo com o Protocolo de Manchester, o paciente triado com a classificação AMARELA (Urgente) deve receber atendimento médico em qual tempo de espera máximo recomendado?",
    questionEn: "(ENARE 2022) Risk Classification and Triage is widely used in SUS emergency rooms. According to the Manchester Triage System, a patient triaged as YELLOW (Urgent) should receive medical attention within what maximum recommended waiting time?",
    options: [
      "Atendimento imediato (0 minutos).",
      "Até 10 minutos.",
      "Até 60 minutos.",
      "Até 120 minutos."
    ],
    optionsEn: [
      "Immediate care (0 minutes).",
      "Up to 10 minutes.",
      "Up to 60 minutes.",
      "Up to 120 minutes."
    ],
    correctIndex: 2,
    explanation: "Pelo Protocolo de Manchester, os limites máximos de tempo para atendimento são: Vermelho (emergência - imediato/0 min), Laranja (muito urgente - 10 min), Amarelo (urgente - 60 min), Verde (pouco urgente - 120 min) e Azul (não urgente - 240 min).",
    explanationEn: "Under the Manchester Triage Protocol, maximum waiting times are: Red (emergency - immediate/0 min), Orange (very urgent - 10 min), Yellow (urgent - 60 min), Green (standard - 120 min), and Blue (non-urgent - 240 min).",
    category: "Urgência e Emergência",
    categoryEn: "Urgency Care",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2022-q4",
    question: "(ENARE 2022) O médico prescreveu a administração parenteral de 150 mg de Amicacina a um paciente. Na farmácia hospitalar, estão disponíveis ampolas de Amicacina de 500 mg diluídas em 2 mL. Qual volume em mililitros (mL) o enfermeiro deve aspirar para cumprir rigorosamente a prescrição?",
    questionEn: "(ENARE 2022) A physician prescribed the parenteral administration of 150 mg of Amikacin. The hospital pharmacy provides 500 mg/2 mL ampoules. What volume in milliliters (mL) must the nurse draw to fulfill the prescription?",
    options: [
      "0,3 mL",
      "0,6 mL",
      "0,8 mL",
      "1,2 mL"
    ],
    optionsEn: [
      "0.3 mL",
      "0.6 mL",
      "0.8 mL",
      "1.2 mL"
    ],
    correctIndex: 1,
    explanation: "Aplicando a regra de três simples: 500 mg -> 2 mL | 150 mg -> X mL. Multiplicando cruzado: 500 * X = 150 * 2 => X = 300 / 500 => X = 0,6 mL.",
    explanationEn: "Applying a simple rule of three: 500 mg -> 2 mL | 150 mg -> X mL. Cross-multiplying: 500 * X = 150 * 2 => X = 300 / 500 => X = 0.6 mL.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2021-q3",
    question: "(ENARE 2021) Segundo os termos estabelecidos na Lei Federal nº 8.142/1990, a participação da comunidade na gestão do Sistema Único de Saúde (SUS) ocorre de forma institucional por meio de quais instâncias colegiadas?",
    questionEn: "(ENARE 2021) According to the terms of Federal Law No. 8.142/1990, community participation in the management of the Unified Health System (SUS) occurs through which collegiate bodies?",
    options: [
      "Conselhos de Saúde e Conferências de Saúde.",
      "Colegiados de Gestores Regionais e Ouvidorias Ativas.",
      "Sindicatos da Saúde e Consórcios Intermunicipais.",
      "Conselhos Consultivos do Ministério da Saúde e Secretarias de Saúde."
    ],
    optionsEn: [
      "Health Councils and Health Conferences.",
      "Regional Manager Collegiate and Active Ombudsoffices.",
      "Health Labor Unions and Intermunicipal Partnerships.",
      "Consultative Councils of the Ministry of Health and Health Secretariats."
    ],
    correctIndex: 0,
    explanation: "A Lei nº 8.142/1990 regulamenta a participação social no SUS e cria duas instâncias permanentes de controle e participação: as Conferências de Saúde (que se reúnem a cada quatro anos) e os Conselhos de Saúde (deliberativos, permanentes e com composição paritária).",
    explanationEn: "Law No. 8.142/1990 defines two major collegiate bodies for community participation: Health Conferences (meeting every four years) and Health Councils (permanent, deliberative, and quadripartite).",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2021-q4",
    question: "(ENARE 2021) Um paciente adulto admitido na UTI com diagnóstico de insuficiência renal crônica apresenta hipercalemia severa (níveis de potássio sérico de 7,2 mEq/L). Qual das seguintes alternativas apresenta a conduta imediata indicada para estabilização elétrica do miocárdio?",
    questionEn: "(ENARE 2021) An adult patient admitted to the ICU with chronic kidney disease presents with severe hyperkalemia (serum potassium level of 7.2 mEq/L). Which of the following is the immediate action indicated for myocardial electrical stabilization?",
    options: [
      "Administração endovenosa lenta de Gluconato de Cálcio 10%.",
      "Infusão contínua rápida de Soro Glicosado 5%.",
      "Administração oral de Poliestirenossulfonato de Cálcio (Sorcal) diluído em água.",
      "Monitorização cardíaca contínua isolada, restringindo ingestão de água."
    ],
    optionsEn: [
      "Slow intravenous administration of 10% Calcium Gluconate.",
      "Rapid continuous infusion of 5% Dextrose.",
      "Oral administration of Calcium Polystyrene Sulfonate (Sorcal) dissolved in water.",
      "Continuous cardiac monitoring alone, restricting water intake."
    ],
    correctIndex: 0,
    explanation: "O Gluconato de Cálcio a 10% endovenoso é o agente terapêutico prioritário para reverter as alterações de condução elétrica miocárdica induzidas pela hipercalemia severa, agindo na estabilização de membrana do cardiomiócito (embora não reduza os níveis plasmáticos de potássio).",
    explanationEn: "Intravenous 10% Calcium Gluconate is the drug of choice to stabilize the myocardial cell membrane in severe hyperkalemia, protecting against lethal arrhythmias.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency Care",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2020-q3",
    question: "(ENARE 2020) O enfermeiro realiza registros diários de enfermagem no prontuário eletrônico do paciente para formalizar a assistência prestada. De acordo com as diretrizes do COFEN para documentação, esses registros devem conter obrigatoriamente:",
    questionEn: "(ENARE 2020) The nurse performs daily nursing records in the patient's electronic health record to formalize the care provided. According to COFEN guidelines, these records must contain:",
    options: [
      "Data, horário, assinatura profissional acompanhada do número de inscrição do COREN correspondente, redigidos de forma objetiva, cronológica e sem abreviações não oficiais.",
      "Opiniões pessoais sobre as atitudes familiares do paciente e registros parciais a lápis para posteriores correções.",
      "Obrigatoriamente apenas o carimbo físico, sendo proibidas assinaturas digitais ou eletrônicas em hospitais do SUS.",
      "Registro apenas das intercorrências negativas, omitindo cuidados de rotina para economizar tempo."
    ],
    optionsEn: [
      "Date, time, professional signature with the corresponding COREN registration number, written in an objective, chronological order, without unofficial abbreviations.",
      "Personal opinions about the patient's family members and partial pencil entries to allow later corrections.",
      "Compulsorily only a physical rubber stamp, digital signatures being prohibited in SUS hospitals.",
      "Only recording negative complications and omitting routine care to save time."
    ],
    correctIndex: 0,
    explanation: "De acordo com o Código de Ética e as resoluções de prontuário do COFEN, os registros devem ser objetivos, conter data, hora, assinatura e inscrição no COREN correspondente, de forma clara e legível, sem emendas, rasuras ou espaço em branco.",
    explanationEn: "According to COFEN's professional standards, all nursing records must be chronological, clear, without erasures, and signed with the professional's name and registration number.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2020-q4",
    question: "(ENARE 2020) Dentre os princípios finalísticos ou doutrinários fundamentais do SUS estabelecidos na Constituição Federal e regulados pela Lei nº 8.080/1990, qual conceito define corretamente o princípio da Integralidade?",
    questionEn: "(ENARE 2020) Among the fundamental doctrinal principles of SUS in the Federal Constitution and Law No. 8.080/1990, which concept correctly defines the principle of Integrality (comprehensive care)?",
    options: [
      "Conjunto articulado e contínuo de ações e serviços preventivos e curativos, individuais e coletivos, exigidos para cada caso em todos os níveis de complexidade do sistema.",
      "Garantia de acesso universal e gratuito apenas para indivíduos cadastrados em programas federais de transferência de renda.",
      "Descentralização político-administrativa das ações de saúde, com direção única em cada esfera de governo.",
      "Atendimento hospitalar de alta complexidade especializado em centros metropolitanos conveniados com redes multinacionais."
    ],
    optionsEn: [
      "An articulated and continuous set of preventive and curative actions and services, individual and collective, required for each patient across all levels of system complexity.",
      "Guarantee of universal and free access restricted to citizens registered in federal cash transfer programs.",
      "Political-administrative decentralization of health actions, with a single manager in each sphere of government.",
      "High-complexity tertiary hospital care specialized in metropolitan centers partnered with multinational networks."
    ],
    correctIndex: 0,
    explanation: "Integralidade (Lei nº 8.080/1990, Artigo 7º, Inciso II) refere-se ao atendimento que considera a pessoa como um todo, abrangendo ações de promoção, prevenção, tratamento e reabilitação, de forma contínua e integrada em todos os níveis de complexidade.",
    explanationEn: "Integrality is a core SUS principle which states that the healthcare system must treat the individual as a whole, integrating prevention and cure, individual and collective, in all complexity tiers.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2024-q5",
    question: "(ENARE 2024) Segundo o Calendário de Vacinação da Criança do Ministério da Saúde, a vacina Pentavalente deve ser administrada em quais idades e protege contra quais patologias?",
    questionEn: "(ENARE 2024) According to the Child Immunization Schedule of the Ministry of Health, at what ages should the Pentavalent vaccine be administered and which pathogens does it protect against?",
    options: [
      "Aos 2, 4 e 6 meses; protege contra difteria, tétano, coqueluche, hepatite B e Haemophilus influenzae b.",
      "Aos 3, 5 e 7 meses; protege contra tuberculose, difteria, tétano, sarampo e rubéola.",
      "Aos 2 e 4 meses; protege contra rotavírus, meningite C, hepatite B, coqueluche e poliomielite.",
      "Ao nascer, 2 e 4 meses; protege contra febre amarela, caxumba, rubéola, tétano e hepatite B."
    ],
    optionsEn: [
      "At 2, 4, and 6 months; protects against diphtheria, tetanus, pertussis, hepatitis B, and Haemophilus influenzae b.",
      "At 3, 5, and 7 months; protects against tuberculosis, diphtheria, tetanus, measles, and rubella.",
      "At 2 and 4 months; protects against rotavirus, meningitis C, hepatitis B, pertussis, and polio.",
      "At birth, 2, and 4 months; protects against yellow fever, mumps, rubella, tetanus, and hepatitis B."
    ],
    correctIndex: 0,
    explanation: "A vacina Pentavalente é administrada aos 2, 4 e 6 meses de vida do bebê. Ela garante imunização ativa contra difteria, tétano, coqueluche, hepatite B recombinante e infecções causadas por Haemophilus influenzae tipo b.",
    explanationEn: "The Pentavalent vaccine is administered at 2, 4, and 6 months of age. It provides active immunization against diphtheria, tetanus, pertussis, recombinant hepatitis B, and infections caused by Haemophilus influenzae type b.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2024-q6",
    question: "(ENARE 2024) Conforme a Resolução COFEN nº 564/2017 (Código de Ética dos Profissionais de Enfermagem), é considerado um DIREITO do profissional:",
    questionEn: "(ENARE 2024) According to COFEN Resolution No. 564/2017 (Code of Ethics of Nursing Professionals), it is considered a RIGHT of the professional to:",
    options: [
      "Recusar-se a executar atividades que não sejam de sua competência técnica, científica, ética e legal.",
      "Prestar assistência de enfermagem sem discriminação de qualquer natureza, de forma integral.",
      "Registrar no prontuário do paciente as informações inerentes ao processo de cuidado.",
      "Manter os dados de inscrição ativa atualizados junto ao Conselho Regional de Enfermagem."
    ],
    optionsEn: [
      "Refuse to execute activities that are not within their technical, scientific, ethical, and legal competence.",
      "Provide comprehensive nursing care without discrimination of any kind.",
      "Record patient care details and information in the patient medical record.",
      "Keep active registration data updated with the Regional Nursing Council."
    ],
    correctIndex: 0,
    explanation: "Recusar-se a executar atividades que não sejam de sua competência técnica, científica, ética e legal, ou que não ofereçam segurança ao profissional e à pessoa, é um direito assegurado no Artigo 22 do Código de Ética.",
    explanationEn: "Refusing to perform activities that are outside of their technical, scientific, ethical, and legal competence, or that do not offer safety to the professional and patient, is a right guaranteed in Article 22 of the Code of Ethics.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2024-q7",
    question: "(ENARE 2024) Durante a monitorização hemodinâmica de um paciente crítico na UTI em uso de infusão contínua de Nitroprussiato de Sódio, qual é o principal cuidado de enfermagem relacionado ao frasco e equipo da infusão devido à estabilidade da droga?",
    questionEn: "(ENARE 2024) During the hemodynamic monitoring of a critical patient in the ICU receiving a continuous infusion of Sodium Nitroprusside, what is the primary nursing care related to the infusion bottle and tubing due to drug stability?",
    options: [
      "Utilizar frasco e equipo fotossensíveis, protegendo a solução da luz.",
      "Manter a infusão em temperatura estritamente refrigerada entre 2ºC e 8ºC.",
      "Substituir todo o sistema de infusão a cada 4 horas para evitar precipitação.",
      "Administrar exclusivamente por via intramuscular profunda."
    ],
    optionsEn: [
      "Use light-sensitive (opaque/amber) bags and tubings, protecting the solution from light.",
      "Maintain the infusion at a strictly refrigerated temperature between 2ºC and 8ºC.",
      "Replace the entire infusion set every 4 hours to prevent precipitation.",
      "Administer exclusively via deep intramuscular injection."
    ],
    correctIndex: 0,
    explanation: "O Nitroprussiato de Sódio é uma droga altamente fotossensível. Sob a ação da luz, ele sofre fotodegradação acelerada, podendo liberar cianeto, o que é altamente tóxico. Portanto, o frasco de infusão e o equipo devem ser obrigatoriamente fotoprotetores (opacos/âmbar).",
    explanationEn: "Sodium Nitroprusside is a highly photosensitive drug. Exposed to light, it undergoes accelerated photodegradation, potentially releasing toxic cyanide. Thus, both the container and tubing must be light-resistant (opaque/amber).",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2024-q8",
    question: "(ENARE 2024) No cálculo de infusão de insulina regular por via endovenosa contínua em bomba de infusão, a prescrição médica solicita a diluição de 50 UI de insulina regular em 250 mL de Soro Fisiológico 0,9%. Se a infusão deve correr a 5 UI por hora, qual deve ser a velocidade programada na bomba em mL/h?",
    questionEn: "(ENARE 2024) In calculating continuous intravenous regular insulin infusion, the medical prescription requests 50 UI of regular insulin diluted in 250 mL of 0.9% Normal Saline. If the infusion rate is 5 UI per hour, what flow rate should be programmed on the infusion pump in mL/h?",
    options: [
      "10 mL/h",
      "25 mL/h",
      "50 mL/h",
      "5 mL/h"
    ],
    optionsEn: [
      "10 mL/h",
      "25 mL/h",
      "50 mL/h",
      "5 mL/h"
    ],
    correctIndex: 1,
    explanation: "Se 50 UI de insulina estão em 250 mL, cada 1 UI de insulina está presente em 5 mL de solução (250 / 50 = 5 mL/UI). Para infundir 5 UI por hora, multiplicamos: 5 UI * 5 mL/UI = 25 mL/h.",
    explanationEn: "If 50 UI of insulin is in 250 mL, each 1 UI of insulin is contained in 5 mL of solution (250 / 50 = 5 mL/UI). To infuse 5 UI per hour, we calculate: 5 UI * 5 mL/UI = 25 mL/h.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2024-q9",
    question: "(ENARE 2024) No que tange à Sistematização da Assistência de Enfermagem (SAE), qual etapa do Processo de Enfermagem consiste na determinação dos resultados que se espera alcançar e das ações ou intervenções de enfermagem que serão realizadas?",
    questionEn: "(ENARE 2024) Regarding the Systematization of Nursing Care (SAE), which stage of the Nursing Process consists of determining the expected outcomes and the nursing actions or interventions that will be performed?",
    options: [
      "Planejamento de Enfermagem.",
      "Diagnóstico de Enfermagem.",
      "Avaliação de Enfermagem (Evolução).",
      "Implementação."
    ],
    optionsEn: [
      "Nursing Planning.",
      "Nursing Diagnosis.",
      "Nursing Evaluation (Evolution).",
      "Implementation."
    ],
    correctIndex: 0,
    explanation: "O Planejamento de Enfermagem consiste na determinação dos resultados que se espera alcançar (Metas) e das ações ou intervenções que serão realizadas (Prescrição de Enfermagem) para atingir tais resultados.",
    explanationEn: "Nursing Planning consists of determining the expected goals and outcomes, as well as outlining the nursing actions (nursing prescription) that will be implemented to achieve those goals.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2024-q10",
    question: "(ENARE 2024) Conforme a Portaria de Consolidação nº 2/2017 do Ministério da Saúde, a Rede de Atenção às Urgências e Emergências (RUE) tem como componente móvel principal para o atendimento pré-hospitalar:",
    questionEn: "(ENARE 2024) According to Consolidation Ordinance No. 2/2017 of the Ministry of Health, the Urgency and Emergency Care Network (RUE) has as its main mobile pre-hospital component:",
    options: [
      "O Serviço de Atendimento Móvel de Urgência (SAMU 192).",
      "As Unidades de Pronto Atendimento (UPA 24h).",
      "Os Centros de Atenção Psicossocial (CAPS).",
      "As Unidades Básicas de Saúde (UBS)."
    ],
    optionsEn: [
      "The Mobile Emergency Care Service (SAMU 192).",
      "The Emergency Care Units (UPA 24h).",
      "The Psychosocial Care Centers (CAPS).",
      "The Primary Health Units (UBS)."
    ],
    correctIndex: 0,
    explanation: "O componente móvel da Rede de Atenção às Urgências e Emergências (RUE) é o SAMU 192, responsável por prestar atendimento rápido no local da ocorrência e fazer o transporte adequado do paciente para a rede hospitalar.",
    explanationEn: "The mobile component of the Urgency and Emergency Care Network (RUE) is SAMU 192, responsible for providing rapid clinical care at the scene and transferring patients to appropriate reference facilities.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2024",
    examSourceEn: "ENARE 2024"
  },
  {
    id: "enare-2023-q5",
    question: "(ENARE 2023) Na atenção pré-natal à gestante de baixo risco, qual é o número mínimo de consultas médicas e de enfermagem recomendado pelo Ministério da Saúde durante todo o período gestacional?",
    questionEn: "(ENARE 2023) In low-risk prenatal care, what is the minimum number of medical and nursing consultations recommended by the Ministry of Health throughout the gestational period?",
    options: [
      "No mínimo 6 consultas, preferencialmente mensais até o 6º mês, quinzenais no 7º e 8º meses e semanais no último mês.",
      "No mínimo 3 consultas, divididas igualmente entre os três trimestres.",
      "No mínimo 12 consultas, sendo obrigatória a realização de duas por mês independente do período.",
      "Apenas 4 consultas, focadas nos exames de ultrassonografia trimestral."
    ],
    optionsEn: [
      "At least 6 consultations, preferably monthly until the 6th month, biweekly in the 7th and 8th months, and weekly in the last month.",
      "At least 3 consultations, split equally among the three trimesters.",
      "At least 12 consultations, with a mandatory target of two per month regardless of gestation stage.",
      "Exactly 4 consultations, focused purely on quarterly ultrasound examinations."
    ],
    correctIndex: 0,
    explanation: "O Ministério da Saúde preconiza a realização de, no mínimo, 6 consultas de pré-natal, sendo idealmente: uma no primeiro trimestre, duas no segundo e três no terceiro trimestre.",
    explanationEn: "The Ministry of Health recommends at least 6 prenatal care consultations, ideally: one in the first trimester, two in the second trimester, and three in the third trimester.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2023-q6",
    question: "(ENARE 2023) No contexto do gerenciamento de resíduos de serviços de saúde (RDC nº 222/2018 ANVISA), em qual grupo de classificação de resíduos enquadram-se as agulhas, ampolas de vidro quebradas, lâminas de bisturi e demais materiais perfurocortantes?",
    questionEn: "(ENARE 2023) In the context of healthcare waste management (ANVISA RDC No. 222/2018), under which waste classification group do needles, broken glass ampoules, scalpel blades, and other sharps fall?",
    options: [
      "Grupo E",
      "Grupo A",
      "Grupo B",
      "Grupo D"
    ],
    optionsEn: [
      "Group E",
      "Group A",
      "Group B",
      "Group D"
    ],
    correctIndex: 0,
    explanation: "O Grupo E engloba os materiais perfurocortantes ou escarificantes, tais como lâminas de bisturi, agulhas, ampolas de vidro, lancetas e ponteiras de pipetas, que devem ser descartados em caixas rígidas e resistentes a furos.",
    explanationEn: "Group E comprises sharps or scarifying materials such as surgical blades, needles, glass ampoules, lancets, and pipette tips, which must be discarded in rigid, puncture-resistant boxes.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2023-q7",
    question: "(ENARE 2023) Ao realizar o exame neurológico de um paciente que sofreu Traumatismo Cranioencefálico (TCE) recente, o enfermeiro avalia a resposta pupilar à luz. A constatação de pupilas anisocóricas (uma pupila midriática e outra miótica) sugere:",
    questionEn: "(ENARE 2023) When performing a neurological examination of a patient who recently suffered Traumatic Brain Injury (TBI), the nurse assesses the pupillary response to light. The presence of anisocoric pupils suggests:",
    options: [
      "Hérnia de uncus e compressão do III par de nervo craniano (oculomotor) decorrente de hipertensão intracraniana.",
      "Lesão bilateral completa da medula espinhal ao nível lombar.",
      "Efeito adverso metabólico típico de intoxicação por álcool etílico.",
      "Uso excessivo de sedativos depressores como benzodiazepínicos."
    ],
    optionsEn: [
      "Uncal herniation and third cranial nerve (oculomotor) compression due to intracranial hypertension.",
      "Complete bilateral spinal cord injury at the lumbar level.",
      "Typical metabolic adverse effect of ethyl alcohol acute intoxication.",
      "Overdose of central nervous system depressants like benzodiazepines."
    ],
    correctIndex: 0,
    explanation: "A anisocoria aguda (pupilas com diâmetros desiguais) no paciente com TCE é um sinal de alerta crítico de herniação cerebral (uncal) iminente que comprime o terceiro par craniano (nervo oculomotor), geralmente ipsilateral à lesão expansiva.",
    explanationEn: "Acute anisocoria (unequal pupils) in a TBI patient is a critical warning sign of impending brain (uncal) herniation compressing the third cranial nerve (oculomotor), typically ipsilateral to the mass lesion.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency & Emergency",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2023-q8",
    question: "(ENARE 2023) De acordo com a Lei Federal nº 8.080/1990, a telessaúde é regulamentada como modalidade de prestação de serviços à distância. É um princípio explícito da telessaúde no SUS:",
    questionEn: "(ENARE 2023) According to Federal Law No. 8.080/1990, telehealth is regulated as a remote service delivery modality. An explicit principle of telehealth in SUS is:",
    options: [
      "Consentimento livre e informado do paciente e confidencialidade dos dados.",
      "Uso exclusivo de plataformas desenvolvidas por empresas multinacionais privadas.",
      "Atendimento restrito a consultas de especialidades médicas com exclusão da enfermagem.",
      "Proibição da receita médica em formato digital, exigindo sempre assinatura física."
    ],
    optionsEn: [
      "Free and informed patient consent and data confidentiality.",
      "Exclusive use of software platforms developed by multinational corporations.",
      "Care restricted strictly to physician specialist visits, excluding nursing visits.",
      "Prohibition of digital medical prescriptions, requiring paper with physical signature."
    ],
    correctIndex: 0,
    explanation: "A telessaúde no Brasil é regida por princípios como o consentimento livre e informado do paciente, a confidencialidade dos dados, a promoção do acesso universal e a dignidade profissional (Artigo 26-A da Lei 8.080/1990).",
    explanationEn: "Telehealth in Brazil is governed by principles such as free and informed patient consent, data confidentiality, promotion of universal access, and professional dignity (Article 26-A of Law 8.080/1990).",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2023-q9",
    question: "(ENARE 2023) O processo de desinfecção de artigos hospitalares que entram em contato com pele não íntegra ou mucosas colonizadas (como endoscópios, tubos endotraqueais e lâminas de laringoscópio) é classificado como desinfecção de:",
    questionEn: "(ENARE 2023) The disinfection process of hospital items that come into contact with non-intact skin or colonized mucous membranes (such as endoscopes, endotracheal tubes, and laryngoscope blades) is classified as disinfection of:",
    options: [
      "Nível intermediário ou alto nível para artigos semicríticos.",
      "Baixo nível para artigos críticos.",
      "Altíssimo nível para artigos não críticos.",
      "Esterilização química a vapor frio para fômites comuns."
    ],
    optionsEn: [
      "Intermediate or high-level disinfection for semi-critical items.",
      "Low-level disinfection for critical items.",
      "Ultra-high level disinfection for non-critical items.",
      "Cold-vapor chemical sterilization for ordinary fomites."
    ],
    correctIndex: 0,
    explanation: "Os artigos semicríticos são aqueles que entram em contato com mucosa íntegra ou pele não íntegra. Eles requerem, no mínimo, desinfecção de alto nível ou nível intermediário para garantir a segurança no uso.",
    explanationEn: "Semi-critical items are those that come into contact with intact mucous membranes or non-intact skin. They require, at a minimum, high-level or intermediate-level disinfection.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2023-q10",
    question: "(ENARE 2023) Paciente, 45 anos, hipertenso e diabético, é atendido no acolhimento com queixa de dor precordial de forte intensidade, com irradiação para o braço esquerdo e mandíbula, iniciada há 30 minutos. Qual o primeiro exame complementar diagnóstico obrigatório a ser realizado e qual o tempo máximo recomendado para sua execução?",
    questionEn: "(ENARE 2023) A 45-year-old hypertensive and diabetic patient presents with severe chest pain radiating to the left arm and jaw that started 30 minutes ago. What is the first mandatory diagnostic exam and its maximum recommended execution time?",
    options: [
      "Eletrocardiograma (ECG) de 12 derivações em até 10 minutos da chegada ao serviço.",
      "Dosagem sérica de troponina cardíaca quantitativa em até 4 horas.",
      "Radiografia de tórax PA e perfil em até 30 minutos.",
      "Ecocardiograma transtorácico de urgência em até 60 minutos."
    ],
    optionsEn: [
      "12-lead Electrocardiogram (ECG) within 10 minutes of arrival at the facility.",
      "Quantitative cardiac troponin serum assay within 4 hours.",
      "Chest X-ray (PA and lateral views) within 30 minutes.",
      "Urgent transthoracic echocardiogram within 60 minutes."
    ],
    correctIndex: 0,
    explanation: "Diante de suspeita clínica de Infarto Agudo do Miocárdio (IAM), a diretriz exige a realização e interpretação de um Eletrocardiograma (ECG) de 12 derivações no menor tempo possível, tendo como meta máxima até 10 minutos (porta-ECG) do primeiro contato médico.",
    explanationEn: "In case of clinical suspicion of Acute Myocardial Infarction (AMI), guidelines dictate that a 12-lead ECG must be performed and interpreted within 10 minutes of arrival (door-to-ECG target).",
    category: "Urgência e Emergência",
    categoryEn: "Urgency & Emergency",
    examSource: "ENARE 2023",
    examSourceEn: "ENARE 2023"
  },
  {
    id: "enare-2022-q5",
    question: "(ENARE 2022) Ao realizar a sondagem vesical de demora em um paciente do sexo masculino, o enfermeiro deve inflar o balonete da sonda com qual solução e em qual volume aproximado sugerido pelo fabricante?",
    questionEn: "(ENARE 2022) When performing an indwelling urinary catheterization in a male patient, the nurse must inflate the catheter balloon with which solution and in what approximate volume?",
    options: [
      "Água destilada estéril, geralmente entre 10 mL e 15 mL.",
      "Soro Fisiológico 0,9% estéril, exatamente 20 mL para evitar cristalização.",
      "Água de torneira filtrada, cerca de 5 mL.",
      "Ar ambiente estéril colhido sob vácuo, de 15 mL a 30 mL."
    ],
    optionsEn: [
      "Sterile distilled water, typically between 10 mL and 15 mL.",
      "Sterile 0.9% Normal Saline, exactly 20 mL to avoid crystallization.",
      "Filtered tap water, around 5 mL.",
      "Sterile ambient air drawn under vacuum, 15 to 30 mL."
    ],
    correctIndex: 0,
    explanation: "O balonete deve ser inflado exclusivamente com Água Destilada estéril para evitar a formação de cristais de sal (comum se usado soro fisiológico) que podem obstruir o canal da válvula. O volume ideal usual para retenção em adultos fica entre 10 e 15 mL.",
    explanationEn: "The retention balloon must be inflated exclusively with sterile distilled water. Normal saline is avoided because it can crystalize and lock the valve. The typical volume for adult retention is 10 to 15 mL.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2022-q6",
    question: "(ENARE 2022) Qual é a finalidade principal do teste do pezinho (Triagem Neonatal Biológica), idealmente realizado entre o 3º e o 5º dia de vida do recém-nascido no âmbito da Atenção Básica?",
    questionEn: "(ENARE 2022) What is the main purpose of the newborn screening test (heel prick test), ideally performed between the 3rd and 5th days of life in primary healthcare?",
    options: [
      "Rastreamento precoce de doenças metabólicas, genéticas e infecciosas, visando intervenção precoce antes do aparecimento dos sintomas.",
      "Confirmação do tipo sanguíneo (ABO/Rh) e identificação de anticorpos maternos circulantes.",
      "Determinação do nível de maturidade neurológica e motora do neonato.",
      "Diagnóstico definitivo de cardiopatias congênitas graves, como a tetralogia de Fallot."
    ],
    optionsEn: [
      "Early screening of metabolic, genetic, and infectious diseases, aiming for early intervention before symptoms emerge.",
      "Confirmation of blood type (ABO/Rh) and identification of circulating maternal antibodies.",
      "Determination of the neurological and motor maturity level of the newborn.",
      "Definitive diagnosis of severe congenital heart diseases such as Tetralogy of Fallot."
    ],
    correctIndex: 0,
    explanation: "A triagem neonatal biológica (teste do pezinho) identifica precocemente distúrbios graves que não apresentam sinais clínicos evidentes ao nascimento, tais como fenilcetonúria, hipotireoidismo congênito, fibrose cística, anemia falciforme e hiperplasia adrenal congênita.",
    explanationEn: "Biological newborn screening (heel prick test) identifies severe disorders that lack clinical signs at birth, such as phenylketonuria, congenital hypothyroidism, cystic fibrosis, sickle cell anemia, and congenital adrenal hyperplasia.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2022-q7",
    question: "(ENARE 2022) A vacina BCG (Bacilo Calmette-Guérin) é aplicada ao nascer por via intradérmica para prevenir quais formas clínicas graves da tuberculose?",
    questionEn: "(ENARE 2022) The BCG vaccine is administered intradermally at birth to prevent which severe clinical forms of tuberculosis?",
    options: [
      "Meningite tuberculosa e Tuberculose militar (disseminada).",
      "Tuberculose pulmonar cavitária pós-primária e Tuberculose ganglionar.",
      "Pneumonia bacteriana atípica crônica e Bronquiectasias fibróticas.",
      "Artrite tuberculosa em grandes articulações de carga."
    ],
    optionsEn: [
      "Tuberculous meningitis and miliary (disseminated) tuberculosis.",
      "Post-primary cavitary pulmonary tuberculosis and lymph node tuberculosis.",
      "Chronic atypical bacterial pneumonia and fibrotic bronchiectasis.",
      "Tuberculous arthritis in major weight-bearing joints."
    ],
    correctIndex: 0,
    explanation: "A BCG não impede a infecção pulmonar primária em si, mas protege de forma muito eficaz contra as formas disseminadas e graves de tuberculose na infância, principalmente a meningite tuberculosa e a tuberculose militar.",
    explanationEn: "The BCG vaccine does not prevent primary pulmonary infection but provides robust protection against disseminated, severe pediatric forms of tuberculosis, mainly tuberculous meningitis and miliary TB.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2022-q8",
    question: "(ENARE 2022) A Lei Orgânica da Saúde nº 8.142/1990 determina que os recursos financeiros do SUS destinados à cobertura de ações de saúde devem ser repassados de forma regular e automática de qual maneira?",
    questionEn: "(ENARE 2022) Organic Health Law No. 8.142/1990 mandates that SUS financial resources allocated for health services coverages must be transferred in a regular and automatic manner in which way?",
    options: [
      "De fundo para fundo, diretamente da União para os Estados e Municípios.",
      "Por meio de empréstimos consignados aos bancos federais com juros subsidiados.",
      "Através de emendas parlamentares impositivas gerenciadas pela Câmara de Deputados.",
      "Mediante convênios trimestrais baseados em produtividade hospitalar líquida."
    ],
    optionsEn: [
      "Fund-to-fund, directly from the Federal Union to States and Municipalities.",
      "Through payroll loans provided by federal banks with subsidized interest rates.",
      "Via mandatory parliamentary amendments managed by the Chamber of Deputies.",
      "Through quarterly contracts based on hospital net clinical productivity output."
    ],
    correctIndex: 0,
    explanation: "De acordo com a Lei 8.142/1990, os repasses de recursos federais para os estados, Distrito Federal e municípios para ações de saúde devem ocorrer de modo regular e automático, na modalidade fundo a fundo (Fundo Nacional de Saúde para os Fundos Estaduais e Municipais).",
    explanationEn: "According to Law 8.142/1990, federal funding for state and municipal health actions must be transferred automatically and regularly, in a fund-to-fund manner (from the National Health Fund directly to State and Municipal funds).",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2022-q9",
    question: "(ENARE 2022) No choque anafilático, qual é a medicação vasopressora/inotrópica de primeira escolha recomendada pelas diretrizes internacionais para administração intramuscular imediata na coxa?",
    questionEn: "(ENARE 2022) In anaphylactic shock, which is the first-choice vasopressor/inotropic medication recommended by international guidelines for immediate intramuscular administration in the thigh?",
    options: [
      "Adrenalina (Epinefrina).",
      "Noradrenalina.",
      "Dopamina.",
      "Hidrocortisona."
    ],
    optionsEn: [
      "Adrenaline (Epinephrine).",
      "Norepinephrine.",
      "Dopamine.",
      "Hydrocortisone."
    ],
    correctIndex: 0,
    explanation: "A Adrenalina (Epinefrina) intramuscular na região anterolateral da coxa é o tratamento imediato salvador no choque anafilático, agindo promovendo vasoconstrição, broncodilatação e redução do edema de glote.",
    explanationEn: "Intramuscular Adrenaline (Epinephrine) in the anterolateral thigh is the gold standard life-saving treatment for anaphylaxis, promoting rapid vasoconstriction, bronchodilation, and reduction of airway swelling.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency & Emergency",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2022-q10",
    question: "(ENARE 2022) Ao avaliar a dor em um paciente adulto internado na enfermaria cirúrgica, o enfermeiro utiliza a Escala Visual Analógica (EVA). O paciente reporta dor de intensidade correspondente à nota '7'. Como essa dor é classificada quanto à sua intensidade?",
    questionEn: "(ENARE 2022) When assessing pain in an adult patient admitted to a surgical ward, the nurse uses the Visual Analogue Scale (VAS). The patient reports a pain intensity of '7'. How is this pain classified?",
    options: [
      "Dor moderada.",
      "Dor intensa (grave).",
      "Dor leve.",
      "Ausência de dor clinicamente relevante."
    ],
    optionsEn: [
      "Moderate pain.",
      "Severe pain.",
      "Mild pain.",
      "Absence of clinically relevant pain."
    ],
    correctIndex: 1,
    explanation: "Na classificação numérica da dor: notas 1-3 correspondem a dor leve, notas 4-6 correspondem a dor moderada e notas 7-10 correspondem a dor intensa (grave).",
    explanationEn: "On the numerical scale of pain: scores 1-3 correspond to mild pain, scores 4-6 represent moderate pain, and scores 7-10 correspond to severe (intense) pain.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2022",
    examSourceEn: "ENARE 2022"
  },
  {
    id: "enare-2021-q5",
    question: "(ENARE 2021) De acordo com as Normas Regulamentadoras e diretrizes de biossegurança do Ministério da Saúde, os materiais perfurocortantes com suspeita de contaminação por patógenos devem ser obrigatoriamente descartados em coletores rígidos que devem ser substituídos quando atingirem qual limite de sua capacidade?",
    questionEn: "(ENARE 2021) According to regulatory standards and biosafety guidelines, sharps suspected of contamination with pathogens must be discarded in puncture-resistant rigid containers. These containers must be replaced when they reach what limit of their capacity?",
    options: [
      "Quando o nível de preenchimento atingir 2/3 (dois terços) de sua capacidade total ou a linha limite demarcada pelo fabricante.",
      "Apenas quando o coletor estiver totalmente cheio e transbordando.",
      "Diariamente às 06:00 horas da manhã, independentemente do volume interno.",
      "Sempre que houver o descarte de pelo menos 10 agulhas de grande calibre."
    ],
    optionsEn: [
      "When the filling level reaches 2/3 (two thirds) of its total capacity or the limit line designated by the manufacturer.",
      "Only when the container is completely full and overflowing.",
      "Daily at 6:00 AM, regardless of the internal waste volume.",
      "Whenever at least 10 large-bore needles have been discarded."
    ],
    correctIndex: 0,
    explanation: "De acordo com a norma regulamentadora e de segurança do trabalho em serviços de saúde, os recipientes coletores de perfurocortantes devem ser substituídos quando o nível de preenchimento atingir 2/3 de sua capacidade ou a marca indicadora de limite do frasco.",
    explanationEn: "According to workplace safety standards in health environments, sharps containers must be replaced once the volume reaches 2/3 of total capacity or when the maximum fill line on the box is reached.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2021-q6",
    question: "(ENARE 2021) O método contraceptivo definitivo que consiste na ligadura ou secção dos canais deferentes no homem, impedindo a liberação de espermatozoides no sêmen, denomina-se:",
    questionEn: "(ENARE 2021) The permanent contraceptive method that consists of the ligation or section of the vas deferens in men, preventing the release of sperm in semen, is called:",
    options: [
      "Vasectomia.",
      "Laqueadura tubária bilateral.",
      "Orquiectomia unilateral preventiva.",
      "Ductectomia prostática."
    ],
    optionsEn: [
      "Vasectomy.",
      "Bilateral tubal ligation.",
      "Preventive unilateral orchiectomy.",
      "Prostatic ductectomy."
    ],
    correctIndex: 0,
    explanation: "A vasectomia é a cirurgia de esterilização masculina caracterizada pelo corte ou amarração dos canais deferentes que transportam os espermatozoides produzidos pelos testículos até o líquido seminal.",
    explanationEn: "Vasectomy is a male sterilization surgical procedure in which the vas deferens tubes are severed and/or tied, preventing sperm from entering the seminal stream.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2021-q7",
    question: "(ENARE 2021) Na parada cardiorrespiratória (PCR) em pediatria conduzida por dois profissionais de saúde, qual deve ser a relação de compressões torácicas e ventilações de resgate recomendada pelas diretrizes do PALS (Pediatric Advanced Life Support)?",
    questionEn: "(ENARE 2021) In pediatric cardiopulmonary arrest (CRA) managed by two healthcare providers, what is the recommended ratio of chest compressions to rescue breaths under PALS guidelines?",
    options: [
      "15 compressões para 2 ventilações.",
      "30 compressões para 2 ventilações.",
      "3 compressões para 1 ventilação.",
      "5 compressões para 2 ventilações."
    ],
    optionsEn: [
      "15 compressões para 2 ventilações.",
      "30 compressões para 2 ventilações.",
      "3 compressões para 1 ventilação.",
      "5 compressões para 2 ventilações."
    ],
    correctIndex: 0,
    explanation: "Para bebês e crianças, a relação compressão-ventilação é de 30:2 se houver apenas um socorrista. Contudo, se houver 2 socorristas presentes, a relação recomendada muda para 15:2 de forma a aumentar a fração de oxigenação.",
    explanationEn: "In infant/child resuscitation, the compression-to-ventilation ratio is 30:2 for a single rescuer. When 2 healthcare providers are present, the ratio is optimized to 15:2 to maximize oxygenation.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency & Emergency",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2021-q8",
    question: "(ENARE 2021) Conforme estabelecido na Norma Operacional Básica do SUS (NOB-SUS 96), a gestão dos serviços de saúde no nível municipal é fortalecida pela transferência regular de recursos na modalidade:",
    questionEn: "(ENARE 2021) As established in the Basic Operational Standard of SUS (NOB-SUS 96), healthcare management at the municipal level is strengthened by regular transfer of resources in which modality?",
    options: [
      "Fundo a fundo, baseando-se no piso de atenção básica (PAB).",
      "Padrão de reembolso por guias individuais de exames ambulatoriais complexos.",
      "Convênio direto com associações beneficentes de controle privado.",
      "Orçamento discricionário aprovado semestralmente pelas Assembleias Estaduais."
    ],
    optionsEn: [
      "Fund-to-fund, based on the Primary Care Floor (PAB).",
      "Reimbursement model using individual vouchers for complex outpatient procedures.",
      "Direct contract agreements with privately-controlled charitable entities.",
      "Discretionary budgets approved semi-annually by State Legislative Assemblies."
    ],
    correctIndex: 0,
    explanation: "A NOB-SUS 96 criou o Piso da Atenção Básica (PAB), estabelecendo uma transferência per capita (fundo a fundo) para os municípios gerirem as ações de saúde básica de forma descentralizada.",
    explanationEn: "NOB-SUS 96 introduced the Piso da Atenção Básica (PAB), establishing a per-capita, fund-to-fund federal transfer to municipalities to enhance decentralized primary care management.",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2021-q9",
    question: "(ENARE 2021) Durante a punção venosa periférica, o enfermeiro deve orientar o bisel da agulha ou do dispositivo agulhado (como scalps) de qual maneira para facilitar a entrada na veia e reduzir o risco de transfixação?",
    questionEn: "(ENARE 2021) During peripheral venous puncture, how should the nurse orient the needle bevel to facilitate entry into the vein and reduce transfixion risk?",
    options: [
      "Bisel voltado para cima.",
      "Bisel voltado para baixo.",
      "Bisel voltado lateralmente para a direita.",
      "Bisel voltado lateralmente para a esquerda."
    ],
    optionsEn: [
      "Bevel facing up.",
      "Bevel facing down.",
      "Bevel facing sideways to the right.",
      "Bevel facing sideways to the left."
    ],
    correctIndex: 0,
    explanation: "A introdução da agulha na pele e veia deve ser realizada sempre com o bisel voltado para cima, em um ângulo que varia entre 15 e 30 graus, minimizando o atrito e diminuindo as chances de transfixar a parede posterior do vaso sanguíneo.",
    explanationEn: "The needle must be inserted into the skin and vein with the bevel facing upwards at an angle between 15 and 30 degrees, minimizing entry friction and reducing posterior wall transfixion risks.",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2021-q10",
    question: "(ENARE 2021) Paciente asmático grave, 12 anos, dá entrada na emergência pediátrica com forte dispneia, sibilância audível sem estetoscópio e saturação de O2 de 88% em ar ambiente. Qual a conduta medicamentosa inicial mais indicada para broncodilatação rápida?",
    questionEn: "(ENARE 2021) A 12-year-old severe asthmatic patient presents with severe dyspnea, audible wheezing, and 88% O2 saturation on room air. What is the initial drug action indicated for rapid bronchodilation?",
    options: [
      "Administração inalatória de beta-2 agonista de curta duração (como Salbutamol) associada a corticoide sistêmico.",
      "Inalação isolada com Soro Fisiológico hipertônico a 3%.",
      "Uso imediato de antibiótico endovenoso de largo espectro.",
      "Administração IM de Sulfato de Magnésio isoladamente em dose de ataque."
    ],
    optionsEn: [
      "Inhaled short-acting beta-2 agonist (e.g., Salbutamol) combined with systemic corticosteroid.",
      "Inhalation with hypertonic 3% saline solution alone.",
      "Immediate administration of broad-spectrum IV antibiotics.",
      "IM administration of Magnesium Sulfate alone as a loading dose."
    ],
    correctIndex: 0,
    explanation: "O manejo inicial da crise asmática moderada a grave consiste no uso de broncodilatadores beta-2 agonistas de curta ação (via inalatória/nebulização) associados ao ipratrópio e à administração precoce de corticosteroide sistêmico (oral ou endovenoso) para debelar o processo inflamatório.",
    explanationEn: "The initial management of moderate-to-severe asthma attacks comprises inhaled short-acting beta-2 agonists paired with ipratropium and early administration of systemic corticosteroids to halt airway inflammation.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency & Emergency",
    examSource: "ENARE 2021",
    examSourceEn: "ENARE 2021"
  },
  {
    id: "enare-2020-q5",
    question: "(ENARE 2020) O Código de Processo Ético-Disciplinar do COFEN dispõe sobre as penalidades aplicadas aos profissionais que cometem infrações éticas. A penalidade de suspensão temporária do exercício profissional por período de até 90 dias é de competência:",
    questionEn: "(ENARE 2020) COFEN's Ethical-Disciplinary Code details penalties applied to professionals committing ethical infractions. A temporary suspension from professional practice for up to 90 days is under the authority of:",
    options: [
      "Conselho Regional de Enfermagem (COREN) correspondente à jurisdição, sob homologação do COFEN.",
      "Diretoria clínica e administrativa do hospital onde ocorreu o evento.",
      "Ministério Público Federal mediante ação judicial criminal coletiva.",
      "Sindicato dos Enfermeiros do estado federativo."
    ],
    optionsEn: [
      "The respective Regional Nursing Council (COREN), subject to COFEN's validation.",
      "The clinical and administrative board of the hospital where the incident occurred.",
      "The Federal Public Prosecutor's Office via class-action criminal litigation.",
      "The state nursing trade union."
    ],
    correctIndex: 0,
    explanation: "As penalidades previstas no Código de Ética de Enfermagem (advertência verbal, multa, censura, suspensão do exercício profissional) são aplicadas pelos Conselhos Regionais de Enfermagem (COREN). A suspensão temporária (até 90 dias) e a cassação (competência privativa do COFEN) requerem as devidas instâncias de controle do sistema autárquico.",
    explanationEn: "Penalties (verbal warning, fine, censure, suspension) are issued by the Regional Nursing Councils (COREN). Suspensions (up to 90 days) and license revocations (COFEN exclusive power) go through standard system appeals.",
    category: "Ética e Gestão",
    categoryEn: "Ethics & Management",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2020-q6",
    question: "(ENARE 2020) Na avaliação do desenvolvimento infantil de um lactente de 4 meses na consulta de enfermagem, qual dos seguintes marcos motores e cognitivos é considerado ESPERADO para essa faixa etária?",
    questionEn: "(ENARE 2020) When assessing infant development in a 4-month-old infant during a nursing consult, which of the following motor and cognitive milestones is EXPECTED for this age group?",
    options: [
      "Sustentação da cabeça (controle cervical) e sorriso social ativo quando estimulado.",
      "Marcha independente sem apoio e vocalização de palavras simples.",
      "Sentar-se sem apoio de forma estável com pinça digital activa.",
      "Rastejar ativamente pela sala e responder a ordens verbais simples."
    ],
    optionsEn: [
      "Head support (cervical control) and active social smiling when stimulated.",
      "Independent walking without support and vocalizing simple words.",
      "Sitting unsupported stably with active pincer grasp.",
      "Crawling actively across the room and responding to simple verbal commands."
    ],
    correctIndex: 0,
    explanation: "Aos 4 meses de vida, espera-se que o lactente consiga sustentar bem a cabeça (controle cervical) quando mantido na posição vertical ou de bruços, interaja bem emitindo sons e apresente sorriso social ativo.",
    explanationEn: "At 4 months of age, the infant is expected to exhibit firm head support (cervical control) when held upright or in prone position, vocalize response sounds, and display an active social smile.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2020-q7",
    question: "(ENARE 2020) A vacina Pentavalente protege contra cinco doenças graves. No entanto, qual vacina específica deve ser administrada isoladamente nas primeiras 12 a 24 horas de vida do recém-nascido ainda na maternidade para prevenir a transmissão vertical de uma hepatite específica?",
    questionEn: "(ENARE 2020) The Pentavalent vaccine protects against five serious diseases. However, which specific vaccine must be administered isolated within the first 12 to 24 hours of life to prevent vertical transmission of a specific hepatitis?",
    options: [
      "Vacina contra Hepatite B.",
      "Vacina contra Hepatite A.",
      "Vacina contra Meningite meningocócica ACWY.",
      "Vacina Pentavalente acelular de alta potência."
    ],
    optionsEn: [
      "Hepatitis B vaccine.",
      "Hepatitis A vaccine.",
      "Meningococcal ACWY meningitis vaccine.",
      "High-potency acellular Pentavalent vaccine."
    ],
    correctIndex: 0,
    explanation: "A dose de vacina contra Hepatite B ao nascer deve ser aplicada idealmente nas primeiras 12 a 24 horas de vida, ainda na maternidade, com o objetivo de prevenir a transmissão vertical do vírus de mães portadoras crônicas ou agudas.",
    explanationEn: "The Hepatitis B vaccine dose at birth should be administered ideally within 12 to 24 hours to prevent vertical transmission of the virus from acute or chronic carrier mothers.",
    category: "Ciclos de Vida",
    categoryEn: "Lifespan Care",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2020-q8",
    question: "(ENARE 2020) A Constituição Federal de 1988, no seu artigo 196, define a saúde como um direito de todos e dever do Estado. Para garantir esse direito, o texto constitucional estabelece que as ações de saúde devem ser orientadas prioritariamente para:",
    questionEn: "(ENARE 2020) The Federal Constitution of 1988, in Article 196, defines health as a right of all and a duty of the State. To guarantee this, the constitutional text establishes that health actions must be oriented primarily towards:",
    options: [
      "Atividades preventivas, sem prejuízo dos serviços assistenciais (curativos).",
      "Atendimento médico especializado de alta tecnologia em hospitais filantrópicos.",
      "Controle epidemiológico exclusivo de doenças tropicais negligenciadas.",
      "Financiamento de planos privados de saúde para trabalhadores com carteira assinada."
    ],
    optionsEn: [
      "Preventive activities, without prejudice to curative (assistance) services.",
      "High-tech specialized medical care in philanthropic hospital systems.",
      "Exclusive epidemiological control of neglected tropical diseases.",
      "Funding private healthcare insurance plans for formally employed workers."
    ],
    correctIndex: 0,
    explanation: "De acordo com o Artigo 198, inciso II, da Constituição Federal, as ações e serviços públicos de saúde que integram uma rede regionalizada e hierarquizada têm como diretriz o 'atendimento integral, com prioridade para as atividades preventivas, sem prejuízo dos serviços assistenciais'.",
    explanationEn: "According to Article 198, item II of the Brazilian Federal Constitution, public health actions must provide 'comprehensive care, with priority given to preventive activities, without prejudice to assistance (curative) services.'",
    category: "Legislação SUS",
    categoryEn: "SUS Legislation",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2020-q9",
    question: "(ENARE 2020) Durante um atendimento de emergência de um paciente em choque hipovolêmico grave decorrente de hemorragia massiva, qual é o tipo de dispositivo de acesso venoso periférico mais indicado para garantir infusão rápida e volumosa de cristaloides ou hemoderivados?",
    questionEn: "(ENARE 2020) During emergency care of a patient in severe hypovolemic shock due to massive hemorrhage, which type of peripheral venous access device is most indicated to guarantee rapid and high-volume infusion?",
    options: [
      "Abocath (dispositivo agulhado sobre cateter plástico) de grande calibre, como Jelco nº 14 ou 16.",
      "Scalp (dispositivo agulhado com asas) de calibre fino como nº 25 ou 27.",
      "Dispositivo flexível subcutâneo descartável tipo borboleta.",
      "Cateter de agulha curta intramuscular de calibre nº 22."
    ],
    optionsEn: [
      "Large-bore over-the-needle catheter (e.g., 14G or 16G Jelco/Abocath).",
      "Fine-bore winged infusion set (scalp vein) such as 25G or 27G.",
      "Flexible disposable subcutaneous butterfly-type device.",
      "Short intramuscular needle catheter of 22G size."
    ],
    correctIndex: 0,
    explanation: "No choque hipovolêmico grave, a reposição volêmica rápida exige acessos calibrosos e curtos. Os cateteres periféricos sobre agulha (Jelco/Abocath) de calibres nº 14 ou 16 são os mais indicados, pois oferecem menor resistência física à passagem do fluido, permitindo fluxo muito superior a cateteres longos ou finos.",
    explanationEn: "In severe hypovolemic shock, rapid volume resuscitation requires short, large-bore access devices. Over-the-needle catheters (14G or 16G Jelco) are preferred, offering less resistance to fluid flow than long or narrow devices.",
    category: "Urgência e Emergência",
    categoryEn: "Urgency & Emergency",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  },
  {
    id: "enare-2020-q10",
    question: "(ENARE 2020) No preparo de uma medicação por via parenteral, o enfermeiro necessita administrar 4 mg de Dexametasona por via endovenosa. No posto de enfermagem, há frascos-ampola com apresentação de 4 mg por mililitro (4 mg/mL), contendo 2,5 mL por ampola. Qual o volume em mililitros (mL) que deve ser aspirado do frasco?",
    questionEn: "(ENARE 2020) When preparing a parenteral medication, the nurse needs to administer 4 mg of Dexamethasone intravenously. The nursing station has vials of 4 mg/mL, containing 2.5 mL per vial. What volume in milliliters (mL) must be drawn from the vial?",
    options: [
      "1,0 mL",
      "2,5 mL",
      "0,5 mL",
      "1,5 mL"
    ],
    optionsEn: [
      "1.0 mL",
      "2.5 mL",
      "0.5 mL",
      "1.5 mL"
    ],
    correctIndex: 0,
    explanation: "A concentração é de 4 mg por mililitro (4 mg/mL). Como a prescrição solicita exatamente 4 mg, o enfermeiro deve aspirar exatamente 1,0 mL (que conterá as 4 mg solicitadas).",
    explanationEn: "The concentration is 4 mg per milliliter (4 mg/mL). Since the medical prescription requires exactly 4 mg, the nurse must draw exactly 1.0 mL (which will contain the requested 4 mg).",
    category: "Procedimentos Clínicos",
    categoryEn: "Clinical Procedures",
    examSource: "ENARE 2020",
    examSourceEn: "ENARE 2020"
  }
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    category: "Legislação SUS",
    question: "Quais são os 3 princípios doutrinários do SUS?",
    answer: "Universalidade, Integralidade e Equidade.",
    difficulty: "Easy"
  },
  {
    id: "fc-2",
    category: "Ética e Gestão",
    question: "Qual a punição mais grave prevista no Código de Ética de Enfermagem (Res. 564/17)?",
    answer: "Cassação do direito ao exercício profissional.",
    difficulty: "Medium"
  },
  {
    id: "fc-3",
    category: "Urgência e UTI",
    question: "No protocolo XABCDE, o que significa a letra 'X'?",
    answer: "Hemorragia Exanguinante (controle de grandes sangramentos externos).",
    difficulty: "Easy"
  },
  {
    id: "fc-4",
    category: "Saúde da Mulher",
    question: "Como calcular a DPP pela Regra de Naegele?",
    answer: "Somar 7 dias ao primeiro dia da DUM e subtrair 3 meses ao mês (ou somar 9 meses).",
    difficulty: "Medium"
  },
  {
    id: "fc-5",
    category: "Procedimentos Clínicos",
    question: "Qual a angulação correta para uma injeção Intramuscular (IM)?",
    answer: "90 graus.",
    difficulty: "Easy"
  },
  {
    id: "fc-6",
    category: "Imunização",
    question: "Qual vacina protege contra a tuberculose em recém-nascidos?",
    answer: "Vacina BCG.",
    difficulty: "Easy"
  },
  {
    id: "fc-7",
    category: "Saúde Coletiva",
    question: "Diferença entre Prevalência e Incidência?",
    answer: "Prevalência refere-se a todos os casos (antigos e novos); Incidência refere-se apenas a casos novos em um período.",
    difficulty: "Medium"
  },
  {
    id: "fc-8",
    category: "Farmacologia",
    question: "Qual o antídoto da Heparina?",
    answer: "Sulfato de Protamina.",
    difficulty: "Hard"
  },
  {
    id: "fc-9",
    category: "Urgência e UTI",
    question: "Ritmos de PCR chocáveis?",
    answer: "Fibrilação Ventricular (FV) e Taquicardia Ventricular (TV) sem pulso.",
    difficulty: "Medium"
  },
  {
    id: "fc-10",
    category: "Legislação SUS",
    question: "Qual a periodicidade das Conferências de Saúde?",
    answer: "A cada 4 anos.",
    difficulty: "Easy"
  },
  {
    id: "fc-11",
    category: "Cardiologia",
    question: "Localização do eletrodo V1 no ECG?",
    answer: "4º espaço intercostal, margem direita do esterno.",
    difficulty: "Medium"
  },
  {
    id: "fc-12",
    category: "Nefrologia",
    question: "Principal eletrólito monitorado no paciente renal?",
    answer: "Potássio (K+), pelo risco de arritmias letais.",
    difficulty: "Medium"
  },
  {
    id: "fc-13",
    category: "Saúde Mental",
    question: "Lei que dispõe sobre a proteção e direitos das pessoas com transtornos mentais?",
    answer: "Lei nº 10.216 de 2001 (Lei da Reforma Psiquiátrica).",
    difficulty: "Medium"
  },
  {
    id: "fc-14",
    category: "Gestão",
    question: "Qual resolução do COFEN trata do dimensionamento de pessoal?",
    answer: "Resolução nº 543 de 2017.",
    difficulty: "Hard"
  },
  {
    id: "fc-15",
    category: "Farmacologia",
    question: "Qual a via de administração da insulina regular em caso de cetoacidose?",
    answer: "Via Endovenosa (EV).",
    difficulty: "Hard"
  },
  {
    id: "fc-16",
    category: "Ética",
    question: "O enfermeiro pode delegar a administração de hemoderivados?",
    answer: "Não, é atividade privativa do Enfermeiro.",
    difficulty: "Medium"
  },
  {
    id: "fc-17",
    category: "Centro Cirúrgico",
    question: "Qual a finalidade do Checklist de Cirurgia Segura da OMS?",
    answer: "Reduzir a ocorrência de eventos adversos e erros humanos através da confirmação sistemática de etapas críticas.",
    difficulty: "Easy"
  },
  {
    id: "fc-18",
    category: "Saúde do Idoso",
    question: "O que caracteriza a Síndrome da Fragilidade no idoso?",
    answer: "Perda de peso não intencional, exaustão, lentidão na marcha, baixa força de preensão e baixo nível de atividade física.",
    difficulty: "Medium"
  },
  {
    id: "fc-19",
    category: "Saúde Mental",
    question: "O que é a RAPS?",
    answer: "Rede de Atenção Psicossocial, um conjunto de serviços de saúde que articulam o cuidado para pessoas com transtornos mentais e sofrimento psíquico.",
    difficulty: "Easy"
  },
  {
    id: "fc-20",
    category: "CME",
    question: "Qual o método de esterilização mais comum para materiais termorresistentes?",
    answer: "Autoclave (Calor Úmido Sob Pressão).",
    difficulty: "Easy"
  }
];

export const INITIAL_ATTEMPTS: ExamAttempt[] = [];
