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
  Sparkles,
  Play,
  Pause,
  Layers,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { Flashcard, Language, ReviewRating, TranslationDict } from "../types";
import { OFFICIAL_FLASHCARDS } from "../data/officialFlashcards";
import { useTTS } from "../hooks/useTTS";

interface FlashcardsProps {
  flashcards: Flashcard[];
  language: Language;
  t: TranslationDict;
  onAddFlashcard?: (newCard: Flashcard) => void;
  onDeleteFlashcard?: (id: string) => void;
  onReviewFlashcard?: (card: Flashcard, rating: ReviewRating) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ flashcards, language, t, onAddFlashcard, onDeleteFlashcard, onReviewFlashcard }) => {
  const [filter, setFilter] = useState<"all" | "official" | "my_cards">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Legislação do SUS");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const { speak, stop, supported: ttsSupported } = useTTS();

  // Combine custom & official flashcards avoiding duplicate IDs
  const existingIds = new Set(flashcards.map(f => f.id));
  const uniqueOfficial = OFFICIAL_FLASHCARDS.filter(of => !existingIds.has(of.id));
  const allAvailable = [...flashcards, ...uniqueOfficial];

  const activeDeck = allAvailable.filter(f => {
    if (filter === "official") return f.isOfficial;
    if (filter === "my_cards") return !f.isOfficial;
    return true;
  });

  const today = new Date().toISOString().slice(0, 10);
  const dueDeck = activeDeck.filter(card => !card.nextReview || card.nextReview <= today);
  const reviewDeck = dueDeck.length > 0 ? dueDeck : activeDeck;
  const reviewedCount = activeDeck.filter(card => Boolean(card.nextReview && card.nextReview > today)).length;

  const currentCard = reviewDeck[currentIndex] || reviewDeck[0];
  
  // reset index on filter change
  React.useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filter]);

  if (!currentCard) {
    return (
      <div className="space-y-6">
        <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px space-x-6 text-sm font-semibold">
          <button onClick={() => setFilter("all")} className={`pb-3 transition-all border-b-2 ${filter === "all" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Todos os Flashcards</button>
          <button onClick={() => setFilter("official")} className={`pb-3 transition-all border-b-2 ${filter === "official" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Banco de referência</button>
          <button onClick={() => setFilter("my_cards")} className={`pb-3 transition-all border-b-2 ${filter === "my_cards" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Meus cartões</button>
        </div>
        <div className="text-center py-12 text-slate-400">Nenhum flashcard disponível neste filtro.</div>
      </div>
    );
  }
  
  const handleNext = () => {
    if (currentIndex < reviewDeck.length - 1) {
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

  const progress = (reviewedCount / (activeDeck.length || 1)) * 100;

  if (activeDeck.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-3 tracking-tight">
              <Layers className="h-8 w-8 text-sky-500" />
              <span>{t.flashcardsTitle}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t.flashcardsSubtitle}</p>
          </div>
        </div>
        
        <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px space-x-6 text-sm font-semibold mb-6">
          <button onClick={() => setFilter("all")} className={`pb-3 transition-all border-b-2 ${filter === "all" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Meus Flashcards</button>
          <button onClick={() => setFilter("official")} className={`pb-3 transition-all border-b-2 ${filter === "official" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Banco de referência</button>
        </div>

        <div className="text-center py-12 text-slate-400">Nenhum flashcard encontrado.</div>
      </div>
    );
  }

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
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex-1">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-800 dark:text-slate-200">Seu Domínio</span>
              <span className="text-sky-600 dark:text-sky-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center space-x-4 font-bold text-sm text-slate-500 dark:text-slate-400">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <span className="text-slate-900 dark:text-white">{reviewedCount}</span> revisados
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <span className="text-slate-900 dark:text-white">{dueDeck.length}</span> para revisar
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-px text-sm font-semibold">
          <div className="flex space-x-6">
            <button onClick={() => setFilter("all")} className={`pb-3 transition-all border-b-2 ${filter === "all" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Todos os Flashcards</button>
            <button onClick={() => setFilter("official")} className={`pb-3 transition-all border-b-2 ${filter === "official" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Banco de referência</button>
            <button onClick={() => setFilter("my_cards")} className={`pb-3 transition-all border-b-2 ${filter === "my_cards" ? "border-sky-500 text-sky-600 dark:text-sky-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Meus Flashcards</button>
          </div>

          {onAddFlashcard && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 mb-2 sm:mb-0 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition"
            >
              <Plus className="h-4 w-4" />
              + Criar Flashcard
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative h-[400px] w-full perspective-1000">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentCard.id}
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
                role="button"
                tabIndex={0}
                aria-label={isFlipped ? "Mostrar pergunta do flashcard" : "Mostrar resposta do flashcard"}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsFlipped(prev => !prev);
                  }
                }}
              >
                <div 
                  className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl p-8 flex flex-col items-center justify-center text-center space-y-6 ${isFlipped ? "pointer-events-none" : ""}`}
                >
                    <div className="flex items-center justify-between mb-8 w-full">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        currentCard.difficulty === "Easy" ? "bg-teal-500/10 text-teal-600" :
                        currentCard.difficulty === "Medium" ? "bg-amber-500/10 text-amber-600" :
                        "bg-rose-500/10 text-rose-600"
                      }`}>
                        {currentCard.difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        {ttsSupported && (
                          <button onClick={(e) => { e.stopPropagation(); speak(language === "pt" ? currentCard.question : currentCard.questionEn || currentCard.question); }} className="text-slate-400 hover:text-sky-500 p-2">
                            Ouvir <Play className="h-3 w-3 inline" />
                          </button>
                        )}
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase">
                          {currentCard.categoryEn ? (language === "pt" ? currentCard.category : currentCard.categoryEn) : currentCard.category}
                        </span>
                      </div>
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

          <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-sm font-bold text-slate-400">
              {currentIndex + 1} / {reviewDeck.length}
            </span>
            {isFlipped ? (
              <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 animate-fade-in">
                <button
                  onClick={() => {
                    onReviewFlashcard?.(currentCard, "again");
                    handleNext();
                  }}
                  className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 flex flex-col items-center"
                >
                  <span>Errei</span>
                  <span className="text-[9px] opacity-75">Reiniciar intervalo</span>
                </button>
                <button
                  onClick={() => {
                    onReviewFlashcard?.(currentCard, "hard");
                    handleNext();
                  }}
                  className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 flex flex-col items-center"
                >
                  <span>Difícil</span>
                  <span className="text-[9px] opacity-75">Lembrei com esforço</span>
                </button>
                <button
                  onClick={() => {
                    onReviewFlashcard?.(currentCard, "good");
                    handleNext();
                  }}
                  className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 flex flex-col items-center"
                >
                  <span>Bom</span>
                  <span className="text-[9px] opacity-75">Lembrei corretamente</span>
                </button>
                <button
                  onClick={() => {
                    onReviewFlashcard?.(currentCard, "easy");
                    handleNext();
                  }}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 flex flex-col items-center"
                >
                  <span>Fácil</span>
                  <span className="text-[9px] opacity-75">Resposta imediata</span>
                </button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-center gap-3">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex-1 max-w-[280px] bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-sky-600/25 transition-all active:scale-95"
                >
                  {t.showAnswerBtn}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === reviewDeck.length - 1}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-1.5 flex-wrap px-4">
          {reviewDeck.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-sky-500"
                  : card.nextReview && card.nextReview > today
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
              O intervalo é recalculado pelo desempenho, tipo de conteúdo e criticidade. Fatos e protocolos de alto risco voltam antes; casos clínicos usam intervalos maiores e variações do mesmo objetivo.
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

      {/* Modal de Criação de Flashcard */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Criar Flashcard Personalizado</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newQuestion.trim() || !newAnswer.trim()) return;
              const newCard: Flashcard = {
                id: "custom-fc-" + Date.now(),
                question: newQuestion.trim(),
                answer: newAnswer.trim(),
                category: newCategory,
                difficulty: newDifficulty,
                isOfficial: false,
                isCustom: true
              };
              if (onAddFlashcard) onAddFlashcard(newCard);
              setNewQuestion("");
              setNewAnswer("");
              setIsCreateModalOpen(false);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Pergunta / Conceito (Frente)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ex: Quais são os princípios doutrinários do SUS?"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Resposta Fundamentada (Verso)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Ex: Universalidade, Equidade e Integralidade."
                  className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Disciplina / Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Legislação do SUS">Legislação do SUS</option>
                    <option value="Código de Ética COFEN">Código de Ética COFEN</option>
                    <option value="Urgência e UTI">Urgência e UTI</option>
                    <option value="Saúde da Mulher">Saúde da Mulher</option>
                    <option value="Enfermagem Geral">Enfermagem Geral</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Fácil (Easy)</option>
                    <option value="Medium">Médio (Medium)</option>
                    <option value="Hard">Difícil (Hard)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20"
                >
                  Salvar Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
