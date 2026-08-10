import React from "react";
import { 
  FileText, 
  Headphones, 
  Play, 
  PauseCircle, 
  StopCircle, 
  FileDown, 
  Printer, 
  HelpCircle, 
  BookOpen
} from "lucide-react";
import { Language } from "../../types";

interface AiSummaryProps {
  language: Language;
  summary: string;
  file: File | null;
  isSpeaking: boolean;
  isPaused: boolean;
  rate: number;
  setRate: (rate: number) => void;
  speak: (text: string, rate?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  handleExportPdf: () => void;
  handlePrint: () => void;
  setActiveSubTab: (tab: "summary" | "quiz" | "flashcards" | "full-audio") => void;
}

export default function AiSummary({
  language,
  summary,
  file,
  isSpeaking,
  isPaused,
  rate,
  setRate,
  speak,
  pause,
  resume,
  stop,
  handleExportPdf,
  handlePrint,
  setActiveSubTab,
}: AiSummaryProps) {
  if (!summary) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center space-y-3">
        <p className="text-slate-500 text-sm">
          {language === "pt" ? "Nenhum resumo disponível." : "No summary available."}
        </p>
      </div>
    );
  }

  // Render markdown line by line with styling
  const renderMarkdownSummary = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="font-extrabold text-base text-slate-900 dark:text-white mt-5 mb-2 flex items-center space-x-2">
            <span className="w-1.5 h-4 bg-sky-500 rounded-full" />
            <span>{line.replace("### ", "")}</span>
          </h3>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="font-bold text-sm text-sky-600 dark:text-sky-400 mt-4 mb-1.5">
            {line.replace("#### ", "")}
          </h4>
        );
      }
      if (line.startsWith("*   ") || line.startsWith("- ")) {
        const itemText = line.replace(/^\*\s+|^-\s+/, "");
        return (
          <li key={idx} className="ml-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc">
            {itemText}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
      
      {/* Audio Bar controls for reading summary */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {language === "pt" ? "Ouvir Resumo Didático" : "Listen to Study Summary"}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {language === "pt" ? "Text-to-Speech integrado via síntese neural do navegador." : "Integrated neural Text-to-Speech player."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isSpeaking && !isPaused ? (
            <button
              onClick={() => speak(summary, rate)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-sky-600/10 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{language === "pt" ? "Ouvir Resumo" : "Listen"}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={isPaused ? resume : pause}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center space-x-1 shadow-md shadow-sky-600/10 cursor-pointer"
              >
                {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <PauseCircle className="h-3.5 w-3.5" />}
                <span>{isPaused ? (language === "pt" ? "Retomar" : "Resume") : (language === "pt" ? "Pausar" : "Pause")}</span>
              </button>
              <button
                onClick={stop}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all flex items-center space-x-1 shadow-md cursor-pointer"
              >
                <StopCircle className="h-3.5 w-3.5" />
                <span>{language === "pt" ? "Parar" : "Stop"}</span>
              </button>
            </div>
          )}

          <select
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 px-2 rounded-xl outline-none cursor-pointer"
          >
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-2">
        {renderMarkdownSummary(summary)}
      </div>

      {/* Footer Action Bar */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPdf}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>{language === "pt" ? "Exportar PDF" : "Export PDF"}</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{language === "pt" ? "Imprimir Material" : "Print"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab("quiz")}
            className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-sky-600/10 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>{language === "pt" ? "Fazer Simulado Prático →" : "Take Practice Quiz →"}</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("flashcards")}
            className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>{language === "pt" ? "Ir para Flashcards →" : "Open Flashcards →"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
