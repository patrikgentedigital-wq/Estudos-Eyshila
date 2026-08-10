import React from "react";
import { Sparkles, Brain, Award, RefreshCw, CheckCircle2 } from "lucide-react";
import { Language } from "../../types";

interface FlashcardItem {
  front: string;
  back: string;
}

interface AiFlashcardsProps {
  language: Language;
  flashcards: FlashcardItem[];
  currentCardIdx: number;
  setCurrentCardIdx: React.Dispatch<React.SetStateAction<number>>;
  isCardFlipped: boolean;
  setIsCardFlipped: (flipped: boolean) => void;
  cardFeedback: Record<number, "easy" | "hard">;
  setCardFeedback: React.Dispatch<React.SetStateAction<Record<number, "easy" | "hard">>>;
  flashcardSessionFinished: boolean;
  setFlashcardSessionFinished: (val: boolean) => void;
  flashcardsSaved: boolean;
  handleSaveAllFlashcards: () => void;
  handleResetFlashcards: () => void;
  handleShuffleFlashcards: () => void;
}

export default function AiFlashcards({
  language,
  flashcards,
  currentCardIdx,
  setCurrentCardIdx,
  isCardFlipped,
  setIsCardFlipped,
  cardFeedback,
  setCardFeedback,
  flashcardSessionFinished,
  setFlashcardSessionFinished,
  flashcardsSaved,
  handleSaveAllFlashcards,
  handleResetFlashcards,
  handleShuffleFlashcards,
}: AiFlashcardsProps) {
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center space-y-3">
        <p className="text-slate-500 text-sm">
          {language === "pt" ? "Nenhum flashcard disponível para este material." : "No flashcards available for this study material."}
        </p>
      </div>
    );
  }

  const activeCard = flashcards[currentCardIdx];

  const handleCardRating = (rating: "easy" | "hard") => {
    setCardFeedback((prev) => ({ ...prev, [currentCardIdx]: rating }));
    setIsCardFlipped(false);
    if (currentCardIdx + 1 < flashcards.length) {
      setCurrentCardIdx((prev) => prev + 1);
    } else {
      setFlashcardSessionFinished(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {!flashcardSessionFinished && activeCard ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <span className="bg-sky-500/10 text-sky-500 font-mono font-bold text-xs px-3 py-1 rounded-full border border-sky-500/20">
                CARTÃO {currentCardIdx + 1} DE {flashcards.length}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • {language === "pt" ? "Repetição Espaçada Ativa" : "Active Spaced Repetition"}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono font-bold">
              <span>{Math.round(((currentCardIdx + 1) / flashcards.length) * 100)}%</span>
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div 
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="group cursor-pointer perspective-1000 select-none min-h-[300px] flex flex-col"
          >
            <div className={`relative flex-1 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
              isCardFlipped ? "border-sky-500/30 dark:border-sky-500/30" : "hover:border-slate-300 dark:hover:border-slate-700"
            }`}>
              
              {/* Card Label */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-extrabold font-mono uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                  <Brain className="h-3.5 w-3.5 text-sky-500" />
                  <span>{isCardFlipped ? (language === "pt" ? "VERSO • CONCEITO E GABARITO" : "BACK • EXPLANATION") : (language === "pt" ? "FRENTE • PERGUNTA OU TERMO" : "FRONT • PROMPT")}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-sky-500 transition-colors">
                  {isCardFlipped ? (language === "pt" ? "Clique para desvirar ↺" : "Click to unflip ↺") : (language === "pt" ? "Clique para virar o cartão ↻" : "Click to flip card ↻")}
                </span>
              </div>

              {/* Card Main Text */}
              <div className="py-8 flex items-center justify-center text-center">
                <p className={`font-bold leading-relaxed transition-all ${
                  isCardFlipped 
                    ? "text-slate-800 dark:text-slate-100 text-sm sm:text-base" 
                    : "text-slate-900 dark:text-white text-base sm:text-lg"
                }`}>
                  {isCardFlipped ? activeCard.back : activeCard.front}
                </p>
              </div>

              {/* Bottom Hint */}
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 text-center">
                <span className="text-[10px] font-medium text-slate-400 animate-pulse">
                  {isCardFlipped
                    ? (language === "pt" ? "Avalie sua resposta nos botões abaixo" : "Rate your recall below")
                    : (language === "pt" ? "Toque no cartão para revelar a resposta" : "Tap card to reveal answer")}
                </span>
              </div>

            </div>
          </div>

          {/* Flashcard Action Control Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            {!isCardFlipped ? (
              <button
                id="btn-flashcard-reveal"
                onClick={() => setIsCardFlipped(true)}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{language === "pt" ? "Mostrar Resposta" : "Show Answer"}</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto flex items-center space-x-3 animate-fade-in">
                <button
                  id="btn-flashcard-hard"
                  onClick={() => handleCardRating("hard")}
                  className="flex-1 sm:flex-initial bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>❌ {language === "pt" ? "Não Lembrei (Revisar)" : "Forgot (Review)"}</span>
                </button>
                
                <button
                  id="btn-flashcard-easy"
                  onClick={() => handleCardRating("easy")}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>✓ {language === "pt" ? "Lembrei com Facilidade!" : "Remembered Easily!"}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Flashcards Summary / Finish Screen */
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center space-y-6 animate-fade-in">
          <div className="inline-flex p-4 bg-sky-500/10 text-sky-500 rounded-full animate-bounce">
            <Award className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              {language === "pt" ? "Sessão de Flashcards Concluída!" : "Flashcards Session Complete!"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              {language === "pt"
                ? "Parabéns! Você completou os cartões de memorização ativa para esse assunto. Veja sua taxa de memorização instantânea abaixo."
                : "Awesome! You ran through all the active recall cards. Check your immediate memory rate below."}
            </p>
          </div>

          {/* Memory Metrics */}
          <div className="flex items-center justify-center space-x-8 max-w-md mx-auto py-4 px-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{language === "pt" ? "LEMBREI" : "REMEMBERED"}</span>
              <span className="text-2xl font-black text-sky-500 font-mono mt-0.5">
                {Object.values(cardFeedback).filter(v => v === "easy").length}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{language === "pt" ? "ESQUECI" : "FORGOT"}</span>
              <span className="text-2xl font-black text-rose-500 font-mono mt-0.5">
                {Object.values(cardFeedback).filter(v => v === "hard").length}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{language === "pt" ? "RETENÇÃO" : "RECALL RATE"}</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                {Math.round((Object.values(cardFeedback).filter(v => v === "easy").length / (flashcards.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Mentor comment */}
          <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-left space-y-1 font-medium text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase block tracking-wide">
              {language === "pt" ? "RECOMENDAÇÃO DO MENTOR" : "MENTOR STUDY FEEDBACK"}
            </span>
            <p className="leading-relaxed font-normal">
              {Object.values(cardFeedback).filter(v => v === "easy").length === flashcards.length ? (
                language === "pt" 
                  ? "Excelente! Retenção de 100%! Você dominou as terminologias fundamentais deste documento. Pratique o simulado agora para fechar com chave de ouro!"
                  : "Unbelievable! 100% active recall rate. You have deeply memorized the key terminology. Go take the practice quiz next to cement it!"
              ) : Object.values(cardFeedback).filter(v => v === "easy").length >= 3 ? (
                language === "pt"
                  ? "Bom resultado! Alguns conceitos ainda precisam de reforço. Tente refazer misturando os cartões para memorizar os termos restantes."
                  : "Good job! A few terms are still tricky. Try resetting the deck and shuffling the cards to target your blindspots."
              ) : (
                language === "pt"
                  ? "A memorização requer repetição! Sugerimos revisar o Resumo de Estudo mais uma vez e depois tentar os Flashcards novamente."
                  : "Active recall takes repetition! We suggest reviewing the study summary once more and then retrying these flashcards."
              )}
            </p>
          </div>

          {/* Finish Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              id="btn-flashcard-retry"
              onClick={handleResetFlashcards}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg shadow-sky-600/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{language === "pt" ? "Reiniciar Prática" : "Restart Session"}</span>
            </button>
            <button
              id="btn-flashcard-shuffle-restart"
              onClick={handleShuffleFlashcards}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>🔀 {language === "pt" ? "Misturar e Recomeçar" : "Shuffle & Restart"}</span>
            </button>
            <button
              id="btn-flashcard-save-all"
              onClick={handleSaveAllFlashcards}
              disabled={flashcardsSaved}
              className={`font-bold text-xs py-3 px-6 rounded-xl border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                flashcardsSaved
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-600/10"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{flashcardsSaved ? (language === "pt" ? "Salvo no Meu Banco! ✓" : "Saved to My Bank! ✓") : (language === "pt" ? "💾 Salvar Flashcards no Meu Banco" : "💾 Save Flashcards to My Bank")}</span>
            </button>
          </div>

        </div>
      )}

      {/* Complete flashcard reference list below */}
      {flashcards && flashcards.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350 mb-4 border-b border-slate-50 dark:border-slate-800 pb-3 flex items-center space-x-2">
            <span>📋 {language === "pt" ? "Gabarito de Consulta Rápida" : "Quick Concept Reference"}</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono normal-case">
              ({flashcards.length} {language === "pt" ? "itens" : "cards"})
            </span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((card, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 hover:border-sky-500/20 transition-all space-y-2.5 text-xs text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-sky-500">CARD #{idx + 1}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                </div>
                <div className="space-y-1.5 font-medium">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-slate-400 font-mono text-[10px] font-bold mr-1">[FRENTE]</span>
                    {card.front}
                  </p>
                  <p className="text-slate-500 dark:text-slate-450 text-xs font-normal border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 leading-relaxed">
                    <span className="text-sky-500 font-mono text-[10px] font-bold mr-1">[VERSO]</span>
                    {card.back}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
