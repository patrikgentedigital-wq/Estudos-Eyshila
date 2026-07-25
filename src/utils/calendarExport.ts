/**
 * iCal (.ics) Calendar Exporter for Portal de Estudos Eyshila Caxias
 * Exports official ENARE 2026/2027 critical dates directly to iOS / Android / Google Calendar
 */

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: string; // YYYYMMDDTHHMMSS
  endDate: string;
  location?: string;
}

export const ENARE_OFFICIAL_EVENTS: CalendarEvent[] = [
  {
    title: "📝 ENARE 2026/2027 - Aplicação da Prova Objetiva",
    description: "Dia oficial da realização da Prova Objetiva do ENARE 2026/2027 para Residência em Enfermagem.",
    startDate: "20260913T080000",
    endDate: "20260913T120000",
    location: "Local de Prova ENARE"
  },
  {
    title: "📊 ENARE 2026/2027 - Resultado Prova Objetiva (Pré-Requisito)",
    description: "Divulgação do resultado definitivo da Prova Objetiva para modalidades com Pré-Requisito.",
    startDate: "20261029T090000",
    endDate: "20261029T180000"
  },
  {
    title: "📊 ENARE 2026/2027 - Resultado Prova Objetiva (Acesso Direto)",
    description: "Divulgação do resultado definitivo da Prova Objetiva para Acesso Direto em Enfermagem.",
    startDate: "20261204T090000",
    endDate: "20261204T180000"
  },
  {
    title: "🏆 ENARE 2026/2027 - Resultado Definitivo da Nota Final",
    description: "Publicação da classificação e Nota Final consolidada do ENARE 2026/2027.",
    startDate: "20270108T090000",
    endDate: "20270108T180000"
  },
  {
    title: "🎯 ENARE 2026/2027 - 1ª Oportunidade Escolha de Vagas",
    description: "Período oficial da 1ª oportunidade para escolha do hospital de residência no sistema ENARE.",
    startDate: "20270111T080000",
    endDate: "20270112T235959"
  }
];

export function downloadEicsCalendar(events: CalendarEvent[] = ENARE_OFFICIAL_EVENTS) {
  let icsData = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Portal Eyshila Caxias//ENARE 2026-2027//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  events.forEach(evt => {
    icsData.push(
      "BEGIN:VEVENT",
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description}`,
      `DTSTART:${evt.startDate}`,
      `DTEND:${evt.endDate}`,
      evt.location ? `LOCATION:${evt.location}` : "",
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  icsData.push("END:VCALENDAR");

  const icsContent = icsData.filter(Boolean).join("\r\n");
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ENARE_2026_2027_Cronograma_EyshilaCaxias.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
