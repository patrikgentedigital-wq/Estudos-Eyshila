export interface EnareInstitution {
  id: string;
  name: string;
  location: string;
  cutoffPercentage: number;
  vacancies: number;
  badge: string;
}

export const ENARE_INSTITUTIONS: EnareInstitution[] = [
  {
    id: "ebserh-nacional",
    name: "EBSERH Nacional (Rede de Hospitais Universitários)",
    location: "Nacional (Diversos Estados)",
    cutoffPercentage: 83.5,
    vacancies: 450,
    badge: "🏆 Alta Concorrência"
  },
  {
    id: "inca-rj",
    name: "INCA - Instituto Nacional de Câncer",
    location: "Rio de Janeiro - RJ",
    cutoffPercentage: 85.5,
    vacancies: 24,
    badge: "⭐ Referência Oncologia"
  },
  {
    id: "hc-usp",
    name: "Hospital das Clínicas da USP",
    location: "São Paulo - SP",
    cutoffPercentage: 86.0,
    vacancies: 35,
    badge: "🔥 Maior Nota de Corte"
  },
  {
    id: "unifesp",
    name: "UNIFESP - Universidade Federal de São Paulo",
    location: "São Paulo - SP",
    cutoffPercentage: 84.0,
    vacancies: 30,
    badge: "🎓 Excelência Acadêmica"
  },
  {
    id: "ufrj",
    name: "UFRJ - Universidade Federal do Rio de Janeiro",
    location: "Rio de Janeiro - RJ",
    cutoffPercentage: 83.0,
    vacancies: 28,
    badge: "🌟 Tradição Nacional"
  },
  {
    id: "hc-ufmg",
    name: "HC-UFMG - Hospital das Clínicas da UFMG",
    location: "Belo Horizonte - MG",
    cutoffPercentage: 82.5,
    vacancies: 40,
    badge: "🏥 Hospital Escola"
  },
  {
    id: "hupe-uerj",
    name: "HUPE - Hospital Universitário Pedro Ernesto (UERJ)",
    location: "Rio de Janeiro - RJ",
    cutoffPercentage: 81.5,
    vacancies: 20,
    badge: "📍 Rio de Janeiro"
  },
  {
    id: "hu-ufpe",
    name: "HC-UFPE - Hospital das Clínicas da UFPE",
    location: "Recife - PE",
    cutoffPercentage: 82.0,
    vacancies: 32,
    badge: "☀️ Nordeste"
  },
  {
    id: "hc-ufpr",
    name: "HC-UFPR - Hospital de Clínicas de Curitiba",
    location: "Curitiba - PR",
    cutoffPercentage: 81.0,
    vacancies: 25,
    badge: "🌲 Sul"
  }
];
