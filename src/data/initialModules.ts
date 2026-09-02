import type { StudyModule } from "../types";

export const INITIAL_MODULES: StudyModule[] = [
  {
    id: "mod-basicos",
    title: "Competências Gerais - Equidade, Humanização e Segurança",
    titleEn: "General Competencies - Equity, Humanization & Safety",
    category: "Competências Gerais",
    categoryEn: "General Competencies",
    description: "Conteúdos gerais do Anexo III do Edital nº 04/2026: inclusão, educação permanente, humanização, vigilância, bioética, segurança do paciente, trabalho em equipe e NR-32.",
    descriptionEn: "General content from Annex III of Notice 04/2026: inclusion, permanent education, humanization, surveillance, bioethics, patient safety, teamwork, and NR-32.",
    iconName: "BookOpen",
    lessons: [
      {
        id: "les-bas-1",
        title: "Inclusão e cuidado de grupos vulnerabilizados",
        titleEn: "Inclusion and care for vulnerable groups",
        duration: "30 min",
        completed: false,
        content: "Revisão aplicada à assistência de crianças e adolescentes, pessoas idosas, população LGBTQIA+, pessoas com deficiência, pessoas em situação de rua, povos originários, população negra, comunidades quilombolas e demais minorias sociais. Treinar condutas que reduzam barreiras de acesso, discriminação e iatrogenias.",
        contentEn: "Applied review of inclusive care, access barriers, discrimination prevention, and safer decisions for vulnerable populations."
      },
      {
        id: "les-bas-2",
        title: "Educação permanente, humanização e trabalho em equipe",
        titleEn: "Permanent education, humanization & teamwork",
        duration: "35 min",
        completed: false,
        content: "Política Nacional de Educação Permanente em Saúde, Política Nacional de Humanização e trabalho em equipe multidisciplinar. Praticar situações de acolhimento, comunicação, corresponsabilização, aprendizagem no trabalho e decisão compartilhada.",
        contentEn: "Permanent Health Education, the National Humanization Policy, multidisciplinary teamwork, communication, shared decisions, and workplace learning."
      },
      {
        id: "les-bas-3",
        title: "Vigilância, bioética, segurança do paciente e NR-32",
        titleEn: "Surveillance, bioethics, patient safety & NR-32",
        duration: "25 min",
        completed: false,
        content: "Política Nacional de Vigilância em Saúde, fundamentos de bioética, Programa Nacional de Segurança do Paciente e NR-32. Relacionar riscos ocupacionais e assistenciais a medidas concretas de prevenção, notificação e cultura de segurança.",
        contentEn: "Health surveillance, bioethics, the National Patient Safety Program, NR-32, risk prevention, reporting, and safety culture."
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

