import { useState, useEffect, useCallback } from 'react';

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Remove markdown symbols for better reading
    const cleanText = text.replace(/[#*`_]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [supported]);

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

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
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
    supported
  };
};
