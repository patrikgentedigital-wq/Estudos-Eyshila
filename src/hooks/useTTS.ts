import { useState, useEffect, useCallback, useRef } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  
  const currentChunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    currentChunksRef.current = [];
    currentChunkIndexRef.current = 0;
    setIsSpeaking(false);
    setIsPaused(false);
    setProgressPercent(0);
  }, [supported]);

  const speakNextChunk = useCallback((playbackRate: number = 1.0) => {
    const chunks = currentChunksRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= chunks.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgressPercent(100);
      return;
    }

    const chunkText = chunks[index];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    utterance.lang = 'pt-BR';
    utterance.rate = playbackRate;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      const prog = Math.round(((index + 1) / chunks.length) * 100);
      setProgressPercent(prog);
    };

    utterance.onend = () => {
      currentChunkIndexRef.current += 1;
      speakNextChunk(playbackRate);
    };

    utterance.onerror = (e) => {
      console.warn("TTS Chunk Error:", e);
      currentChunkIndexRef.current += 1;
      speakNextChunk(playbackRate);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback((text: string, customRate: number = 1.0) => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    
    // Clean text from Markdown formatting
    const cleanText = text
      .replace(/[#*`_]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    if (!cleanText) return;

    // Split text into chunks by punctuation to prevent Chrome cutoff on long PDFs
    const sentenceChunks = cleanText
      .split(/(?<=[.!?;\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    currentChunksRef.current = sentenceChunks;
    currentChunkIndexRef.current = 0;
    setRate(customRate);

    speakNextChunk(customRate);
  }, [supported, speakNextChunk]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsSpeaking(true);
  }, [supported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

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
    progressPercent
  };
};
