import { StudyModule } from "../types";

export const OFFICIAL_MODULES: StudyModule[] = [
  {
    id: "off-sus-1",
    title: "Legislação do SUS: Leis Orgânicas (8.080/90 e 8.142/90) e Decreto 7.508/11",
    category: "Políticas de Saúde",
    description: "Princípios doutrinários e organizativos do SUS, Controle Social e Regiões de Saúde para o ENARE.",
    iconName: "Stethoscope",
    isOfficial: true,
    lessons: [
      {
        id: "l-sus-1",
        title: "Lei 8.080/1990: Objetivos, Princípios e Campo de Atuação do SUS",
        duration: "30 min",
        completed: false,
        content: `
# Lei 8.080/1990 - Lei Orgânica da Saúde

A **Lei nº 8.080/1990** dispõe sobre as condições para a promoção, proteção e recuperação da saúde, a organização e o funcionamento dos serviços correspondentes em todo o território nacional.

## 📌 1. Princípios Doutrinários (Ideológicos)
*   **Universalidade de Acesso:** A saúde é um direito fundamental de todos os cidadãos e dever do Estado, sem preconceitos ou privilégios de qualquer espécie.
*   **Integralidade da Assistência:** Entende o indivíduo como um ser biopsicossocial. Engloba ações de promoção, prevenção, tratamento e reabilitação em todos os níveis de complexidade.
*   **Equidade:** Tratar de forma desigual os desiguais. Direciona proporcionalmente mais recursos e atenção às populações vulneráveis para reduzir desigualdades sociais e regionais.

## 📌 2. Princípios Organizativos (Operacionais)
*   **Descentralização:** Redistribuição das responsabilidades de gestão com direção única em cada esfera de governo (Federal: Ministério da Saúde; Estadual: SES; Municipal: SMS) com ênfase na municipalização.
*   **Regionalização e Hierarquização:** Organização dos serviços de saúde em níveis de complexidade crescente (Atenção Primária, Secundária e Terciária) estruturados em redes geograficamente delimitadas.
*   **Participação da Comunidade:** Controle social garantido por lei (detalhado pela Lei 8.142/90).

> 💡 **PONTO DE ATENÇÃO ENARE/FGV:**
> A FGV adora cobrar a distinção entre princípios *doutrinários* (Universalidade, Equidade, Integralidade) e princípios *organizativos* (Descentralização, Regionalização, Hierarquização, Participação Social). Memorize essa divisão!
        `
      },
      {
        id: "l-sus-2",
        title: "Lei 8.142/1990 e Decreto 7.508/2011: Controle Social e Regiões de Saúde",
        duration: "35 min",
        completed: false,
        content: `
# Lei 8.142/1990 e Decreto 7.508/2011

## 📌 1. Lei 8.142/1990: Controle Social e Financiamento
A Lei 8.142/90 dispõe sobre a **participação da comunidade** na gestão do SUS e as transferências intergovernamentais de recursos financeiros.

*   **Conferências de Saúde:** Reúnem-se a cada **4 anos** com representação dos vários segmentos sociais para avaliar a situação de saúde e propor as diretrizes da política de saúde.
*   **Conselhos de Saúde:** Atuam em caráter **permanente e deliberativo**, formulando estratégias e controlando a execução da política de saúde, inclusive nos aspectos financeiros.
*   **Composição Paritária (Resolução CNS 453/2012):**
    *   **50%** de representantes de Usuários.
    *   **25%** de Trabalhadores de Saúde.
    *   **25%** divididos entre Prestadores de Serviços e Representantes do Governo.

## 📌 2. Decreto 7.508/2011: Regulamentação do SUS
O Decreto 7.508/11 regulamenta a Lei 8.080/90 para estruturar o planejamento e a articulação interfederativa.

*   **Região de Saúde:** Espaço geográfico contínuo formado por municípios limítrofes. Para ser instituída, a Região de Saúde deve conter no mínimo 5 serviços:
    1. Atenção Primária
    2. Urgência e Emergência
    3. Atenção Psicossocial
    4. Atenção Ambulatorial Especializada e Hospitalar
    5. Vigilância em Saúde
*   **Portas de Entrada:** A Atenção Primária é a porta de entrada **preferencial e ordenadora** da Rede de Atenção à Saúde (RAS).
        `
      }
    ]
  },
  {
    id: "off-etica-1",
    title: "Ética, Legislação Profissional e Processo de Enfermagem (COFEN 736/2024)",
    category: "Ética e Bioética",
    description: "Código de Ética (COFEN 564/2017), Lei do Exercício Profissional e as 5 Etapas da SAE (Res. 736/2024).",
    iconName: "Shield",
    isOfficial: true,
    lessons: [
      {
        id: "l-etica-1",
        title: "Código de Ética (Res. COFEN 564/2017) e Penalidades Disciplinares",
        duration: "40 min",
        completed: false,
        content: `
# Código de Ética dos Profissionais de Enfermagem (Resolução COFEN nº 564/2017)

O Código de Ética regulamenta os Direitos, Deveres e Proibições dos Enfermeiros, Técnicos e Auxiliares de Enfermagem.

## 📌 1. Direitos vs. Deveres
*   **Direitos Principais:**
    *   Exercer a enfermagem com liberdade, segurança técnica, científica e ambiental.
    *   Recusar-se a executar atividades que não sejam de sua competência legal/técnica ou que não ofereçam segurança ao paciente (Art. 22).
    *   Recusar-se a ser filmado, fotografado e exposto em mídias sociais durante o exercício profissional (Art. 19).
*   **Deveres Principais:**
    *   Registrar no prontuário do paciente de forma clara, legível e cronológica todas as informações do cuidar.
    *   Prestar assistência livre de danos decorrentes de **imperícia, negligência ou imprudência**.

## 📌 2. Penalidades Disciplinares
1.  **Advertência Verbal:** Admoestação reservada e registrada no prontuário do infror.
2.  **Multa:** Valor de 1 a 10 vezes a anuidade.
3.  **Censura:** Admoestação pública divulgada nas publicações oficiais dos Conselhos.
4.  **Suspensão do Exercício Profissional:** Proibição de atuar por até **90 dias**.
5.  **Cassação do Direito ao Exercício Profissional:** Proibição por até 30 anos. **Competência EXCLUSIVA do COFEN** (Art. 108, § 5º).
        `
      },
      {
        id: "l-etica-2",
        title: "Processo de Enfermagem em 5 Etapas (Resolução COFEN nº 736/2024)",
        duration: "35 min",
        completed: false,
        content: `
# Processo de Enfermagem (Resolução COFEN nº 736/2024)

A **Resolução COFEN nº 736/2024** atualizou a regulamentação do Processo de Enfermagem em todo o Brasil.

## 📌 As 5 Etapas Obrigatórias:
1.  **Avaliação de Enfermagem:** Coleta sistemática e deliberada de dados (anamnese e exame físico) sobre o estado de saúde do indivíduo.
2.  **Diagnóstico de Enfermagem:** Julgamento clínico sobre as respostas humanas aos problemas de saúde/processos de vida (utilizando taxonomias como NANDA-I).
3.  **Planejamento de Enfermagem:** Determinação dos resultados esperados (NOC) e das intervenções de enfermagem (NIC).
4.  **Implementação de Enfermagem:** Execução das ações e intervenções planejadas.
5.  **Evolução de Enfermagem:** Avaliação dos resultados alcançados e reavaliação contínua do plano de cuidado.

> 💡 **PONTO DE ATENÇÃO ENARE/FGV:**
> Fique atento: a palavra "Investigação" foi substituída pelo termo **"Avaliação de Enfermagem"** na Resolução 736/2024!
        `
      }
    ]
  }
];
