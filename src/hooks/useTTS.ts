import { useCallback, useEffect, useRef, useState } from "react";

export const SUPPORTED_TTS_RATES = [1, 1.25, 1.5, 2] as const;

export const normalizeTtsRate = (value: number): number => {
  const safeValue = Number.isFinite(value) ? value : 1;
  return SUPPORTED_TTS_RATES.reduce((closest, candidate) => (
    Math.abs(candidate - safeValue) < Math.abs(closest - safeValue) ? candidate : closest
  ), SUPPORTED_TTS_RATES[0]);
};

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [rate, setRateState] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  const currentChunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);
  const playbackGenerationRef = useRef(0);
  const rateRef = useRef(1);
  const activeRef = useRef(false);
  const pausedRef = useRef(false);
  const restartOnResumeRef = useRef(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
  }, []);

  const speakNextChunk = useCallback((generation: number) => {
    if (generation !== playbackGenerationRef.current) return;
    const chunks = currentChunksRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= chunks.length) {
      activeRef.current = false;
      pausedRef.current = false;
      setIsSpeaking(false);
      setIsPaused(false);
      setProgressPercent(100);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = "pt-BR";
    utterance.rate = rateRef.current;

    utterance.onstart = () => {
      if (generation !== playbackGenerationRef.current) return;
      activeRef.current = true;
      pausedRef.current = false;
      setIsSpeaking(true);
      setIsPaused(false);
      setProgressPercent(Math.round((index / chunks.length) * 100));
    };

    utterance.onend = () => {
      if (generation !== playbackGenerationRef.current) return;
      currentChunkIndexRef.current += 1;
      setProgressPercent(Math.round((currentChunkIndexRef.current / chunks.length) * 100));
      speakNextChunk(generation);
    };

    utterance.onerror = (event) => {
      if (generation !== playbackGenerationRef.current) return;
      if (event.error === "canceled" || event.error === "interrupted") return;
      console.warn("TTS chunk error:", event.error);
      currentChunkIndexRef.current += 1;
      speakNextChunk(generation);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    playbackGenerationRef.current += 1;
    window.speechSynthesis.cancel();
    currentChunksRef.current = [];
    currentChunkIndexRef.current = 0;
    activeRef.current = false;
    pausedRef.current = false;
    restartOnResumeRef.current = false;
    setIsSpeaking(false);
    setIsPaused(false);
    setProgressPercent(0);
  }, []);

  const speak = useCallback((text: string, customRate: number = rateRef.current) => {
    if (!("speechSynthesis" in window)) return;

    const cleanText = text
      .replace(/[#*`_]/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .trim();
    if (!cleanText) return;

    const sentenceChunks = cleanText
      .split(/(?<=[.!?;\n])\s+/)
      .flatMap((sentence) => sentence.match(/.{1,240}(?:\s|$)/g) || [sentence])
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const normalizedRate = normalizeTtsRate(customRate);
    rateRef.current = normalizedRate;
    setRateState(normalizedRate);
    currentChunksRef.current = sentenceChunks;
    currentChunkIndexRef.current = 0;
    activeRef.current = true;
    pausedRef.current = false;
    restartOnResumeRef.current = false;
    setProgressPercent(0);

    const generation = playbackGenerationRef.current + 1;
    playbackGenerationRef.current = generation;
    window.speechSynthesis.cancel();
    window.setTimeout(() => speakNextChunk(generation), 0);
  }, [speakNextChunk]);

  const setRate = useCallback((nextRate: number) => {
    const normalizedRate = normalizeTtsRate(nextRate);
    rateRef.current = normalizedRate;
    setRateState(normalizedRate);

    if (!activeRef.current || !("speechSynthesis" in window)) return;
    const generation = playbackGenerationRef.current + 1;
    playbackGenerationRef.current = generation;
    window.speechSynthesis.cancel();

    if (pausedRef.current) {
      restartOnResumeRef.current = true;
      return;
    }
    window.setTimeout(() => speakNextChunk(generation), 0);
  }, [speakNextChunk]);

  const pause = useCallback(() => {
    if (!activeRef.current || !("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    pausedRef.current = true;
    setIsPaused(true);
    setIsSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    if (!activeRef.current || !("speechSynthesis" in window)) return;
    pausedRef.current = false;
    setIsPaused(false);
    setIsSpeaking(true);
    if (restartOnResumeRef.current) {
      restartOnResumeRef.current = false;
      const generation = playbackGenerationRef.current;
      window.setTimeout(() => speakNextChunk(generation), 0);
      return;
    }
    window.speechSynthesis.resume();
  }, [speakNextChunk]);

  useEffect(() => () => {
    playbackGenerationRef.current += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    supported,
    rate,
    setRate,
    progressPercent,
  };
};
