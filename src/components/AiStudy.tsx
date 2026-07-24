import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Award, 
  ArrowRight, 
  ChevronRight, 
  RefreshCw, 
  Brain, 
  HelpCircle, 
  Clock, 
  AlertTriangle,
  ChevronLeft,
  FileDown,
  Headphones,
  PlayCircle,
  PauseCircle,
  StopCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Language } from "../types";
import { useTTS } from "../hooks/useTTS";

interface AiStudyProps {
  language: Language;
}

interface Question {
  question: string;
  options: string[];
  answer: string; // "A", "B", "C", "D"
  explanation: string;
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

export default function AiStudy({ language }: AiStudyProps) {
  // TTS Hook
  const { speak, pause, resume, stop, isSpeaking, isPaused, supported: ttsSupported } = useTTS();

  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "quiz" | "flashcards">("summary");
  const [studyData, setStudyData] = useState<GeneratedStudy | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Interactive Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // idx -> "A", "B", "C", "D"
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({}); // idx -> true/false
  const [quizFinished, setQuizFinished] = useState(false);

  // Interactive Flashcards States
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardFeedback, setCardFeedback] = useState<Record<number, "easy" | "hard">>({}); // cardIdx -> "easy" (Lembrei) or "hard" (Não lembrei)
  const [flashcardSessionFinished, setFlashcardSessionFinished] = useState(false);
  
  // AI Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: "user" | "ai", content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Reassuring messages for loading screen
  const loadingMessages = language === "pt" ? [
    "Lendo o arquivo enviado...",
    "Extraindo conceitos centrais de estudo...",
    "O Gemini está estruturando o resumo didático...",
    "Sintetizando diretrizes e legislações aplicáveis...",
    "Elaborando questões personalizadas no padrão ENARE...",
    "Revisando fundamentações e condutas de enfermagem..."
  ] : [
    "Reading uploaded file...",
    "Extracting core learning concepts...",
    "Gemini is building your custom study summary...",
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

  // AI Chat Handler
  const handleChatSearch = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) {
        let errorMessage = `Erro ${res.status}`;
        try {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data.error) {
              errorMessage = data.error;
              if (data.error.includes("GEMINI_API_KEY")) {
                errorMessage = "A chave da API Gemini não está configurada. Por favor, adicione sua GEMINI_API_KEY no painel de Segredos.";
              }
            }
          } catch (e) {
            // Not JSON, probably Vercel Error Page
            errorMessage = `Erro ${res.status}: ${text.substring(0, 150)}...`;
          }
        } catch (e) {
          // ignore parsing error
        }
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

  // Pre-loaded study example so the user can test the app immediately without uploading anything
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
          explanation: "O controle de endemias transmissíveis (como o monitoramento de vetores de dengue e malária) é uma ação típica da Vigilância Epidemiológica, não da Vigilância Sanitária. A Vigilância Sanitária foca no controle de produtos, processos e ambientes de consumo."
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
          explanation: "A descentralização distribui o poder de gestão do nível federal para os estados e municípios, tendo como diretriz principal a 'municipalização' dos serviços de saúde, já que o município é o ente federativo mais próximo da vida real do cidadão."
        },
        {
          question: "Segundo a Lei nº 8.080/1990, a incorporação de ações de prevenção, promoção, proteção e reabilitação de saúde de forma contínua e articulada constitui qual princípio?",
          options: [
            "A) Integralidade da assistência.",
            "B) Regionalização hierárquica.",
            "C) Conjugação dos recursos financeiros.",
            "D) Universalidade do atendimento."
          ],
          answer: "A",
          explanation: "A integralidade garante que a assistência englobe ações preventivas e curativas, individuais e coletivas, exigidas para cada caso em todos os níveis de complexidade do sistema, unindo promoção, prevenção e recuperação de saúde."
        },
        {
          question: "As ações de saúde do trabalhador, incluídas no campo de atuação do SUS pela Lei nº 8.080/1990, abrangem qual das seguintes atividades?",
          options: [
            "A) Garantia de estabilidade financeira vitalícia para acidentados de trabalho.",
            "B) Participação na normatização, fiscalização e controle das condições de trabalho.",
            "C) Contratação obrigatória de planos de saúde privados pelas empresas locais.",
            "D) Julgamento de ações criminais por negligência patronal em acidentes industriais."
          ],
          answer: "B",
          explanation: "O SUS atua na proteção da saúde do trabalhador participando ativamente na normatização, fiscalização, controle das condições de produção e trabalho, e promovendo ações de reabilitação e vigilância de riscos ocupacionais."
        }
      ],
      flashcards: [
        {
          front: "Qual a diferença principal entre os princípios doutrinários de Universalidade e Equidade no SUS?",
          back: "Universalidade garante acesso à saúde a TODOS sem distinção. Equidade é tratar de forma desigual os desiguais, oferecendo mais recursos a quem mais precisa para reduzir disparidades."
        },
        {
          front: "A municipalização dos serviços de saúde do SUS é fundamentada em qual princípio organizativo?",
          back: "Princípio da Descentralização político-administrativa (distribuição de poder e responsabilidade para os municípios, aproximando a gestão do cidadão)."
        },
        {
          front: "O monitoramento do vetor da Dengue é competência de qual Vigilância do SUS?",
          back: "Vigilância Epidemiológica (controle e detecção de doenças transmissíveis e agravos à saúde)."
        },
        {
          front: "O controle sanitário de alimentos e bebidas de consumo humano pertence a qual campo de atuação do SUS?",
          back: "Vigilância Sanitária (fiscalização e eliminação de riscos em bens, produtos, serviços e ambientes relacionados à saúde)."
        },
        {
          front: "Quais são os 3 princípios doutrinários (ou fundamentais) do SUS regulamentados pela Lei 8.080?",
          back: "Universalidade, Integralidade e Equidade."
        },
        {
          front: "A assistência terapêutica integral inclui o fornecimento de medicamentos?",
          back: "Sim, inclui a assistência farmacêutica de forma integral, de acordo com as diretrizes e protocolos clínicos estabelecidos."
        }
      ]
    };

    setStudyData(exampleData);
    setActiveSubTab("summary");
    setErrorMsg(null);
    // Reset quiz
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted({});
    setQuizFinished(false);
    // Reset flashcards
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setCardFeedback({});
    setFlashcardSessionFinished(false);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "txt") {
        setFile(droppedFile);
        setErrorMsg(null);
      } else {
        setErrorMsg(language === "pt" 
          ? "Por favor, anexe apenas arquivos PDF ou TXT." 
          : "Please attach only PDF or TXT files.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "txt") {
        setFile(selectedFile);
        setErrorMsg(null);
      } else {
        setErrorMsg(language === "pt" 
          ? "Por favor, anexe apenas arquivos PDF ou TXT." 
          : "Please attach only PDF or TXT files.");
      }
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        // Strip the data:application/pdf;base64, metadata prefix
        const base64Data = base64Str.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Call API to generate summary and questions
  const handleGenerateStudy = async () => {
    setErrorMsg(null);
    if (!file && !pastedText.trim()) {
      setErrorMsg(language === "pt" 
        ? "Por favor, anexe um arquivo PDF/TXT ou cole um texto de estudos." 
        : "Please upload a PDF/TXT file or paste your study material.");
      return;
    }

    setLoading(true);
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
        payload = {
          text: pastedText
        };
      }

      const res = await fetch("/api/generate-study", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = "HTTP error " + res.status;
        try {
          const text = await res.text();
          try {
            const errorData = JSON.parse(text);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            errorMessage = `HTTP error ${res.status}: ${text.substring(0, 150)}...`;
          }
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setStudyData(data);
      setActiveSubTab("summary");
      
      // Reset quiz state
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setQuizSubmitted({});
      setQuizFinished(false);

      // Reset flashcards state
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

  // Interactive Quiz Functions
  const handleOptionSelect = (optionLetter: string) => {
    if (quizSubmitted[currentQuestionIdx]) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optionLetter
    });
  };

  const handleSubmitQuestion = () => {
    if (!selectedAnswers[currentQuestionIdx]) return;
    setQuizSubmitted({
      ...quizSubmitted,
      [currentQuestionIdx]: true
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < (studyData?.questions.length || 0) - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted({});
    setQuizFinished(false);
  };

  // Interactive Flashcards Functions
  const handleFlashcardFeedback = (feedback: "easy" | "hard") => {
    setCardFeedback({
      ...cardFeedback,
      [currentCardIdx]: feedback
    });
    
    if (currentCardIdx < (studyData?.flashcards?.length || 0) - 1) {
      setTimeout(() => {
        setIsCardFlipped(false);
        setCurrentCardIdx(currentCardIdx + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setFlashcardSessionFinished(true);
      }, 300);
    }
  };

  const handleResetFlashcards = () => {
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setCardFeedback({});
    setFlashcardSessionFinished(false);
  };

  const handleShuffleFlashcards = () => {
    if (!studyData || !studyData.flashcards) return;
    const shuffled = [...studyData.flashcards].sort(() => Math.random() - 0.5);
    setStudyData({
      ...studyData,
      flashcards: shuffled
    });
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
    setCardFeedback({});
    setFlashcardSessionFinished(false);
  };

  const downloadSummaryPDF = () => {
    if (!studyData || !studyData.summary) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let y = 25;

      // Helper for page break check
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          // Add a subtle footer / page header or water mark
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            language === "pt" ? "Resumo de Estudos Gerado por IA" : "AI Generated Study Summary", 
            margin, 
            10
          );
          doc.text(
            `${doc.getNumberOfPages()}`, 
            pageWidth - margin, 
            10, 
            { align: "right" }
          );
          // Separator line at top of new page
          doc.setDrawColor(240, 241, 242);
          doc.line(margin, 12, pageWidth - margin, 12);
        }
      };

      // Title header band (Cover effect)
      doc.setFillColor(14, 165, 233); // Light Blue color
      doc.rect(margin, y, maxWidth, 18, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(
        language === "pt" ? "RESUMO DE ESTUDOS INTELIGENTE" : "INTELLIGENT STUDY SUMMARY", 
        margin + 5, 
        y + 11
      );
      
      y += 28;

      const lines = studyData.summary.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          y += 4; // empty line spacing
          continue;
        }

        // Clean double asterisks for display in PDF
        const cleanText = (txt: string) => {
          return txt.replace(/\*\*/g, "");
        };

        if (line.startsWith("# ")) {
          const text = cleanText(line.replace("# ", ""));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.setTextColor(15, 23, 42); // dark slate

          const splitText = doc.splitTextToSize(text, maxWidth);
          const blockHeight = splitText.length * 8;
          checkPageBreak(blockHeight + 6);

          doc.text(splitText, margin, y);
          y += blockHeight + 4;

        } else if (line.startsWith("## ")) {
          const text = cleanText(line.replace("## ", ""));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(14, 165, 233); // sky blue

          const splitText = doc.splitTextToSize(text, maxWidth);
          const blockHeight = splitText.length * 6;
          checkPageBreak(blockHeight + 5);

          // Subtle underline for H2
          doc.text(splitText, margin, y);
          y += blockHeight + 1.5;
          doc.setDrawColor(224, 242, 254); // light blue line
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;

        } else if (line.startsWith("### ")) {
          const text = cleanText(line.replace("### ", ""));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(51, 65, 85); // medium slate

          const splitText = doc.splitTextToSize(text, maxWidth);
          const blockHeight = splitText.length * 5;
          checkPageBreak(blockHeight + 4);

          doc.text(splitText, margin, y);
          y += blockHeight + 3;

        } else if (line.startsWith("#### ")) {
          const text = cleanText(line.replace("#### ", ""));
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);

          const splitText = doc.splitTextToSize(text, maxWidth);
          const blockHeight = splitText.length * 5;
          checkPageBreak(blockHeight + 4);

          doc.text(splitText, margin, y);
          y += blockHeight + 3;

        } else if (line.startsWith("* ") || line.startsWith("- ")) {
          const text = cleanText(line.substring(2));
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105);

          // Render bullet symbol with indentation
          const bulletIndent = 6;
          const splitText = doc.splitTextToSize(text, maxWidth - bulletIndent);
          const blockHeight = splitText.length * 4.8;
          checkPageBreak(blockHeight + 3);

          doc.text("•", margin, y);
          doc.text(splitText, margin + bulletIndent, y);
          y += blockHeight + 2.5;

        } else {
          // Regular paragraph
          const text = cleanText(line);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105);

          const splitText = doc.splitTextToSize(text, maxWidth);
          const blockHeight = splitText.length * 4.8;
          checkPageBreak(blockHeight + 3);

          doc.text(splitText, margin, y);
          y += blockHeight + 3;
        }
      }

      // Add simple footer metadata to the final page
      checkPageBreak(25);
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        language === "pt" 
          ? "Estude mais inteligente com a nossa plataforma de estudos orientada por IA." 
          : "Study smarter with our AI-driven learning platform.", 
        margin, 
        y
      );

      // Save PDF
      doc.save(
        language === "pt" 
          ? `resumo-de-estudos-ia-${Date.now()}.pdf` 
          : `ai-study-summary-${Date.now()}.pdf`
      );

    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert(
        language === "pt" 
          ? "Ocorreu um erro ao gerar o PDF." 
          : "An error occurred while generating the PDF."
      );
    }
  };

  const correctAnswersCount = studyData 
    ? studyData.questions.filter((q, idx) => selectedAnswers[idx] === q.answer).length 
    : 0;

  // Render a nice visual parser of markdown sections
  const renderMarkdownSummary = (markdown: string) => {
    if (!markdown) return null;
    
    const lines = markdown.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-6 mb-2 flex items-center space-x-2">
            <span className="w-1 h-5 bg-sky-500 rounded-full" />
            <span>{line.replace("### ", "").replace(/\*\*/g, "")}</span>
          </h3>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-4 mb-2 uppercase tracking-wide">
            {line.replace("#### ", "").replace(/\*\*/g, "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl font-black text-slate-900 dark:text-white mt-8 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-sky-500" />
            <span>{line.replace("## ", "").replace(/\*\*/g, "")}</span>
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-4 mb-4">
            {line.replace("# ", "").replace(/\*\*/g, "")}
          </h1>
        );
      }

      // Lists
      if (line.startsWith("* ") || line.startsWith("- ")) {
        const text = line.substring(2);
        return (
          <li key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 ml-5 list-disc my-1.5 leading-relaxed">
            {renderBoldText(text)}
          </li>
        );
      }

      // Ordered list numbers
      const numListMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numListMatch) {
        return (
          <div key={idx} className="flex items-start space-x-2.5 ml-4 my-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-mono font-bold text-sky-500">{numListMatch[1]}.</span>
            <span className="flex-1">{renderBoldText(numListMatch[2])}</span>
          </div>
        );
      }

      // Empty line
      if (!line.trim()) return <div key={idx} className="h-2" />;

      // Normal paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 my-2 leading-relaxed">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  // Helper to replace **bold** with <strong> React element
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Overview Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {language === "pt" 
              ? "Anexe um PDF ou digite seus textos de estudo. Nossa Inteligência Artificial lerá o material, elaborará um resumo didático estruturado e formulará um mini simulado com questões explicadas."
              : "Upload a PDF or paste your study notes. Our AI analyzes the document, generates a structured didactic summary, and builds an interactive practice quiz with detailed rationales."}
          </p>
        </div>
      </div>

      {/* Main Container */}
      {!studyData && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Upload / Pasteurizer Area */}
          <div className="lg:col-span-2 space-y-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            <h3 className="font-black text-base text-slate-800 dark:text-slate-200 flex items-center space-x-2.5">
              <Sparkles className="h-5 w-5 text-sky-500 animate-pulse" />
              <span>{language === "pt" ? "Criar Novo Material de Estudo" : "Create New Study Material"}</span>
            </h3>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs sm:text-sm flex items-start space-x-2.5 animate-fade-in shadow-xs">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1 font-semibold leading-relaxed">
                  {errorMsg}
                </div>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-extrabold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-sky-500 bg-sky-500/5" 
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
              <UploadCloud className={`h-12 w-12 mb-3.5 transition-colors ${dragActive ? "text-sky-500" : "text-slate-300 dark:text-slate-700"}`} />
              
              {file ? (
                <div className="text-center">
                  <span className="inline-flex items-center space-x-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs px-3.5 py-1.5 rounded-full border border-sky-500/20">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    {language === "pt" ? "Clique ou arraste outro para substituir" : "Click or drag another to replace"}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {language === "pt" ? "Anexar PDF ou TXT de estudos" : "Upload PDF or TXT Study File"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    {language === "pt" ? "Arraste e solte o arquivo aqui, ou clique para procurar" : "Drag & drop the file here, or click to browse"}
                  </p>
                </div>
              )}
            </div>

            {/* Pasted text option */}
            {!file && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "pt" ? "OU COLE O TEXTO DE ESTUDO" : "OR PASTE YOUR STUDY TEXT"}
                  </label>
                </div>
                <textarea
                  id="paste-study-text"
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={language === "pt" 
                    ? "Cole aqui anotações, apostilas, trechos de livros ou condutas de enfermagem..." 
                    : "Paste study notes, textbook excerpts, guidelines, protocols here..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-xs sm:text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all leading-relaxed font-normal"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-generate-ai-study"
                onClick={handleGenerateStudy}
                disabled={!file && !pastedText.trim()}
                className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl shadow-xl shadow-sky-600/15 hover:shadow-sky-500/25 transition-all flex items-center justify-center space-x-2.5"
              >
                <Brain className="h-4 sm:h-5 w-4 sm:w-5" />
                <span>{language === "pt" ? "Gerar Resumo e Questões" : "Generate Summary & Quiz"}</span>
              </button>
            </div>

          </div>

          {/* Quick Access Sidebar */}
          <div className="space-y-6">
            
            {/* Example Card */}
            <div className="bg-gradient-to-br from-sky-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
                <Sparkles className="w-40 h-40" />
              </div>
              
              <div className="relative space-y-4">
                <div className="p-2 bg-white/10 w-fit rounded-xl">
                  <Brain className="h-6 w-6 text-sky-100" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base tracking-tight text-white">
                    {language === "pt" ? "Teste Imediato" : "Quick Test Drive"}
                  </h4>
                  <p className="text-xs text-sky-100 mt-1 leading-relaxed font-medium">
                    {language === "pt" 
                      ? "Não tem nenhum PDF em mãos agora? Use nosso material de estudo pré-carregado sobre a Lei do SUS para ver a IA em ação!"
                      : "Don't have a PDF ready? Load our pre-configured SUS Organic Law study packet to explore the summary and quiz generator immediately!"}
                  </p>
                </div>
                <button
                  id="btn-load-example"
                  onClick={handleLoadExample}
                  className="w-full bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{language === "pt" ? "Usar Material de Exemplo" : "Load Example Packet"}</span>
                </button>
              </div>
            </div>

            {/* PDF Guidance Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <HelpCircle className="h-4 w-4 text-sky-500" />
                <span>{language === "pt" ? "Tipos de Arquivos Suportados" : "Supported Study Materials"}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-sky-500 mt-0.5">✓</span>
                  <span><strong>Artigos Acadêmicos:</strong> PDFs de consensos, resoluções COFEN ou diretrizes de saúde.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-sky-500 mt-0.5">✓</span>
                  <span><strong>Editais de Concurso:</strong> TXT ou PDF com conteúdos programáticos para focar.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-sky-500 mt-0.5">✓</span>
                  <span><strong>Anotações de Aulas:</strong> Cole suas anotações pessoais de enfermagem para fixar.</span>
                </li>
              </ul>
            </div>

            {/* AI Chat / Search Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex flex-col">
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                      {language === "pt" ? "Mentor de Estudos IA" : "AI Study Mentor"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {language === "pt" ? "Tire dúvidas rápidas com a IA" : "Ask quick questions to AI"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-64 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Brain className="h-6 w-6 mb-2 text-slate-300" />
                    <p className="text-[10px] font-medium text-slate-500">
                      {language === "pt" ? "Como posso ajudar seus estudos?" : "How can I help your studies?"}
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[90%] p-2.5 rounded-2xl text-[11px] sm:text-xs leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-sky-600 text-white rounded-tr-none" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-750"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-750">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-sky-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSearch()}
                    placeholder={language === "pt" ? "Tire sua dúvida..." : "Ask your question..."}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-sky-500 transition-all"
                  />
                  <button
                    onClick={handleChatSearch}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Loading Screen */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center shadow-xs animate-fade-in">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
            <div className="absolute">
              <Brain className="h-6 w-6 text-sky-500 animate-pulse" />
            </div>
          </div>
          <h4 className="font-extrabold text-base text-slate-800 dark:text-white mt-6">
            {language === "pt" ? "A Inteligência Artificial está estudando..." : "AI Study Co-pilot at work..."}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1.5 leading-relaxed font-semibold transition-all">
            {loadingMessage}
          </p>
        </div>
      )}

      {/* Study Data Material View (Summary + Quiz Tabs) */}
      {studyData && !loading && (
        <div className="space-y-6">
          
          {/* Header & Upload New action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-sky-500 font-mono uppercase tracking-wider">
                  {language === "pt" ? "MATERIAL DE ESTUDO GERADO" : "GENERATED STUDY RESOURCE"}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate max-w-md">
                  {file ? file.name : (language === "pt" ? "Texto Colado / Exemplo de SUS" : "Pasted Notes / SUS Example")}
                </h3>
              </div>
            </div>

            <button
              id="btn-upload-new-material"
              onClick={() => {
                setStudyData(null);
                setFile(null);
                setPastedText("");
              }}
              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{language === "pt" ? "Anexar Outro" : "Upload Another"}</span>
            </button>
          </div>

          {/* Sub tabs: Summary VS Quiz VS Flashcards */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px space-x-6 text-sm font-semibold">
            <button
              id="subtab-summary"
              onClick={() => setActiveSubTab("summary")}
              className={`pb-3 transition-all border-b-2 relative ${
                activeSubTab === "summary" 
                  ? "border-sky-500 text-sky-600 dark:text-sky-400 font-bold" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              📝 {language === "pt" ? "Resumo de Estudo" : "Study Summary"}
            </button>
            <button
              id="subtab-quiz"
              onClick={() => setActiveSubTab("quiz")}
              className={`pb-3 transition-all border-b-2 relative ${
                activeSubTab === "quiz" 
                  ? "border-sky-500 text-sky-600 dark:text-sky-400 font-bold" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              🏆 {language === "pt" ? "Testar Conhecimento (Quiz)" : "Practice Quiz"}
            </button>
            <button
              id="subtab-flashcards"
              onClick={() => setActiveSubTab("flashcards")}
              className={`pb-3 transition-all border-b-2 relative ${
                activeSubTab === "flashcards" 
                  ? "border-sky-500 text-sky-600 dark:text-sky-400 font-bold" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              📇 {language === "pt" ? "Flashcards IA" : "AI Flashcards"}
            </button>
          </div>

          {/* Study Content Rendering */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left 2 columns: Active Tab Content */}
            <div className="lg:col-span-2">
              
              {activeSubTab === "summary" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs prose dark:prose-invert max-w-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800 mb-6 gap-3">
                    <span className="text-xs font-bold text-slate-400 font-mono uppercase">
                      📖 {language === "pt" ? "LEITURA DIRECIONADA" : "DIRECTED READING"}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        id="btn-download-pdf"
                        onClick={downloadSummaryPDF}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                        title={language === "pt" ? "Baixar resumo em PDF" : "Download summary as PDF"}
                      >
                        <FileDown className="h-4 w-4" />
                        <span>{language === "pt" ? "Baixar PDF" : "Download PDF"}</span>
                      </button>

                      {/* Botões de Áudio TTS */}
                      {ttsSupported && (
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-1.5 py-1">
                          {!isSpeaking && !isPaused ? (
                            <button
                              onClick={() => speak(studyData.summary)}
                              className="text-slate-600 dark:text-slate-400 hover:text-sky-500 transition-colors p-1"
                              title={language === "pt" ? "Ouvir Resumo" : "Listen Summary"}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={isPaused ? resume : pause}
                                className="text-sky-500 hover:text-sky-600 transition-colors p-1"
                                title={isPaused ? "Retomar" : "Pausar"}
                              >
                                {isPaused ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={stop}
                                className="text-red-400 hover:text-red-500 transition-colors p-1"
                                title="Parar"
                              >
                                <StopCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      <span className="text-[10px] bg-sky-500/10 text-sky-500 px-2 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{language === "pt" ? "Pronto" : "Ready"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary rendered nicely */}
                  <div className="space-y-4">
                    {renderMarkdownSummary(studyData.summary)}
                  </div>

                  {/* Complete study notice box */}
                  <div className="mt-8 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-start space-x-3.5">
                    <div className="p-1.5 bg-sky-500 text-white rounded-lg mt-0.5">
                      <Award className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                        {language === "pt" ? "Resumo Concluído! Fixe seu Conhecimento" : "Summary Completed! Solidify Learning"}
                      </h4>
                      <p className="text-xs text-sky-700/85 dark:text-sky-400/85 mt-1 leading-relaxed font-semibold">
                        {language === "pt"
                          ? "Após ler atentamente o resumo de fixação, clique na aba 'Testar Conhecimento (Quiz)' para resolver o mini-simulado gerado e medir sua retenção!"
                          : "Now that you've reviewed the study summary, switch over to the 'Practice Quiz' tab to answer the generated mock questions!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === "quiz" && (
                <div className="space-y-6">
                  
                  {!quizFinished ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
                      
                      {/* Quiz Header Info */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                        <div>
                          <span className="text-[10px] font-bold text-sky-500 font-mono uppercase tracking-widest">
                            {language === "pt" ? `Questão ${currentQuestionIdx + 1} de ${studyData.questions.length}` : `Question ${currentQuestionIdx + 1} of ${studyData.questions.length}`}
                          </span>
                          <h4 className="font-bold text-xs text-slate-400">
                            {language === "pt" ? "Simulado de Fixação" : "Active Recall Quiz"}
                          </h4>
                        </div>

                        {/* Progress line */}
                        <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIdx + 1) / studyData.questions.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-5">
                        <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-normal">
                          {studyData.questions[currentQuestionIdx].question}
                        </div>

                        {/* Question options */}
                        <div className="space-y-2 pt-2">
                          {studyData.questions[currentQuestionIdx].options.map((option) => {
                            const optionLetter = option.substring(0, 1); // e.g. "A"
                            const isSelected = selectedAnswers[currentQuestionIdx] === optionLetter;
                            const isSubmitted = quizSubmitted[currentQuestionIdx];
                            const isCorrectAnswer = optionLetter === studyData.questions[currentQuestionIdx].answer;

                            let optionStyles = "border-slate-200 dark:border-slate-800 hover:border-sky-500/30 hover:bg-slate-50 dark:hover:bg-slate-950/30";
                            
                            if (isSelected && !isSubmitted) {
                              optionStyles = "border-sky-500 bg-sky-500/5 text-sky-900 dark:text-sky-100";
                            } else if (isSubmitted) {
                              if (isCorrectAnswer) {
                                optionStyles = "border-sky-500 bg-sky-500/10 text-sky-900 dark:text-sky-100 font-semibold";
                              } else if (isSelected) {
                                optionStyles = "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100";
                              } else {
                                optionStyles = "border-slate-100 dark:border-slate-850 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={option}
                                id={`quiz-option-${optionLetter}`}
                                onClick={() => handleOptionSelect(optionLetter)}
                                disabled={isSubmitted}
                                className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all leading-normal flex items-start space-x-3.5 ${optionStyles}`}
                              >
                                <span className={`flex items-center justify-center h-5 w-5 rounded-full shrink-0 border text-xs font-bold font-mono ${
                                  isSelected 
                                    ? "bg-sky-500 border-sky-500 text-white" 
                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-400"
                                }`}>
                                  {optionLetter}
                                </span>
                                <span className="flex-1">{option.substring(3)}</span>
                                
                                {isSubmitted && isCorrectAnswer && (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-sky-500 shrink-0 self-center" />
                                )}
                                {isSubmitted && isSelected && !isCorrectAnswer && (
                                  <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 self-center" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Action buttons (Verify / Next) */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {quizSubmitted[currentQuestionIdx] 
                              ? (language === "pt" ? "Resolução detalhada disponível abaixo" : "Detailed explanation is available below")
                              : (language === "pt" ? "Selecione uma opção e clique em Enviar" : "Select an option and click Submit")}
                          </span>

                          {!quizSubmitted[currentQuestionIdx] ? (
                            <button
                              id="btn-quiz-submit-answer"
                              onClick={handleSubmitQuestion}
                              disabled={!selectedAnswers[currentQuestionIdx]}
                              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all"
                            >
                              {language === "pt" ? "Enviar Resposta" : "Submit Answer"}
                            </button>
                          ) : (
                            <button
                              id="btn-quiz-next-question"
                              onClick={handleNextQuestion}
                              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all flex items-center space-x-1"
                            >
                              <span>{currentQuestionIdx < studyData.questions.length - 1 ? (language === "pt" ? "Próxima Questão" : "Next Question") : (language === "pt" ? "Finalizar Quiz" : "Finish Quiz")}</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          )
                          }
                        </div>

                        {/* Explanation Box */}
                        {quizSubmitted[currentQuestionIdx] && (
                          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-fade-in mt-4 space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                              💡 {language === "pt" ? "FUNDAMENTAÇÃO E DIRETRIZ" : "RATIONALE & PROTOCOL"}
                            </span>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                              {studyData.questions[currentQuestionIdx].explanation}
                            </p>
                          </div>
                        )}

                      </div>

                    </div>
                  ) : (
                    
                    /* Quiz Results Card */
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center space-y-6 animate-fade-in">
                      <div className="w-16 h-16 bg-sky-500/15 text-sky-500 rounded-full flex items-center justify-center mx-auto">
                        <Award className="h-8 w-8" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-black text-xl text-slate-800 dark:text-white">
                          {language === "pt" ? "Simulado Concluído com Sucesso!" : "Quiz Successfully Completed!"}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                          {language === "pt"
                            ? "Muito bem! O estudo ativo por questões é o método mais eficiente para fixar a legislação de enfermagem."
                            : "Excellent work! Active recall via practice questions is the single most effective way to retain nursing boards information."}
                        </p>
                      </div>

                      {/* Score metrics */}
                      <div className="inline-flex flex-col items-center justify-center py-4 px-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{language === "pt" ? "ACERTOS TOTAIS" : "TOTAL ACCURACY"}</span>
                        <span className="text-4xl font-black text-sky-500 font-mono mt-1">
                          {correctAnswersCount} / {studyData.questions.length}
                        </span>
                        <span className="text-xs text-slate-400 mt-1 font-medium">
                          ({Math.round((correctAnswersCount / studyData.questions.length) * 100)}% {language === "pt" ? "de aproveitamento" : "correct"})
                        </span>
                      </div>

                      {/* Study Feedback based on score */}
                      <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-left space-y-1 font-medium text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase block tracking-wide">{language === "pt" ? "RECOMENDAÇÃO DO MENTOR" : "MENTOR STUDY FEEDBACK"}</span>
                        <p className="leading-relaxed font-normal">
                          {correctAnswersCount === studyData.questions.length ? (
                            language === "pt" 
                              ? "Excelente aproveitamento (100%)! Você dominou perfeitamente este material. Continue avançando para novos tópicos!"
                              : "Perfect score! You have thoroughly mastered this study unit. Keep up the amazing momentum!"
                          ) : correctAnswersCount >= 3 ? (
                            language === "pt"
                              ? "Bom desempenho! Você compreendeu a maioria dos conceitos chaves. Revise as fundamentações das questões erradas para fechar suas lacunas."
                              : "Great job! You have a strong grasp of the material. Review the missed questions' rationales to lock in a 100% score next time."
                          ) : (
                            language === "pt"
                              ? "Aproveitamento abaixo do ideal. Recomendamos ler o resumo de estudos novamente antes de refazer este simulado de fixação."
                              : "Below target score. We highly recommend reading the study summary once more before retrying this practice quiz."
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                        <button
                          id="btn-quiz-retry"
                          onClick={handleResetQuiz}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg shadow-sky-600/10 transition-all flex items-center justify-center space-x-1.5"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>{language === "pt" ? "Refazer Simulado" : "Retry Quiz"}</span>
                        </button>
                        
                        <button
                          id="btn-quiz-back-summary"
                          onClick={() => setActiveSubTab("summary")}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
                        >
                          {language === "pt" ? "Ler Resumo de Novo" : "Read Summary Again"}
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {activeSubTab === "flashcards" && (
                <div className="space-y-6">
                  {!flashcardSessionFinished ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col items-center">
                      
                      {/* Flashcard Header Info */}
                      <div className="flex items-center justify-between w-full border-b border-slate-100 dark:border-slate-800 pb-4 mb-8">
                        <div>
                          <span className="text-[10px] font-bold text-sky-500 font-mono uppercase tracking-widest">
                            {language === "pt" 
                              ? `Cartão ${currentCardIdx + 1} de ${(studyData.flashcards || []).length}` 
                              : `Card ${currentCardIdx + 1} of ${(studyData.flashcards || []).length}`}
                          </span>
                          <h4 className="font-bold text-xs text-slate-400">
                            {language === "pt" ? "Fixação por Repetição Espaçada" : "Active Recall Learning"}
                          </h4>
                        </div>

                        {/* Progress line */}
                        <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full transition-all duration-300"
                            style={{ width: `${((currentCardIdx + 1) / ((studyData.flashcards || []).length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* 3D Flashcard flip container */}
                      {(studyData.flashcards && studyData.flashcards.length > 0) ? (
                        <div className="w-full max-w-lg mb-8">
                          {/* Card */}
                          <div 
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            className="perspective-1000 cursor-pointer group h-64 sm:h-72 w-full focus:outline-hidden"
                            role="button"
                            tabIndex={0}
                          >
                            <div className={`relative w-full h-full duration-500 transform-style-3d ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                              
                              {/* FRONT Side */}
                              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col justify-between backface-hidden shadow-xs hover:shadow-md dark:shadow-none transition-all">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-extrabold bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {language === "pt" ? "FRENTE - CONCEITO" : "FRONT - TERM"}
                                  </span>
                                  <Brain className="h-4 w-4 text-slate-400" />
                                </div>
                                <div className="text-center py-4 flex items-center justify-center min-h-[120px]">
                                  <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 leading-normal">
                                    {studyData.flashcards[currentCardIdx].front}
                                  </p>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold animate-pulse">
                                  {language === "pt" ? "Clique para revelar o verso 🔄" : "Click to flip card 🔄"}
                                </p>
                              </div>

                              {/* BACK Side */}
                              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-950 dark:to-black border border-sky-500/20 dark:border-slate-800 p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md dark:shadow-none">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-extrabold bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {language === "pt" ? "VERSO - DEFINIÇÃO" : "BACK - DEFINITION"}
                                  </span>
                                  <CheckCircle2 className="h-4 w-4 text-sky-500" />
                                </div>
                                <div className="text-center py-4 flex items-center justify-center min-h-[120px] overflow-y-auto">
                                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350 leading-relaxed">
                                    {studyData.flashcards[currentCardIdx].back}
                                  </p>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                  {language === "pt" ? "Clique para voltar à frente" : "Click to flip back"}
                                </p>
                              </div>

                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 font-semibold">
                          {language === "pt" ? "Nenhum flashcard disponível." : "No flashcards available."}
                        </div>
                      )}

                      {/* Flip / Active Recall feedback buttons */}
                      <div className="w-full flex flex-col items-center space-y-4">
                        {!isCardFlipped ? (
                          <button
                            id="btn-flashcard-flip"
                            onClick={() => setIsCardFlipped(true)}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-lg shadow-sky-600/10 transition-all flex items-center space-x-1.5"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>{language === "pt" ? "Virar Cartão (Ver Resposta)" : "Flip Card (See Answer)"}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center space-x-4 w-full max-w-sm">
                            <button
                              id="btn-flashcard-hard"
                              onClick={() => handleFlashcardFeedback("hard")}
                              className="flex-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>{language === "pt" ? "Não Lembrei" : "Forgot"}</span>
                            </button>
                            <button
                              id="btn-flashcard-easy"
                              onClick={() => handleFlashcardFeedback("easy")}
                              className="flex-1 bg-sky-50 border border-sky-200 hover:bg-sky-100 dark:bg-sky-950/20 dark:border-sky-900/50 text-sky-600 dark:text-sky-400 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{language === "pt" ? "Lembrei!" : "Remembered!"}</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 pt-4 border-t border-slate-50 dark:border-slate-800/80 w-full justify-between text-[11px] text-slate-400 font-semibold px-2">
                          <button
                            id="btn-flashcard-shuffle"
                            onClick={handleShuffleFlashcards}
                            className="hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                          >
                            🔀 {language === "pt" ? "Misturar Ordem" : "Shuffle Deck"}
                          </button>
                          <span>
                            {language === "pt" 
                              ? "Dica: Pratique até atingir 100% de lembrança!" 
                              : "Tip: Practice until you reach 100% recall!"}
                          </span>
                        </div>
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
                            {Math.round((Object.values(cardFeedback).filter(v => v === "easy").length / (studyData.flashcards?.length || 1)) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Mentor comment */}
                      <div className="max-w-md mx-auto p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-left space-y-1 font-medium text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase block tracking-wide">
                          {language === "pt" ? "RECOMENDAÇÃO DO MENTOR" : "MENTOR STUDY FEEDBACK"}
                        </span>
                        <p className="leading-relaxed font-normal">
                          {Object.values(cardFeedback).filter(v => v === "easy").length === studyData.flashcards?.length ? (
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
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-lg shadow-sky-600/10 transition-all flex items-center justify-center space-x-1.5"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>{language === "pt" ? "Reiniciar Prática" : "Restart Session"}</span>
                        </button>
                        <button
                          id="btn-flashcard-shuffle-restart"
                          onClick={handleShuffleFlashcards}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-1.5"
                        >
                          <span>🔀 {language === "pt" ? "Misturar e Recomeçar" : "Shuffle & Restart"}</span>
                        </button>
                      </div>

                    </div>
                  )}

                  {/* Complete flashcard reference list below */}
                  {studyData.flashcards && studyData.flashcards.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350 mb-4 border-b border-slate-50 dark:border-slate-800 pb-3 flex items-center space-x-2">
                        <span>📋 {language === "pt" ? "Gabarito de Consulta Rápida" : "Quick Concept Reference"}</span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono normal-case">
                          ({studyData.flashcards.length} {language === "pt" ? "itens" : "cards"})
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studyData.flashcards.map((card, idx) => (
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
              )}

            </div>

            {/* Right sidebar: Quick stats of this material */}
            <div className="space-y-6">
              
              {/* Material info stats card */}
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

                {/* Progress bar to visual aid */}
                <div className="space-y-1.5 pt-2 border-t border-slate-50 dark:border-slate-800/85">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">{language === "pt" ? "PROCESSO DE APRENDIZADO" : "LEARNING DECK PROGRESS"}</span>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full transition-all duration-300"
                      style={{ width: `${(Object.keys(quizSubmitted).length / studyData.questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Pro Advisor Tip */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-black text-slate-300 rounded-3xl border border-slate-850 relative overflow-hidden space-y-3">
                <div className="p-2 bg-sky-500/10 w-fit rounded-lg text-sky-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-white uppercase tracking-wider">{language === "pt" ? "Estudo Espaçado" : "Spaced Repetition"}</h5>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-semibold mt-1">
                    {language === "pt"
                      ? "O Gemini gerou esse material baseado na conduta do COFEN e provas R1. Revise este resumo em 24h e depois em 7 dias para garantir máxima retenção de longo prazo."
                      : "Spaced repetition locks in learning. Re-read this generated study block in 24 hours, and then again in 7 days to transfer it to permanent memory."}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
