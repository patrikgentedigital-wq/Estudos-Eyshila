import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md animate-slide-up transition-all ${
              isSuccess
                ? "bg-slate-900/95 border-emerald-500/40 text-emerald-300"
                : isError
                ? "bg-slate-900/95 border-rose-500/40 text-rose-300"
                : "bg-slate-900/95 border-sky-500/40 text-sky-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
              <span className="text-xs font-semibold text-slate-100 leading-snug">{t.text}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
