import React from "react";
import { Calendar } from "lucide-react";
import { ExamAttempt } from "../types";

interface StudyHeatmapProps {
  attempts?: ExamAttempt[];
}

export default function StudyHeatmap({ attempts = [] }: StudyHeatmapProps) {
  // Compute real study activity by day of the month
  const today = new Date();
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // Count attempts made on this day or calculate activity intensity
    const attemptsOnDay = attempts.filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getDate() === dayNum;
    }).length;

    // Intensity level: 0 = none, 1 = low, 2 = medium, 3 = high
    let intensity = attemptsOnDay > 2 ? 3 : attemptsOnDay > 0 ? 2 : 0;
    return { day: dayNum, intensity, count: attemptsOnDay };
  });

  const activeDaysCount = daysInMonth.filter(d => d.intensity > 0).length;

  const getCellColor = (intensity: number) => {
    switch (intensity) {
      case 3:
        return "bg-emerald-500 shadow-sm shadow-emerald-500/50 border-emerald-400";
      case 2:
        return "bg-teal-500/70 border-teal-400/50";
      case 1:
        return "bg-indigo-500/40 border-indigo-400/30";
      default:
        return "bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800";
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Constância de Estudos (Últimos 30 Dias)
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Matriz de dias com atividades concluídas e simulados realizados.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-[10px] text-slate-400 font-bold">
          <span>Menos</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded bg-indigo-500/40" />
            <div className="w-3 h-3 rounded bg-teal-500/70" />
            <div className="w-3 h-3 rounded bg-emerald-500" />
          </div>
          <span>Mais</span>
        </div>
      </div>

      {/* Grid of Days with Inline Style for 15 Columns */}
      <div 
        className="gap-1.5 pt-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}
      >
        {daysInMonth.map((d) => (
          <div
            key={d.day}
            className={`h-7 rounded-lg border transition-all duration-300 flex items-center justify-center text-[10px] font-bold font-mono ${getCellColor(
              d.intensity
            )} ${d.intensity > 0 ? "text-white" : "text-slate-400 dark:text-slate-600"}`}
            title={`Dia ${d.day}: ${d.intensity > 0 ? `${d.intensity * 2}h de estudo` : "Sem registro"}`}
          >
            {d.day}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          🔥 <strong>{activeDaysCount} dias estudados</strong> este mês ({Math.round((activeDaysCount / 30) * 100)}% de assiduidade)
        </span>
        <span className="text-emerald-500 font-extrabold font-mono text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Ofensiva Ativa
        </span>
      </div>
    </div>
  );
}
