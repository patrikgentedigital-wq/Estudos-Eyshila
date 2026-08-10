import React from "react";
import { FileUp, X, AlertTriangle, Headphones, Brain } from "lucide-react";
import { Language } from "../../types";

interface AiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  file: File | null;
  pastedText: string;
  setPastedText: (val: string) => void;
  dragActive: boolean;
  errorMsg: string | null;
  setErrorMsg: (val: string | null) => void;
  isExtractingPdf: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReadFullPdf: () => void;
  handleGenerateStudy: () => void;
}

export default function AiUploadModal({
  isOpen,
  onClose,
  language,
  file,
  pastedText,
  setPastedText,
  dragActive,
  errorMsg,
  setErrorMsg,
  isExtractingPdf,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleFileChange,
  handleReadFullPdf,
  handleGenerateStudy,
}: AiUploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-teal-500 text-white rounded-2xl shadow-md shadow-sky-500/20">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                {language === "pt" ? "Anexar Material de Estudo (PDF/Texto)" : "Attach Study Material (PDF/Text)"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {language === "pt" ? "Escolha o que deseja fazer com seu arquivo de enfermagem." : "Choose what you want to do with your nursing document."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs sm:text-sm flex items-start space-x-2.5 animate-fade-in shadow-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="font-extrabold text-xs cursor-pointer">✕</button>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive 
              ? "border-sky-500 bg-sky-500/10 scale-[1.01]" 
              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/80 hover:border-sky-500/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-full mb-3">
            <FileUp className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {file ? file.name : (language === "pt" ? "Clique para selecionar seu arquivo PDF ou TXT" : "Click to select your PDF or TXT file")}
          </h4>
          <p className="text-[11px] font-medium text-slate-400 mt-1">
            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB selecionados` : (language === "pt" ? "Ou arraste e solte o arquivo diretamente aqui" : "Or drag and drop your file here")}
          </p>
        </div>

        {/* Pasted text option */}
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {language === "pt" ? "Ou cole o texto de estudo diretamente:" : "Or paste study text directly:"}
          </label>
          <textarea
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={language === "pt" ? "Cole anotações, resoluções COFEN ou diretrizes de enfermagem aqui..." : "Paste notes, guidelines or nursing references here..."}
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all leading-relaxed text-slate-800 dark:text-slate-200 font-medium"
          />
        </div>

        {/* Dual Action Cards */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReadFullPdf}
            disabled={(!file && !pastedText.trim()) || isExtractingPdf}
            className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Headphones className="h-4 w-4" />
            <span>{isExtractingPdf ? (language === "pt" ? "Extraindo PDF..." : "Extracting PDF...") : (language === "pt" ? "🎧 Ouvir PDF Completo (Sem Resumir)" : "🎧 Listen Full PDF (No Summary)")}</span>
          </button>

          <button
            onClick={handleGenerateStudy}
            disabled={(!file && !pastedText.trim()) || isExtractingPdf}
            className="flex-1 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-xl shadow-sky-600/20 hover:shadow-sky-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Brain className="h-4 w-4" />
            <span>{language === "pt" ? "🧠 Gerar Resumo + Questões (IA)" : "🧠 Generate Summary + Quiz (AI)"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
