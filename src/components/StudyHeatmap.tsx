import React from "react";
import { Flame, Calendar, Sparkles } from "lucide-react";

export default function StudyHeatmap() {
  // Generate 30 days of mock study activity data
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // Generate realistic intensity levels (0 = none, 1 = low, 2 = medium, 3 = high)
    let intensity = 0;
    if (dayNum % 7 !== 0 && dayNum % 6 !== 0) {
      intensity = (dayNum % 3) + 1;
    } else if (dayNum % 2 === 0) {
      intensity = 1;
    }
    return { day: dayNum, intensity };
  });

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

      {/* Grid of Days */}
      <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 pt-2">
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
          🔥 <strong>24 dias estudados</strong> este mês (80% de assiduidade)
        </span>
        <span className="text-emerald-500 font-extrabold font-mono text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Ofensiva Ativa
        </span>
      </div>
    </div>
  );
}
