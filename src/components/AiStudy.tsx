import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  BookOpen, 
  Award, 
  Brain, 
  Clock, 
  AlertTriangle,
  Headphones,
  GraduationCap,
  Play
} from "lucide-react";
import { useTTS } from "../hooks/useTTS";
import { exportToPrintablePdf } from "../utils/pdfExport";
import { supabase } from "../supabase";
import { Language, Flashcard as GlobalFlashcard, CadernoErroItem } from "../types";
import { jsPDF } from "jspdf";

// Sub-components
import AiUploadModal from "./ai-study/AiUploadModal";
import AiAudioPlayer from "./ai-study/AiAudioPlayer";
import AiFlashcards from "./ai-study/AiFlashcards";
import AiQuiz from "./ai-study/AiQuiz";
import AiSummary from "./ai-study/AiSummary";

interface AiStudyProps {
  language: Language;
  onSaveFlashcards?: (newCards: GlobalFlashcard[]) => void;
  onSaveCadernoError?: (item: CadernoErroItem) => void;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  leadIn?: string;
  cognitiveType?: "factual" | "protocol" | "clinical_reasoning";
  clinicalCase?: {
    setting?: string;
    ageGroup?: string;
    presentingProblem?: string;
    history?: string;
    physicalExam?: string;
    vitals?: Record<string, string>;
    labs?: Record<string, string>;
  };
  pivotalCues?: string[];
  reasoningSteps?: string[];
  distractorExplanations?: string[];
  source?: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface GeneratedStudy {
  summary: string;
  questions: Question[];
  flashcards: Flashcard[];
}

async function getApiHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return headers;
}

export default function AiStudy({ language, onSaveFlashcards, onSaveCadernoError }: AiStudyProps) {
  const [flashcardsSaved, setFlashcardsSaved] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState<Record<number, boolean>>({});

  // TTS Hook
  const { speak, pause, resume, stop, isSpeaking, isPaused, rate, setRate, progressPercent } = useTTS();

  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "quiz" | "flashcards" | "full-audio">("summary");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fullPdfText, setFullPdfText] = useState<string>("");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [studyData, setStudyData] = useState<GeneratedStudy | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Interactive Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  // Interactive Flashcards States
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardFeedback, setCardFeedback] = useState<Record<number, "easy" | "hard">>({});
  const [flashcardSessionFinished, setFlashcardSessionFinished] = useState(false);

  // AI Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadingMessages = language === "pt" ? [
    "Lendo o arquivo enviado...",
    "Extraindo conceitos centrais de estudo...",
    "A IA está estruturando o resumo didático...",
    "Sintetizando diretrizes e legislações aplicáveis...",
    "Elaborando questões personalizadas no padrão ENARE...",
    "Revisando fundamentações e condutas de enfermagem..."
  ] : [
    "Reading uploaded file...",
    "Extracting core learning concepts...",
    "The AI is building your custom study summary...",
    "Synthesizing nursing board guidelines...",
    "Creating mock exam questions...",
    "Formulating detailed clinical rationale..."
  ];

  useEffect(() => {
    let interval: any = null;
    if (loading) {
      let idx = 0;
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[idx]);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading, language]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        resolve(base64Str.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleReadFullPdf = async () => {
    setErrorMsg(null);
    if (!file && !pastedText.trim()) {
      setErrorMsg(language === "pt"
        ? "Selecione um arquivo PDF/TXT ou cole um texto para ouvir a narração na íntegra."
        : "Select a PDF/TXT file or paste text to hear full audio narration.");
      return;
    }

    setIsExtractingPdf(true);
    setLoadingMessage("Extraindo texto completo do PDF para narração...");
    try {
      let extracted = "";
      if (file) {
        if (file.name.toLowerCase().endsWith(".txt")) {
          extracted = await file.text();
        } else {
          const base64 = await fileToBase64(file);
          const res = await fetch("/api/extract-pdf-text", {
            method: "POST",
            headers: await getApiHeaders(),
            body: JSON.stringify({ fileData: base64, fileName: file.name, mimeType: "application/pdf" }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.status === 401 && supabase) {
            supabase.auth.signOut();
          }
          if (!res.ok) throw new Error(data.error || "Não foi possível extrair o texto do PDF.");
          extracted = data.text || "";
        }
      } else {
        extracted = pastedText;
      }

      if (!extracted || extracted.trim().length < 10) {
        throw new Error("Não foi possível extrair texto do PDF enviado. O arquivo pode ser uma imagem digitalizada sem camada de texto.");
      }

      setFullPdfText(extracted);
      setIsUploadModalOpen(false);
      setActiveSubTab("full-audio");
      setIsExtractingPdf(false);
      speak(extracted, rate);
    } catch (err: any) {
      console.error(err);
      setIsExtractingPdf(false);
      setErrorMsg(err.message || "Erro ao processar PDF para áudio.");
    }
  };

  const handleChatSearch = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat-study", {
        method: "POST",
        headers: await getApiHeaders(),
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) {
        let errorMessage = `Erro ${res.status}`;
        if (res.status === 401 && supabase) {
          supabase.auth.signOut();
          errorMessage = "Sua sessão expirou. Faça login novamente para usar o mentor.";
        }
        try {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data.error) errorMessage = data.error;
          } catch (e) {
            errorMessage = `Erro ${res.status}: ${text.substring(0, 150)}...`;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: "ai", content: `${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLoadExample = () => {
    const exampleData: GeneratedStudy = {
      summary: `### Lei Orgânica da Saúde - Lei 8.080 de 1990

A **Lei nº 8.080/1990** é o pilar do Sistema Único de Saúde (SUS) no Brasil. Ela regulamenta, em todo o território nacional, as ações e serviços de saúde, executados isolada ou conjuntamente, em caráter permanente ou eventual, por pessoas físicas ou jurídicas de direito público ou privado.

#### 1. Princípios Doutrinários do SUS (Fundamentais para Provas)
*   **Universalidade de Acesso:** Direito à assistência à saúde para todo e qualquer cidadão, sem qualquer distinção ou barreira. A saúde é um direito de todos e dever do Estado.
*   **Integralidade da Assistência:** Entende o indivíduo como um todo. Engloba ações de promoção, proteção, prevenção e recuperação da saúde de forma integrada e contínua.
*   **Equidade:** Tratar de forma desigual os desiguais, direcionando mais recursos e atenção a quem mais precisa para reduzir desigualdades sociais e regionais.

#### 2. Princípios Organizativos do SUS
*   **Descentralização:** Redistribuição das responsabilidades de gestão para os municípios (municipalização), aproximando o serviço de saúde da população.
*   **Regionalização e Hierarquização:** Organização dos serviços em níveis de complexidade crescente (Atenção Primária, Secundária e Terciária) estruturados em regiões de saúde integradas.
*   **Participação da Comunidade:** Controle social garantido por lei através dos Conselhos e Conferências de Saúde (detalhado posteriormente pela Lei 8.142/90).

#### 3. Campo de Atuação do SUS
O SUS vai muito além do atendimento hospitalar clássico. Seu campo de atuação envolve:
1.  **Vigilância Sanitária:** Controle de bens, produtos, serviços e ambientes que se relacionem com a saúde.
2.  **Vigilância Epidemiológica:** Detecção, prevenção e controle de doenças transmissíveis e agravos à saúde.
3.  **Saúde do Trabalhador:** Proteção e recuperação da saúde dos trabalhadores expostos a riscos ocupacionais.
4.  **Assistência Terapêutica Integral:** Incluindo a assistência farmacêutica de forma completa.`,
      questions: [
        {
          question: "De acordo com os princípios descritos na Lei Federal nº 8.080/1990, a garantia de atenção à saúde, sem preconceitos ou privilégios de qualquer espécie, priorizando o direcionamento de esforços para quem mais necessita, refere-se a qual princípio?",
          options: [
            "A) Universalidade de acesso aos serviços de saúde.",
            "B) Descentralização político-administrativa municipal.",
            "C) Equidade na distribuição de ações e recursos.",
            "D) Integralidade da assistência à saúde."
          ],
          answer: "C",
          explanation: "A equidade é o princípio de justiça social que visa dar tratamento desigual aos desiguais para compensar desvantagens. Ela assegura que a atenção seja direcionada às necessidades específicas de cada população ou indivíduo, priorizando os mais vulneráveis."
        },
        {
          question: "A Lei nº 8.080/1990 regulamenta as ações e serviços de saúde em todo o território nacional. Qual das seguintes alternativas NÃO representa uma área de atuação direta do campo de vigilância sanitária?",
          options: [
            "A) Controle sanitário do transporte, guarda e utilização de substâncias radioativas.",
            "B) Controle de endemias transmissíveis, como dengue e malária em áreas urbanas.",
            "C) Fiscalização de alimentos, bebidas e águas para consumo humano.",
            "D) Controle de qualidade de serviços prestados por clínicas de radiologia privadas."
          ],
          answer: "B",
          explanation: "O controle de endemias transmissíveis (como o monitoramento de vetores de dengue e malária) é uma ação típica da Vigilância Epidemiológica, não da Vigilância Sanitária."
        },
        {
          question: "A descentralização político-administrativa é um dos princípios organizativos do SUS descritos na Lei nº 8.080/1990. Ela estabelece uma ênfase na:",
          options: [
            "A) Centralização de decisões a nível federal para garantir uniformidade nacional.",
            "B) Delegação exclusiva de serviços para a iniciativa privada sem fins lucrativos.",
            "C) Municipalização dos serviços de saúde para aproximar a gestão do cidadão.",
            "D) Extinção da atuação do Ministério da Saúde na formulação de políticas públicas."
          ],
          answer: "C",
          explanation: "A descentralização distribui o poder de gestão do nível federal para os estados e municípios, tendo como diretriz principal a municipalização dos serviços de saúde."
        }
      ],
      flashcards: [
        {
          front: "Qual a diferença principal entre os princípios doutrinários de Universalidade e Equidade no SUS?",
          back: "Universalidade garante acesso à saúde a TODOS sem distinção. Equidade é oferecer mais recursos a quem mais precisa para reduzir disparidades."
        },
        {
          front: "A municipalização dos serviços de saúde do SUS é fundamentada em qual princípio organizativo?",
          back: "Princípio da Descentralização político-administrativa."
        },
        {
          front: "O monitoramento do vetor da Dengue é competência de qual Vigilância do SUS?",
          back: "Vigilância Epidemiológica (controle e detecção de doenças transmissíveis)."
        }
      ]
    };

    setStudyData(exampleData);
    setActiveSubTab("summary");
    setErrorMsg(null);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted({});
    setQuizFinished(false);
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setCardFeedback({});
    setFlashcardSessionFinished(false);
  };

  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

  const acceptStudyFile = (candidate: File) => {
    const ext = candidate.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "txt") {
      setErrorMsg(language === "pt" ? "Por favor, anexe apenas arquivos PDF ou TXT." : "Please attach only PDF or TXT files.");
      return false;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(language === "pt" ? "O arquivo excede o limite de 10 MB." : "The file exceeds 10 MB.");
      return false;
    }
    setFile(candidate);
    setErrorMsg(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      acceptStudyFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      acceptStudyFile(e.target.files[0]);
    }
  };

  const handleGenerateStudy = async () => {
    setErrorMsg(null);
    if (!file && !pastedText.trim()) {
      setErrorMsg(language === "pt" 
        ? "Por favor, anexe um arquivo PDF/TXT ou cole um texto de estudos." 
        : "Please upload a PDF/TXT file or paste your study material.");
      return;
    }

    setLoading(true);
    setLoadingMessage(language === "pt" ? "Extraindo e analisando conteúdo do arquivo..." : "Extracting file content...");

    try {
      let payload: any = {};
      if (file) {
        const base64 = await fileToBase64(file);
        payload = {
          fileData: base64,
          fileName: file.name,
          mimeType: file.type || (file.name.endsWith(".txt") ? "text/plain" : "application/pdf")
        };
      } else {
        payload = { text: pastedText };
      }

      const res = await fetch("/api/generate-study", {
        method: "POST",
        headers: await getApiHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = "HTTP error " + res.status;
        if (res.status === 401 && supabase) {
          supabase.auth.signOut();
          errorMessage = "Sua sessão expirou. Faça login novamente para gerar o material.";
        }
        try {
          const text = await res.text();
          try {
            const errorData = JSON.parse(text);
            if (errorData.error) errorMessage = errorData.error;
          } catch (e) {
            errorMessage = `HTTP error ${res.status}: ${text.substring(0, 150)}...`;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const rawQuestions = Array.isArray(data.questions) ? data.questions : (Array.isArray(data.quiz) ? data.quiz : []);
      const rawFlashcards = Array.isArray(data.flashcards) ? data.flashcards : (Array.isArray(data.cards) ? data.cards : []);
      const alphabet = ["A", "B", "C", "D", "E"];

      const normalizedQuestions = rawQuestions.map((q: any, qIdx: number) => {
        const rawOptions = Array.isArray(q.options) ? q.options : ["Opção A", "Opção B", "Opção C", "Opção D", "Opção E"];
        const cleanedOptions = rawOptions.map((opt: string, optIdx: number) => {
          const letter = alphabet[optIdx] || "A";
          const textWithoutPrefix = String(opt).replace(/^[A-E][\)\.\:\-]\s*/i, "").trim();
          return `${letter}) ${textWithoutPrefix}`;
        });

        let cleanAnswer = "A";
        if (typeof q.answer === "string") {
          const match = q.answer.match(/[A-E]/i);
          if (match) cleanAnswer = match[0].toUpperCase();
        } else if (typeof q.answer === "number" && q.answer >= 0 && q.answer < 5) {
          cleanAnswer = alphabet[q.answer];
        }

        return {
          question: q.question || q.title || `Questão ${qIdx + 1}`,
          options: cleanedOptions,
          answer: cleanAnswer,
          explanation: q.explanation || "Fundamentação didática disponível.",
          leadIn: q.leadIn,
          cognitiveType: q.cognitiveType,
          clinicalCase: q.clinicalCase,
          pivotalCues: Array.isArray(q.pivotalCues) ? q.pivotalCues : [],
          reasoningSteps: Array.isArray(q.reasoningSteps) ? q.reasoningSteps : [],
          distractorExplanations: Array.isArray(q.distractorExplanations) ? q.distractorExplanations : [],
          source: q.source,
        };
      });

      const normalizedFlashcards = rawFlashcards.map((f: any, fIdx: number) => ({
        front: f.front || f.question || f.term || `Conceito ${fIdx + 1}`,
        back: f.back || f.answer || f.definition || "Definição não disponível."
      }));

      setStudyData({
        summary: data.summary || "Resumo de estudos gerado pela Inteligência Artificial.",
        questions: normalizedQuestions.length > 0 ? normalizedQuestions : [],
        flashcards: normalizedFlashcards.length > 0 ? normalizedFlashcards : []
      });
      setIsUploadModalOpen(false);
      setActiveSubTab("summary");
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setQuizSubmitted({});
      setQuizFinished(false);
      setCurrentCardIdx(0);
      setIsCardFlipped(false);
      setCardFeedback({});
      setFlashcardSessionFinished(false);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(language === "pt" 
        ? `Ocorreu um erro ao gerar o material: ${err.message || err}. Tente utilizar o Material de Exemplo para testar.`
        : `An error occurred while generating material: ${err.message || err}. Try loading the Example Material to test.`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted({});
    setQuizFinished(false);
  };

  const handleResetFlashcards = () => {
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setCardFeedback({});
    setFlashcardSessionFinished(false);
  };

  const handleSaveAllFlashcards = () => {
    if (!studyData?.flashcards || !onSaveFlashcards || flashcardsSaved) return;
    const globalCards: GlobalFlashcard[] = studyData.flashcards.map((f, i) => ({
      id: `ai-fc-${Date.now()}-${i}`,
      question: f.front,
      answer: f.back,
      category: "Estudos com IA",
      difficulty: "Medium",
      isCustom: true,
    }));
    onSaveFlashcards(globalCards);
    setFlashcardsSaved(true);
  };

  const handleSaveQuestionToNotebook = (idx: number) => {
    if (!studyData?.questions?.[idx] || !onSaveCadernoError) return;
    const q = studyData.questions[idx];
    const item: CadernoErroItem = {
      id: `ai-err-${Date.now()}-${idx}`,
      questionText: q.question,
      explanation: q.explanation,
      category: "Estudos com IA",
      dateAdded: new Date().toISOString(),
      correctAnswer: q.answer,
      options: q.options,
    };
    onSaveCadernoError(item);
    setSavedQuestions(prev => ({ ...prev, [idx]: true }));
  };

  const handleShuffleFlashcards = () => {
    if (!studyData || !studyData.flashcards) return;
    const shuffled = [...studyData.flashcards].sort(() => Math.random() - 0.5);
    setStudyData({ ...studyData, flashcards: shuffled });
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setCardFeedback({});
    setFlashcardSessionFinished(false);
  };

  const downloadSummaryPDF = () => {
    if (!studyData || !studyData.summary) return;
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let y = 25;

      doc.setFillColor(14, 165, 233);
      doc.rect(margin, y, maxWidth, 18, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(language === "pt" ? "RESUMO DE ESTUDOS INTELIGENTE" : "INTELLIGENT STUDY SUMMARY", margin + 5, y + 11);
      y += 28;

      const lines = studyData.summary.split("\n");
      lines.forEach((line) => {
        const text = line.replace(/\*\*/g, "").replace(/^#+\s*/, "").replace(/^[\*\-]\s*/, "• ");
        if (!text.trim()) {
          y += 4;
          return;
        }
        doc.setFont("helvetica", line.startsWith("#") ? "bold" : "normal");
        doc.setFontSize(line.startsWith("#") ? 12 : 9.5);
        doc.setTextColor(line.startsWith("#") ? 15 : 71, line.startsWith("#") ? 23 : 85, line.startsWith("#") ? 42 : 105);
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, margin, y);
        y += splitText.length * 5 + 2;
      });

      doc.save(language === "pt" ? `resumo-estudos-ia-${Date.now()}.pdf` : `ai-study-summary-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar PDF.");
    }
  };

  const correctAnswersCount = studyData 
    ? studyData.questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 text-sky-500 font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{language === "pt" ? "Co-Piloto de Inteligência Artificial" : "AI Study Co-Pilot"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === "pt" ? "Estudos com IA & Gerador de Simulados" : "AI Study & Exam Generator"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            {language === "pt" 
              ? "Anexe um PDF ou cole o texto de estudo. Nossa IA irá estruturar resumos didáticos, questões no padrão ENARE e cartões de memorização ativa."
              : "Upload a PDF or paste text. Our AI generates summaries, ENARE mock questions and active recall flashcards."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleLoadExample}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <GraduationCap className="h-4 w-4 text-sky-500" />
            <span>{language === "pt" ? "Testar Exemplo (Lei 8.080)" : "Test Example (Law 8080)"}</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-lg shadow-sky-600/20 hover:shadow-sky-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>{studyData ? (language === "pt" ? "+ Anexar / Trocar PDF" : "+ Upload New PDF") : (language === "pt" ? "Anexar PDF / Texto" : "Upload PDF / Text")}</span>
          </button>
        </div>
      </div>

      {errorMsg && !isUploadModalOpen && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs sm:text-sm flex items-start space-x-2.5 shadow-xs">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold leading-relaxed">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="font-extrabold text-xs cursor-pointer">✕</button>
        </div>
      )}

      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 shadow-xs text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{loadingMessage}</p>
          <p className="text-xs text-slate-400 font-medium">Isso pode levar alguns segundos dependendo do tamanho do texto.</p>
        </div>
      )}

      {!studyData && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 shadow-xs text-center space-y-6">
          <div className="p-4 bg-sky-500/10 text-sky-500 w-fit rounded-full mx-auto">
            <Brain className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {language === "pt" ? "Nenhum material carregado ainda" : "No study material loaded"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {language === "pt"
                ? "Clique no botão 'Anexar PDF / Texto' no topo para enviar seus resumos, leis ou apostilas, ou clique em 'Testar Exemplo' para experimentar."
                : "Click 'Upload PDF / Text' or 'Test Example' to get started."}
            </p>
          </div>
        </div>
      )}

      {studyData && !loading && (
        <div className="space-y-6">
          
          {/* SubTab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveSubTab("summary")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                activeSubTab === "summary"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>{language === "pt" ? "Resumo Didático" : "Study Summary"}</span>
            </button>

            <button
              onClick={() => setActiveSubTab("quiz")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                activeSubTab === "quiz"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>{language === "pt" ? "Simulado Interativo" : "Practice Quiz"} ({studyData.questions.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("flashcards")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                activeSubTab === "flashcards"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{language === "pt" ? "Flashcards" : "Flashcards"} ({studyData.flashcards.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("full-audio")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                activeSubTab === "full-audio"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Headphones className="h-4 w-4" />
              <span>{language === "pt" ? "Audiobook Completo" : "Full Audiobook"}</span>
            </button>
          </div>

          {/* Render Active SubTab */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            <div className="lg:col-span-3 space-y-6">
              
              {activeSubTab === "summary" && (
                <AiSummary
                  language={language}
                  summary={studyData.summary}
                  file={file}
                  isSpeaking={isSpeaking}
                  isPaused={isPaused}
                  rate={rate}
                  setRate={setRate}
                  speak={speak}
                  pause={pause}
                  resume={resume}
                  stop={stop}
                  handleExportPdf={downloadSummaryPDF}
                  handlePrint={() => exportToPrintablePdf(studyData.summary, file ? file.name : "Resumo de Estudos")}
                  setActiveSubTab={setActiveSubTab}
                />
              )}

              {activeSubTab === "quiz" && (
                <AiQuiz
                  language={language}
                  questions={studyData.questions}
                  currentQuestionIdx={currentQuestionIdx}
                  setCurrentQuestionIdx={setCurrentQuestionIdx}
                  selectedAnswers={selectedAnswers}
                  setSelectedAnswers={setSelectedAnswers}
                  quizSubmitted={quizSubmitted}
                  setQuizSubmitted={setQuizSubmitted}
                  quizFinished={quizFinished}
                  setQuizFinished={setQuizFinished}
                  savedQuestions={savedQuestions}
                  handleSaveQuestionToNotebook={handleSaveQuestionToNotebook}
                  handleRetryQuiz={handleResetQuiz}
                  setActiveSubTab={setActiveSubTab}
                />
              )}

              {activeSubTab === "flashcards" && (
                <AiFlashcards
                  language={language}
                  flashcards={studyData.flashcards}
                  currentCardIdx={currentCardIdx}
                  setCurrentCardIdx={setCurrentCardIdx}
                  isCardFlipped={isCardFlipped}
                  setIsCardFlipped={setIsCardFlipped}
                  cardFeedback={cardFeedback}
                  setCardFeedback={setCardFeedback}
                  flashcardSessionFinished={flashcardSessionFinished}
                  setFlashcardSessionFinished={setFlashcardSessionFinished}
                  flashcardsSaved={flashcardsSaved}
                  handleSaveAllFlashcards={handleSaveAllFlashcards}
                  handleResetFlashcards={handleResetFlashcards}
                  handleShuffleFlashcards={handleShuffleFlashcards}
                />
              )}

              {activeSubTab === "full-audio" && (
                <AiAudioPlayer
                  language={language}
                  file={file}
                  fullPdfText={fullPdfText}
                  summaryText={studyData.summary}
                  isSpeaking={isSpeaking}
                  isPaused={isPaused}
                  rate={rate}
                  setRate={setRate}
                  progressPercent={progressPercent}
                  speak={speak}
                  pause={pause}
                  resume={resume}
                  stop={stop}
                />
              )}

            </div>

            {/* Right sidebar: Quick stats */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 border-b border-slate-50 dark:border-slate-800 pb-3">
                  <Brain className="h-4.5 w-4.5 text-sky-500 animate-pulse" />
                  <span>{language === "pt" ? "Dados de Retenção" : "Cognitive Metrics"}</span>
                </h4>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{language === "pt" ? "Questões Respondidas:" : "Questions Answered:"}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {Object.keys(quizSubmitted).length} / {studyData.questions.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{language === "pt" ? "Taxa de Acerto:" : "Current Accuracy:"}</span>
                    <span className="font-bold text-sky-500 font-mono">
                      {Object.keys(quizSubmitted).length > 0 
                        ? `${Math.round((correctAnswersCount / Object.keys(quizSubmitted).length) * 100)}%`
                        : "0%"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{language === "pt" ? "Complexidade estimada:" : "Complexity level:"}</span>
                    <span className="bg-sky-500/10 text-sky-500 font-bold px-2 py-0.5 rounded-md text-[10px] font-mono">
                      ENARE R1
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800/85">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">{language === "pt" ? "PROCESSO DE APRENDIZADO" : "LEARNING DECK PROGRESS"}</span>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${(Object.keys(quizSubmitted).length / (studyData.questions.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-black text-slate-300 rounded-3xl border border-slate-850 relative overflow-hidden space-y-3">
                <div className="p-2 bg-sky-500/10 w-fit rounded-lg text-sky-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white uppercase tracking-wider">{language === "pt" ? "Estudo Espaçado" : "Spaced Repetition"}</h5>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-semibold mt-1">
                    {language === "pt"
                      ? "A IA gerou este material com base no conteúdo enviado. Confirme condutas e normas na fonte oficial e use os intervalos de revisão como sugestão de estudo."
                      : "Spaced repetition locks in learning. Re-read this generated study block in 24 hours, and then again in 7 days."}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Modal de Upload */}
      <AiUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        language={language}
        file={file}
        pastedText={pastedText}
        setPastedText={setPastedText}
        dragActive={dragActive}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        isExtractingPdf={isExtractingPdf}
        fileInputRef={fileInputRef}
        handleDrag={handleDrag}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        handleReadFullPdf={handleReadFullPdf}
        handleGenerateStudy={handleGenerateStudy}
      />

    </div>
  );
}
