import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    let SpeechRecognition: any = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        onStartListening?.();
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        onStopListening?.();
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
          onResult?.(finalTranscript);
        }
      };

      recognitionRef.current = recognitionInstance;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // Empty dependency array since we're using refs

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Speak text using ElevenLabs API
  const speak = useCallback(async (text: string) => {
    if (!text) return;

    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      // Check if we have an API key
      if (!apiKey) {
        const errorMsg = 'ElevenLabs API key not found. Voice synthesis disabled.';
        console.warn(errorMsg);
        setError(errorMsg);
        return;
      }

      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsSpeaking(true);
      setError(null);
      onStartSpeaking?.();

      console.log('Attempting to speak:', text);
      
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
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
            'xi-api-key': apiKey
          },
          responseType: 'blob'
        }
      );

      const audio = new Audio(URL.createObjectURL(response.data));
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        onStopSpeaking?.();
        audioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Error playing audio');
        setIsSpeaking(false);
        onStopSpeaking?.();
        audioRef.current = null;
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
      onStopSpeaking?.();
    }
  }, [onStartSpeaking, onStopSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setError(null);
    onStopSpeaking?.();
  }, [onStopSpeaking]);

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