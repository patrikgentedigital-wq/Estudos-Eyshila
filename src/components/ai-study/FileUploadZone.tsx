import React from "react";
import { UploadCloud, FileText, Sparkles, Brain } from "lucide-react";

interface FileUploadZoneProps {
  file: File | null;
  pastedText: string;
  dragActive: boolean;
  loading: boolean;
  loadingMessage: string;
  errorMsg: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: (text: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onSubmit: () => void;
  onClearFile: () => void;
}

export default function FileUploadZone({
  file,
  pastedText,
  dragActive,
  loading,
  loadingMessage,
  errorMsg,
  fileInputRef,
  onFileChange,
  onTextChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onSubmit,
  onClearFile,
}: FileUploadZoneProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/60 mb-8 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Gerador de Estudos Inteligente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Envie um documento (PDF, TXT) ou cole o texto para que o Gemini elabore resumos, simulados e flashcards.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/20"
            : "border-slate-200 dark:border-slate-700 hover:border-sky-400 bg-slate-50/50 dark:bg-slate-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={onFileChange}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-sky-500" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file.name}
              </p>
              <p className="text-xs text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearFile();
              }}
              className="ml-4 text-xs text-rose-500 hover:underline"
            >
              Remover
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Arraste e solte seu arquivo aqui, ou <span className="text-sky-500 font-semibold">procure no computador</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Suporta PDF, TXT ou Markdown (até 20MB)</p>
          </div>
        )}
      </div>

      {/* Alternative: Text Area */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
          Ou cole o texto do seu estudo abaixo:
        </label>
        <textarea
          rows={3}
          value={pastedText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Cole aqui o artigo, capítulo de livro ou anotações..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      {/* Action Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={loading || (!file && !pastedText.trim())}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? loadingMessage || "Gerando Estudo..." : "Gerar Resumo, Quiz & Flashcards"}
        </button>
      </div>
    </div>
  );
}
