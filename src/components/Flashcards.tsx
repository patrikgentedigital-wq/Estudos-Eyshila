import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { Flashcard, Language, TranslationDict } from "../types";

interface FlashcardsProps {
  flashcards: Flashcard[];
  language: Language;
  t: TranslationDict;
}

const Flashcards: React.FC<FlashcardsProps> = ({ flashcards, language, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState(0);

  const currentCard = flashcards[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 50);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 50);
    }
  };

  const toggleMastered = (id: string) => {
    const newMastered = new Set(masteredIds);
    if (newMastered.has(id)) {
      newMastered.delete(id);
    } else {
      newMastered.add(id);
    }
    setMasteredIds(newMastered);
  };

  const progress = ((masteredIds.size) / flashcards.length) * 100;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            {t.flashcardsTitle}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t.flashcardsSubtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Progresso de Domínio
            </p>
            <p className="text-xl font-black text-sky-600 dark:text-sky-400">
              {masteredIds.size} / {flashcards.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
             <div 
              className="absolute bottom-0 left-0 w-full bg-sky-500/20 transition-all duration-500" 
              style={{ height: `${progress}%` }}
            />
            <Trophy className="h-5 w-5 text-sky-500 relative z-10" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative h-[400px] w-full perspective-1000">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full"
            >
              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl p-8 flex flex-col items-center justify-center text-center space-y-6 ${isFlipped ? "pointer-events-none" : ""}`}
                >
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {currentCard.category}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                      currentCard.difficulty === "Easy" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                      currentCard.difficulty === "Medium" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" :
                      "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                    }`}>
                      {currentCard.difficulty === "Easy" ? "Fácil" : currentCard.difficulty === "Medium" ? "Médio" : "Difícil"}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <CreditCard className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight px-4">
                    {currentCard.question}
                  </h3>

                  <div className="absolute bottom-8 text-slate-400 dark:text-slate-500 flex items-center gap-2 text-sm font-medium">
                    <RotateCw className="h-4 w-4 animate-spin-slow" />
                    {t.showAnswerBtn}
                  </div>
                </div>

                <div 
                  className={`absolute inset-0 backface-hidden bg-sky-600 dark:bg-sky-700 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center space-y-6 rotate-y-180 ${!isFlipped ? "pointer-events-none" : ""}`}
                >
                  <div className="absolute top-6 right-6">
                    <Sparkles className="h-6 w-6 text-sky-300/50" />
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200/80">
                      RESPOSTA FUNDAMENTADA
                    </p>
                    <p className="text-xl font-medium text-white leading-relaxed px-4">
                      {currentCard.answer}
                    </p>
                  </div>

                  <div className="absolute bottom-8 text-sky-200/80 flex items-center gap-2 text-sm font-medium">
                    <RefreshCcw className="h-4 w-4" />
                    Clique para virar
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-3">
            <button
              onClick={() => toggleMastered(currentCard.id)}
              className={`flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                masteredIds.has(currentCard.id)
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/50 hover:text-emerald-600"
              }`}
            >
              {masteredIds.has(currentCard.id) ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t.markMasteredBtn}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.markMasteredBtn}
                </>
              )}
            </button>
            
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 max-w-[200px] bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/25 transition-all active:scale-95"
            >
              {isFlipped ? t.prevCardBtn : t.showAnswerBtn}
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-1.5 flex-wrap px-4">
          {flashcards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-sky-500"
                  : masteredIds.has(card.id)
                  ? "w-2 bg-emerald-500/60"
                  : "w-2 bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">
              Repetição Espaçada
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">
              Estudos mostram que revisar conceitos em intervalos crescentes aumenta a retenção a longo prazo em até 80%.
            </p>
          </div>
        </div>
        <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 p-4 rounded-2xl flex gap-3">
          <Sparkles className="h-5 w-5 text-sky-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-sky-900 dark:text-sky-400">
              Meta Cognição
            </h4>
            <p className="text-xs text-sky-700 dark:text-sky-500/80 mt-1">
              Tente responder mentalmente antes de virar o cartão para forçar a recuperação ativa da memória.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Flashcards;
