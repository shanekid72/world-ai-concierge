import { useState, useCallback, useEffect } from 'react';
import { speakText } from '../services/voiceService';

interface UseVoiceInteractionProps {
  onStartListening?: () => void;
  onStopListening?: () => void;
  onStartSpeaking?: () => void;
  onStopSpeaking?: () => void;
  onResult?: (text: string) => void;
}

export const useVoiceInteraction = ({
  onStartListening,
  onStopListening,
  onStartSpeaking,
  onStopSpeaking,
  onResult,
}: UseVoiceInteractionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    let SpeechRecognition: any = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        if (onStartListening) onStartListening();
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (onStopListening) onStopListening();
      };

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          if (onResult) onResult(finalTranscript);
        }
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onStartListening, onStopListening, onResult]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }, [recognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  // Speak text using ElevenLabs API
  const speak = useCallback(async (text: string) => {
    if (isSpeaking) return;
    try {
      setIsSpeaking(true);
      if (onStartSpeaking) onStartSpeaking();
      
      await speakText(text);
      
      setIsSpeaking(false);
      if (onStopSpeaking) onStopSpeaking();
    } catch (error) {
      console.error('Error in speak function:', error);
      setIsSpeaking(false);
      if (onStopSpeaking) onStopSpeaking();
    }
  }, [isSpeaking, onStartSpeaking, onStopSpeaking]);

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
  };
}; 