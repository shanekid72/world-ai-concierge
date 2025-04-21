import { useState, useCallback, useEffect } from 'react';

interface UseVoiceInteractionProps {
  onStartListening?: () => void;
  onStopListening?: () => void;
  onStartSpeaking?: () => void;
  onStopSpeaking?: () => void;
  onResult: (text: string) => void;
}

export function useVoiceInteraction({
  onStartListening,
  onStopListening,
  onStartSpeaking,
  onStopSpeaking,
  onResult
}: UseVoiceInteractionProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        setRecognition(recognition);
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  // Set up recognition event handlers
  useEffect(() => {
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
      onStartListening?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      onStopListening?.();
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (event.results[0].isFinal) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onStopListening?.();
    };

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
    };
  }, [recognition, onStartListening, onStopListening, onResult]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
  }, [recognition, isListening]);

  const speak = useCallback((text: string) => {
    if (!synthesis) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synthesis.getVoices().find(voice => voice.name.includes('Female')) || null;
    utterance.pitch = 1.2; // Slightly higher pitch for female voice
    utterance.rate = 1.1; // Slightly faster than normal
    utterance.onstart = () => onStartSpeaking?.();
    utterance.onend = () => onStopSpeaking?.();

    synthesis.speak(utterance);
  }, [synthesis, onStartSpeaking, onStopSpeaking]);

  return {
    isListening,
    startListening,
    stopListening,
    speak
  };
} 