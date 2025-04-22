import { useState, useCallback, useEffect } from 'react';
import { speakText } from '../services/voiceService';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);

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
    if (!text) return;

    try {
      setIsSpeaking(true);
      setError(null);
      
      // Check if we have an API key
      if (!import.meta.env.VITE_ELEVENLABS_API_KEY) {
        const errorMsg = 'ElevenLabs API key not found. Voice synthesis disabled.';
        console.warn(errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('Attempting to speak:', text);
      
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/nova',
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
          },
          responseType: 'blob'
        }
      );

      console.log('Received audio response');
      const audio = new Audio(URL.createObjectURL(response.data));
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Error playing audio');
        setIsSpeaking(false);
      };

      await audio.play();
      console.log('Started audio playback');
    } catch (error) {
      console.error('Error generating speech:', error);
      if (axios.isAxiosError(error)) {
        setError(`API Error: ${error.response?.status} - ${error.response?.data?.detail || error.message}`);
      } else {
        setError('Error generating speech');
      }
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false);
    setError(null);
  }, []);

  const testVoice = useCallback(async () => {
    await speak("Hello! This is a test of the voice synthesis system. If you can hear this, the voice synthesis is working correctly!");
  }, [speak]);

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    error,
    testVoice
  };
}; 