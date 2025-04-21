import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, StopCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { toast, ToastOptions } from 'react-toastify';
import { DollyAvatar } from './avatar/DollyAvatar';
import { FileUpload } from './FileUpload';
import { uploadFile, validateFile, getFilePreview } from '../utils/fileHandler';

interface Message {
  text: string;
  isAI: boolean;
}

interface ChatInterfaceProps {
  onStartListening: () => void;
  onStopListening: () => void;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onStartListening,
  onStopListening,
  onStartSpeaking,
  onStopSpeaking,
  messages = [],
  onSendMessage,
  onMessage,
  isLoading
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarPosition, setAvatarPosition] = useState({ x: 20, y: 20 });
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream>();
  const [currentExpression, setCurrentExpression] = useState<'neutral' | 'happy' | 'confused' | 'thinking'>('neutral');

  const handleNewMessage = async (text: string) => {
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = "I'm processing your request. This is a placeholder response while we implement the actual AI integration.";
      setInputValue(response);
      setIsTyping(false);
      speak(response);
    }, 2000);

    updateExpression(text);
  };

  const { speak } = useVoiceInteraction({
    onStartListening,
    onStopListening,
    onStartSpeaking,
    onStopSpeaking,
    onResult: (text) => {
      setInputValue(text);
      handleNewMessage(text);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only speak welcome message if there are messages and it's the first one
    if (messages.length > 0) {
      const welcomeMessage = messages[0].text;
      if (welcomeMessage) {
        speak(welcomeMessage);
      }
    }
  }, []); // Only run once on mount

  // Update avatar position based on conversation
  useEffect(() => {
    const positions = [
      { x: 20, y: 20 },   // Top-left
      { x: 80, y: 20 },   // Top-right
      { x: 50, y: 50 },   // Center
      { x: 20, y: 80 },   // Bottom-left
      { x: 80, y: 80 }    // Bottom-right
    ];

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * positions.length);
      setAvatarPosition(positions[randomIndex]);
    }, 5000); // Change position every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize audio stream when speaking starts
    if (isSpeaking) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setAudioStream(stream);
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    } else {
      // Clean up audio stream when speaking stops
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(undefined);
      }
    }
  }, [isSpeaking]);

  // Update expression based on message content
  const updateExpression = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('?')) {
      setCurrentExpression('confused');
    } else if (lowerMessage.includes('!') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      setCurrentExpression('happy');
    } else if (lowerMessage.includes('thinking') || lowerMessage.includes('processing')) {
      setCurrentExpression('thinking');
    } else {
      setCurrentExpression('neutral');
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await handleNewMessage(inputValue.trim());
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Upload file
      const response = await uploadFile(file);
      if (response.success && response.fileUrl) {
        onMessage(`File uploaded successfully: ${file.name}`);
        // You can add additional handling here, like storing the file URL
      } else {
        toast.error(response.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setShowFileUpload(false);
    }
  };

  const handleError = (message: string) => {
    toast(message, { 
      type: 'error',
      position: 'bottom-right',
      theme: 'dark'
    });
  };

  // Update emotion types
  const getEmotionFromMessage = (message: string): 'neutral' | 'happy' | 'angry' | 'surprised' => {
    if (message.includes('😊') || message.includes('happy')) return 'happy';
    if (message.includes('😠') || message.includes('angry')) return 'angry';
    if (message.includes('😮') || message.includes('wow')) return 'surprised';
    return 'neutral';
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <DollyAvatar
          isSpeaking={isSpeaking}
          audioStream={audioStream}
          expression={getEmotionFromMessage(messages[messages.length - 1]?.text || '')}
          position={{ x: 50, y: 50 }}
          gesture={isSpeaking ? 'explaining' : 'idle'}
        />
        <div className="flex items-center gap-4 p-4 border-b border-cyber-border">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-cyber-primary">Dolly</h2>
            <p className="text-sm text-cyber-secondary">Your AI Concierge</p>
          </div>
        </div>
        <div className="flex gap-4 p-4">
          <button
            onClick={() => setIsListening(!isListening)}
            className="px-4 py-2 bg-cyber-blue/20 hover:bg-cyber-blue/30 rounded-lg text-cyber-blue"
          >
            Toggle Listening
          </button>
          <button
            onClick={() => setIsSpeaking(!isSpeaking)}
            className="px-4 py-2 bg-cyber-pink/20 hover:bg-cyber-pink/30 rounded-lg text-cyber-pink"
          >
            Toggle Speaking
          </button>
        </div>
        <div className="relative">
          <div className="h-[600px] overflow-y-auto custom-scrollbar rounded-lg bg-cyber-darker/50 border border-cyber-blue/20 p-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatMessage
                    message={message.text}
                    isAI={message.isAI}
                  />
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ChatMessage
                    message=""
                    isAI={true}
                    isTyping={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <motion.button
              className={`p-3 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-cyber-blue/20 hover:bg-cyber-blue/30'
              } transition-colors`}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? (
                <StopCircle className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-cyber-blue" />
              )}
            </motion.button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-cyber-darker/50 border border-cyber-blue/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue/50"
            />

            <motion.button
              className="p-3 rounded-full bg-cyber-pink/20 hover:bg-cyber-pink/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <Send className="w-6 h-6 text-cyber-pink" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`px-4 py-2 rounded-lg transition-colors
              ${showFileUpload 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-cyber-blue/20 hover:bg-cyber-blue/30 text-cyber-blue'
              }`}
          >
            {showFileUpload ? 'Cancel Upload' : 'Upload File'}
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-cyber-darker/50 border border-cyber-border rounded-lg 
              text-cyber-secondary placeholder-cyber-secondary/50
              focus:outline-none focus:border-cyber-blue"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-cyber-blue text-white rounded-lg hover:bg-cyber-blue/90 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
