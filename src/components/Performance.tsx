import { useState } from "react";
import { 
  Award, 
  Clock, 
  Activity, 
  TrendingUp, 
  Compass, 
  ShieldCheck, 
  Heart, 
  Baby, 
  Brain, 
  BookOpen 
} from "lucide-react";
import { ExamAttempt, Language, translations } from "../types";
import { getSubjectScores } from "../utils/performance";

interface PerformanceProps {
  language: Language;
  attempts?: ExamAttempt[];
}

export default function Performance({ language, attempts = [] }: PerformanceProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const t = translations[language];

  // 6-Month Data points for our interactive SVG line chart
  const monthsPt = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  
  // Use attempts data for the chart if available, otherwise show empty/placeholder
  const scores = attempts && attempts.length > 0 
    ? attempts.slice(-6).map(a => a.score) 
    : [0, 0, 0, 0, 0, 0]; 

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 180;
  const padding = 30;

  // Map scores into coordinates
  const points = scores.map((score, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (scores.length - 1);
    // invert Y since SVG 0 is top
    const y = chartHeight - padding - (score / 100) * (chartHeight - padding * 2);
    return { x, y, score, month: monthsPt[i] };
  });

  // Build the SVG path string (d attribute)
  let pathD = "";
  points.forEach((pt, i) => {
    if (i === 0) pathD += `M ${pt.x} ${pt.y}`;
    else pathD += ` L ${pt.x} ${pt.y}`;
  });

  // Build the area path string for a nice gradient fill underneath the line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  // Get dynamic subjects from past exam attempts
  const dynamicSubjects = getSubjectScores(attempts);

  const iconMap: Record<string, any> = {
    Heart,
    Baby,
    ShieldCheck,
    Brain,
    Compass,
    BookOpen
  };

  // Compute dynamic average score across mock exam attempts
  const avgScore = attempts && attempts.length > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t.academicPerformance}
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Métricas agregadas sobre seus simulados, horas de estudo semanais e proficiência.
        </p>
      </div>

      {/* Top 3 Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1 */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs flex items-center space-x-5">
          <div className="p-4 bg-sky-500/10 text-sky-600 rounded-xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
              {t.gpa}
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{avgScore}% <span className="text-xs text-slate-400 font-normal">(precisão)</span></span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs flex items-center space-x-5">
          <div className="p-4 bg-sky-500/10 text-sky-600 rounded-xl shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
              {t.totalStudyHours}
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {attempts && attempts.length > 0 ? "342h" : "0h"}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs flex items-center space-x-5">
          <div className="p-4 bg-purple-500/10 text-purple-600 rounded-xl shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
              {t.mockExamAvg}
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{avgScore}%</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {t.performanceTrend}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Média percentual obtida nos simulados mensais para o concurso.
            </p>
          </div>

          <div className="relative pt-4 flex justify-center">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[25, 50, 75, 100].map((level) => {
                const y = chartHeight - padding - (level / 100) * (chartHeight - padding * 2);
                return (
                  <g key={level} className="opacity-15 dark:opacity-5">
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="3" />
                    <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-slate-500 text-[9px] font-bold font-mono">{level}%</text>
                  </g>
                );
              })}

              <path d={areaD} fill="url(#area-grad)" />
              <path d={pathD} fill="transparent" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

              {points.map((pt, idx) => {
                const isHovered = hoveredPoint === idx;
                return (
                  <g 
                    key={idx}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={pt.x} cy={pt.y} r={isHovered ? "7" : "4.5"} className="fill-sky-500 stroke-white dark:stroke-slate-900 transition-all duration-150" strokeWidth="2" />
                    <text x={pt.x} y={chartHeight - 10} textAnchor="middle" className="fill-slate-400 dark:fill-slate-600 text-[10px] font-semibold font-mono">{pt.month}</text>
                    {isHovered && (
                      <g>
                        <rect x={pt.x - 22} y={pt.y - 28} width="44" height="18" rx="4" className="fill-slate-900 text-white" />
                        <text x={pt.x} y={pt.y - 16} textAnchor="middle" className="fill-white font-bold font-mono text-[9px]">{pt.score}%</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs space-y-5">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {t.subjectProgress}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Medido por acertos e aulas concluídas por categoria.
            </p>
          </div>

          <div className="space-y-4">
            {dynamicSubjects.map((sub, i) => {
              const IconComp = iconMap[sub.iconName] || BookOpen;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${sub.color}`}>
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {sub.name}
                      </span>
                    </div>
                    <span className="font-mono text-sky-500 font-bold">{sub.percent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
