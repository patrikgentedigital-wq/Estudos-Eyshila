export interface EnareInstitution {
  id: string;
  name: string;
  location: string;
  cutoffPercentage: number | null;
  vacancies: number | null;
  badge: string;
}

// A nota de corte e o número de vagas variam por edital, modalidade e chamada.
// Não exibimos números sem uma fonte oficial vinculada ao edital vigente.
export const ENARE_INSTITUTIONS: EnareInstitution[] = [
  { id: "ebserh-nacional", name: "EBSERH Nacional (Rede de Hospitais Universitários)", location: "Nacional", cutoffPercentage: null, vacancies: null, badge: "Referência" },
  { id: "inca-rj", name: "INCA - Instituto Nacional de Câncer", location: "Rio de Janeiro - RJ", cutoffPercentage: null, vacancies: null, badge: "Oncologia" },
  { id: "hc-usp", name: "Hospital das Clínicas da USP", location: "São Paulo - SP", cutoffPercentage: null, vacancies: null, badge: "Alta concorrência" },
  { id: "unifesp", name: "UNIFESP - Universidade Federal de São Paulo", location: "São Paulo - SP", cutoffPercentage: null, vacancies: null, badge: "Universidade federal" },
  { id: "ufrj", name: "UFRJ - Universidade Federal do Rio de Janeiro", location: "Rio de Janeiro - RJ", cutoffPercentage: null, vacancies: null, badge: "Universidade federal" },
  { id: "hc-ufmg", name: "HC-UFMG - Hospital das Clínicas da UFMG", location: "Belo Horizonte - MG", cutoffPercentage: null, vacancies: null, badge: "Hospital universitário" },
  { id: "hupe-uerj", name: "HUPE - Hospital Universitário Pedro Ernesto", location: "Rio de Janeiro - RJ", cutoffPercentage: null, vacancies: null, badge: "Hospital universitário" },
  { id: "hu-ufpe", name: "HC-UFPE - Hospital das Clínicas da UFPE", location: "Recife - PE", cutoffPercentage: null, vacancies: null, badge: "Hospital universitário" },
  { id: "hc-ufpr", name: "HC-UFPR - Hospital de Clínicas de Curitiba", location: "Curitiba - PR", cutoffPercentage: null, vacancies: null, badge: "Hospital universitário" },
];
