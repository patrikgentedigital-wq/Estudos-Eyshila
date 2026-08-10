import React from "react";
import { Play, PauseCircle, StopCircle } from "lucide-react";
import { Language } from "../../types";

interface AiAudioPlayerProps {
  language: Language;
  file: File | null;
  fullPdfText: string;
  summaryText?: string;
  isSpeaking: boolean;
  isPaused: boolean;
  rate: number;
  setRate: (rate: number) => void;
  progressPercent: number;
  speak: (text: string, rate?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export default function AiAudioPlayer({
  language,
  file,
  fullPdfText,
  summaryText,
  isSpeaking,
  isPaused,
  rate,
  setRate,
  progressPercent,
  speak,
  pause,
  resume,
  stop,
}: AiAudioPlayerProps) {
  const textToRead = fullPdfText || summaryText || "";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Audio Control Header Box */}
      <div className="bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {language === "pt" ? "Audiobook Completo (100% Texto Original)" : "Full Audiobook (100% Original Text)"}
            </span>
          </div>
          <h3 className="font-black text-xl text-white">
            {file ? file.name : (language === "pt" ? "Caderno de Legislação do SUS (Texto Integral)" : "Full Study Document")}
          </h3>
          <p className="text-xs text-sky-100 font-medium">
            {language === "pt"
              ? "O leitor neural está lendo o texto do documento linha por linha do início ao fim."
              : "Neural TTS engine is reading the entire document line by line."}
          </p>
        </div>

        {/* Main Playback Controls */}
        <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-xs rounded-2xl p-2.5">
            {!isSpeaking && !isPaused ? (
              <button
                onClick={() => speak(textToRead, rate)}
                className="bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{language === "pt" ? "Iniciar Narração" : "Start Reading"}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={isPaused ? resume : pause}
                  className="bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  {isPaused ? <Play className="h-4 w-4 fill-current" /> : <PauseCircle className="h-4 w-4" />}
                  <span>{isPaused ? (language === "pt" ? "Retomar" : "Resume") : (language === "pt" ? "Pausar" : "Pause")}</span>
                </button>
                <button
                  onClick={stop}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center space-x-1 shadow-md cursor-pointer"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>{language === "pt" ? "Parar" : "Stop"}</span>
                </button>
              </div>
            )}

            {/* Speed Selector */}
            <select
              value={rate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setRate(newRate);
              }}
              className="bg-white/20 text-white font-bold text-xs py-2 px-2.5 rounded-xl outline-none border border-white/30 cursor-pointer"
            >
              <option value={0.75} className="text-slate-900">0.75x</option>
              <option value={1.0} className="text-slate-900">1.0x ({language === "pt" ? "Normal" : "Normal"})</option>
              <option value={1.25} className="text-slate-900">1.25x</option>
              <option value={1.5} className="text-slate-900">1.5x</option>
              <option value={2.0} className="text-slate-900">2.0x ({language === "pt" ? "Rápido" : "Fast"})</option>
            </select>
          </div>

          {/* Progress percent */}
          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-[10px] text-sky-100 font-bold">
              <span>{language === "pt" ? "Progresso da Narração" : "Narration Progress"}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Text Display for Reading Along */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
          {language === "pt" ? "📖 Transcrição / Texto Original Sendo Lido:" : "📖 Original Text Transcript:"}
        </h4>
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
          {fullPdfText || (language === "pt"
            ? "Nenhum PDF lido na íntegra ainda. Clique em '+ Anexar / Trocar PDF' no topo e selecione 'Ouvir PDF Completo (Sem Resumir)'."
            : "No PDF extracted yet. Attach a PDF and choose 'Listen Full PDF'.")}
        </div>
      </div>

    </div>
  );
}
