import { StudyModule } from "../types";

export const OFFICIAL_MODULES: StudyModule[] = [
  {
    id: "off-sus-1",
    title: "Políticas Públicas e SUS (Lei 8.080/90)",
    category: "Políticas de Saúde",
    description: "Princípios, Diretrizes e Organização do Sistema Único de Saúde.",
    iconName: "Stethoscope",
    isOfficial: true,
    lessons: [
      {
        id: "l-sus-1",
        title: "Princípios do SUS",
        duration: "15 min",
        completed: false,
        content: `
# Políticas Públicas e SUS (Lei 8.080/90)

A Lei 8.080/90 regula, em todo o território nacional, as ações e serviços de saúde, executados isolada ou conjuntamente, em caráter permanente ou eventual.

## 1. Princípios do SUS
- **Universalidade**: Acesso garantido a todos os cidadãos.
- **Equidade**: Tratar desigualmente os desiguais, investindo onde há maior necessidade.
- **Integralidade**: O cuidado engloba promoção, prevenção, cura e reabilitação.
        `
      },
      {
        id: "l-sus-2",
        title: "Descentralização e Iniciativa Privada",
        duration: "20 min",
        completed: false,
        content: `
## 2. Descentralização
Ocorre com direção única em cada esfera de governo:
- **Federal**: Ministério da Saúde
- **Estadual**: Secretaria de Estado da Saúde
- **Municipal**: Secretaria Municipal de Saúde

## 3. Participação da Iniciativa Privada
A iniciativa privada pode participar do SUS em caráter **complementar**, tendo preferência as entidades filantrópicas e as sem fins lucrativos.
        `
      }
    ]
  },
  {
    id: "off-etica-1",
    title: "Código de Ética da Enfermagem",
    category: "Ética e Bioética",
    description: "Direitos, Deveres e Proibições (Resolução COFEN 564/2017).",
    iconName: "Shield",
    isOfficial: true,
    lessons: [
      {
        id: "l-etica-1",
        title: "Direitos e Deveres",
        duration: "25 min",
        completed: false,
        content: `
# Código de Ética dos Profissionais de Enfermagem (Res. 564/2017)

O Código de Ética fundamenta-se nos princípios da bioética: Beneficência, Não Maleficência, Autonomia e Justiça.

## 1. Direitos (Art. 1º ao 23)
- Exercer a enfermagem com liberdade, segurança técnica, científica e ambiental.
- Recusar-se a executar atividades que não sejam de sua competência legal.
- Ter acesso às informações relacionadas à pessoa, família e coletividade, necessárias ao exercício profissional.

## 2. Deveres (Art. 24 ao 60)
- Exercer a profissão com justiça, compromisso, equidade, resolutividade, dignidade e competência.
- Fundamentar suas relações no direito, na prudência e na tolerância.
- Registrar no prontuário e em outros documentos as informações inerentes e indispensáveis ao processo de cuidar de forma clara, objetiva e cronológica.
        `
      }
    ]
  }
];
