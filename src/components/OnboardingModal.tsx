import React, { useState } from "react";
import { Sparkles, GraduationCap, Clock, Target, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Language } from "../types";

interface OnboardingModalProps {
  language: Language;
  onComplete: (data: { institution: string; hoursPerWeek: number; focusAreas: string[] }) => void;
}

const AVAILABLE_FOCUS = [
  "Legislação do SUS",
  "Código de Ética COFEN",
  "Urgência e UTI",
  "Saúde da Mulher e da Criança",
  "Sinais Vitais e Enfermagem Geral",
  "Farmacologia e Dosagem de Medicamentos"
];

const INSTITUTIONS = [
  { id: "ENARE", name: "ENARE - Exame Nacional de Residência", cutoff: 78 },
  { id: "USP", name: "USP - Universidade de São Paulo", cutoff: 82 },
  { id: "UFRJ", name: "UFRJ - Universidade Federal do Rio de Janeiro", cutoff: 76 },
  { id: "UNICAMP", name: "UNICAMP - Universidade Estadual de Campinas", cutoff: 80 },
  { id: "Outras", name: "Outras Instituições Nacionais", cutoff: 75 }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ language, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("ENARE");
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    "Legislação do SUS",
    "Urgência e UTI"
  ]);

  const toggleFocus = (item: string) => {
    if (selectedFocus.includes(item)) {
      setSelectedFocus(prev => prev.filter(f => f !== item));
    } else {
      setSelectedFocus(prev => [...prev, item]);
    }
  };

  const handleFinish = () => {
    const instObj = INSTITUTIONS.find(i => i.id === selectedInstitution);
    onComplete({
      institution: instObj ? instObj.name : selectedInstitution,
      hoursPerWeek: weeklyHours,
      focusAreas: selectedFocus
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Container Principal Glassmorphic */}
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-900/20 text-slate-100 overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 text-white">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200">
                {language === "en" ? "Welcome to Study Portal!" : "Bem-vindo ao Portal Eyshila Caxias!"}
              </h2>
              <p className="text-xs text-slate-400">
                {language === "en" ? "Let's personalize your study plan in 3 steps" : "Vamos personalizar seu plano de estudos em 3 passos simples"}
              </p>
            </div>
          </div>

          {/* Indicador de Passo */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-gradient-to-r from-purple-500 to-cyan-400" : s < step ? "w-2 bg-purple-500/50" : "w-2 bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo dos Passos */}
        <div className="relative z-10 min-h-[300px] flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold">
                <GraduationCap className="h-5 w-5" />
                <span>Passo 1 de 3: Escolha sua Instituição / Alvo Principal</span>
              </div>
              <p className="text-xs text-slate-400">
                Defina onde você quer conquistar a sua vaga para ajustarmos as metas de corte:
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                {INSTITUTIONS.map((inst) => {
                  const isSelected = selectedInstitution === inst.id;
                  return (
                    <button
                      key={inst.id}
                      onClick={() => setSelectedInstitution(inst.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10 text-white"
                          : "bg-slate-800/40 border-white/5 hover:border-white/20 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-medium">{inst.name}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isSelected ? "bg-purple-500/30 text-purple-200 border border-purple-400/40" : "bg-slate-700/50 text-slate-400"}`}>
                        Corte ~{inst.cutoff}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                <Clock className="h-5 w-5" />
                <span>Passo 2 de 3: Meta de Horas Semanais</span>
              </div>
              <p className="text-xs text-slate-400">
                Quantas horas por semana você consegue dedicar aos estudos e resoluções de questões?
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Dedicação Semanal:</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                    {weeklyHours} horas / semana
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>5h (Estudo leve)</span>
                  <span>20h (Recomendado)</span>
                  <span>40h (Intensivo)</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-pink-300 text-sm font-semibold">
                <Target className="h-5 w-5" />
                <span>Passo 3 de 3: Áreas de Maior Prioridade</span>
              </div>
              <p className="text-xs text-slate-400">
                Selecione as disciplinas que você deseja dar maior foco no seu cronograma inicial:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {AVAILABLE_FOCUS.map((focus) => {
                  const isChecked = selectedFocus.includes(focus);
                  return (
                    <button
                      key={focus}
                      onClick={() => toggleFocus(focus)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        isChecked
                          ? "bg-pink-950/40 border-pink-500/60 text-white shadow-md shadow-pink-500/10"
                          : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-medium">{focus}</span>
                      {isChecked && <CheckCircle2 className="h-4 w-4 text-pink-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rodapé com Navegação */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
            {step > 1 ? (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/30 transition"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 transition"
              >
                Concluir & Iniciar Estudos Zerados 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
