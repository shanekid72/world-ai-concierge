import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, StopCircle, Loader2, CheckCircle2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { toast, ToastContainer } from 'react-toastify';
import { FileUpload } from './FileUpload';
import { uploadFile, validateFile, getFilePreview } from '../utils/fileHandler';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import useConversationStore, { ANIMATION_MAPPINGS } from '../store/conversationStore';
import { FlowService, FlowStage } from '../services/flowService';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import IntegrationPromptsDisplay from './IntegrationPromptsDisplay';

// Match the enhanced message type from App.tsx
interface DisplayMessage {
  text: string;
  isAI: boolean;
  shouldSpeak?: boolean;
}

// Define type for animation data from flow.json
interface AnimationData {
  duration?: string;
  visuals?: string[];
  connectionFeed?: string[];
  voiceMidAnimation?: string;
}

// Interface for feed item state
interface FeedItemState {
  id: number; // Use index as ID for simplicity
  text: string;
  status: 'loading' | 'completed';
}

interface ChatInterfaceProps {
  onStartListening: () => void;
  onStopListening: () => void;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  messages?: DisplayMessage[];
  onSendMessage: (message: string) => void;
  onMessage: (message: string) => void;
  isLoading?: boolean;
  isTechReqAnimating?: boolean;
  directSpeechText?: string | null;
  onDirectSpeechComplete?: () => void;
  animationData?: AnimationData | null;
  onAnimationComplete?: () => void;
  currentIntegrationPrompts?: string[] | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onStartListening,
  onStopListening,
  onStartSpeaking,
  onStopSpeaking,
  messages = [],
  onSendMessage,
  onMessage,
  isLoading,
  isTechReqAnimating = false,
  directSpeechText = null,
  onDirectSpeechComplete = () => {},
  animationData = null,
  onAnimationComplete = () => {},
  currentIntegrationPrompts = null
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const flowService = FlowService.getInstance();
  const { currentStageId: globalStageId } = useConversationStore();
  const currentStage = flowService.getStageById(globalStageId);
  
  const {
    currentAnimation,
    isSpeaking: isAISpeaking,
    moveToStage,
    selectOption,
    setUserAnswer,
    setIsSpeaking: setAISpeaking,
    setAnimation,
    addMessage: addConversationMessage
  } = useConversationStore();

  const { 
    speak, 
    isSpeaking: voiceIsSpeaking, 
    stopSpeaking, 
    error, 
    testVoice 
  } = useVoiceInteraction({
    onStartListening,
    onStopListening,
    onStartSpeaking: () => {
      console.log("onStartSpeaking callback triggered");
      onStartSpeaking();
      setAISpeaking(true);
    },
    onStopSpeaking: () => {
      console.log("onStopSpeaking callback triggered");
      onStopSpeaking();
      setAISpeaking(false);
    },
    onResult: (text) => {
      setInputValue(text);
      onSendMessage(text);
    }
  });

  const prevMessagesLengthRef = useRef(messages.length);
  useEffect(() => {
    console.log("ChatInterface: Messages effect triggered. Current length:", messages.length, "Prev length:", prevMessagesLengthRef.current);
    const currentLength = messages.length;
    if (currentLength > prevMessagesLengthRef.current) {
      const newMessages = messages.slice(prevMessagesLengthRef.current);
      console.log("ChatInterface: New messages detected:", newMessages);
      
      newMessages.forEach((newMessage, index) => {
        if (newMessage && newMessage.isAI) {
          if (newMessage.shouldSpeak) {
            console.log(`ChatInterface: AI Message [${index}] should be spoken:`, newMessage.text);
            speak(newMessage.text); 
          } else {
            console.log(`ChatInterface: AI Message [${index}] should NOT be spoken:`, newMessage.text);
          }
        } else if (newMessage) {
          console.log(`ChatInterface: User Message [${index}]:`, newMessage.text);
        }
      });
    } else if (currentLength < prevMessagesLengthRef.current) {
      console.log("ChatInterface: Messages array decreased (likely cleared).");
    }
    
    prevMessagesLengthRef.current = currentLength;
  }, [messages, speak]);

  const { width, height } = useWindowSize();
  const fireworksDuration = 10000;
  const itemStatusTimeouts = useRef<NodeJS.Timeout[]>([]);
  const [isSpeakingDirectly, setIsSpeakingDirectly] = useState(false);

  useEffect(() => {
    let speechTimeout: NodeJS.Timeout | null = null;

    if (directSpeechText && !isSpeakingDirectly) {
      console.log("ChatInterface: Direct speech requested, setting flag:", directSpeechText);
      setIsSpeakingDirectly(true);
      speak(directSpeechText);
      
      speechTimeout = setTimeout(() => {
        console.log("ChatInterface: Simulating end of direct speech, calling callback and clearing flag.");
        onDirectSpeechComplete();
        setIsSpeakingDirectly(false);
      }, 4000);
    }

    return () => {
      if (speechTimeout) {
        clearTimeout(speechTimeout);
      }
    };
  }, [directSpeechText, speak, onDirectSpeechComplete]);

  const handleVoiceResponse = async (text: string) => {
    setAISpeaking(true);
    try {
      await speak(text);
    } finally {
      setAISpeaking(false);
    }
  };

  const triggerAvatarAnimation = (action: 'typing' | 'sending' | 'receiving' | 'thinking') => {
    switch(action) {
      case 'typing':
        setAnimation(ANIMATION_MAPPINGS.THINKING);
        break;
      case 'sending':
        setAnimation(ANIMATION_MAPPINGS.EXPLAINING);
        setTimeout(() => setAnimation(ANIMATION_MAPPINGS.IDLE), 3000);
        break;
      case 'receiving':
        setAnimation(ANIMATION_MAPPINGS.EXCITED);
        setTimeout(() => setAnimation(ANIMATION_MAPPINGS.IDLE), 2000);
        break;
      case 'thinking':
        setAnimation(ANIMATION_MAPPINGS.THINKING);
        setTimeout(() => setAnimation(ANIMATION_MAPPINGS.IDLE), 4000);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      triggerAvatarAnimation('typing');
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    triggerAvatarAnimation('sending');
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    try {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const response = await uploadFile(file);
      if (response.success && response.fileUrl) {
        onMessage(`File uploaded successfully: ${file.name}`); 
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

  const startRecording = () => {
    setIsRecording(true);
    triggerAvatarAnimation('receiving');
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleOptionSelect = (option: string) => {
    console.log("Option button clicked in ChatInterface:", option);
    if (option === "Fast-Track Testing") {
      setAnimation(ANIMATION_MAPPINGS.HAPPY);
      setTimeout(() => setAnimation(ANIMATION_MAPPINGS.IDLE), 2500); 
    } else if (option === "Full Onboarding") {
      setAnimation(ANIMATION_MAPPINGS.THINKING);
      setTimeout(() => setAnimation(ANIMATION_MAPPINGS.IDLE), 2500); 
    }
    onSendMessage(option);
  };

  const [visibleFeedItems, setVisibleFeedItems] = useState<FeedItemState[]>([]);
  const [isAnimatingFeed, setIsAnimatingFeed] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    let feedInterval: NodeJS.Timeout | null = null;
    let fireworksTimer: NodeJS.Timeout | null = null;
    const totalAnimationTime = 30000;
    const itemCompleteDelay = 3000;

    itemStatusTimeouts.current.forEach(clearTimeout);
    itemStatusTimeouts.current = [];

    if (animationData && animationData.connectionFeed && animationData.connectionFeed.length > 0) {
      setIsAnimatingFeed(true);
      setVisibleFeedItems([]);
      setShowFireworks(false);
      let itemIndex = 0;
      const feedItems = animationData.connectionFeed;
      const itemCount = feedItems.length;
      const itemIntervalDelay = itemCount > 0 ? totalAnimationTime / itemCount : 750;

      feedInterval = setInterval(() => {
        if (itemIndex < feedItems.length) {
          const newItem: FeedItemState = { 
            id: itemIndex,
            text: feedItems[itemIndex], 
            status: 'loading' 
          };
          setVisibleFeedItems(prev => [...prev, newItem]);
          
          const timeoutId = setTimeout(() => {
            setVisibleFeedItems(prevItems => 
              prevItems.map(item => 
                item.id === newItem.id ? { ...item, status: 'completed' } : item
              )
            );
            console.log(`Item ${newItem.id} (${newItem.text}) marked as completed.`);
          }, itemCompleteDelay);
          itemStatusTimeouts.current.push(timeoutId);

          itemIndex++;
        } else {
          if (feedInterval) clearInterval(feedInterval);
          
          const finalDelay = itemCompleteDelay + 500;
          setTimeout(() => {
              console.log("ChatInterface: Feed animation finished. Triggering fireworks and callback.");
              setShowFireworks(true); 
              fireworksTimer = setTimeout(() => setShowFireworks(false), fireworksDuration); 
              onAnimationComplete(); 
              setIsAnimatingFeed(false);
          }, finalDelay);
        }
      }, itemIntervalDelay);
    } else {
      setIsAnimatingFeed(false);
      setShowFireworks(false);
    }

    return () => {
      if (feedInterval) clearInterval(feedInterval);
      if (fireworksTimer) clearTimeout(fireworksTimer);
      itemStatusTimeouts.current.forEach(clearTimeout);
      itemStatusTimeouts.current = [];
      setIsAnimatingFeed(false);
      setShowFireworks(false);
      setVisibleFeedItems([]);
    };
  }, [animationData, onAnimationComplete, fireworksDuration]);

  return (
    <div className="relative flex flex-col h-screen max-h-screen overflow-hidden bg-cyber-dark">
      {showFireworks && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={fireworksDuration - 1000}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 100 }}
        />
      )}

      <AnimatePresence>
        {isTechReqAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 pointer-events-none tech-req-animation-overlay"
            style={{
              background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(100, 0, 255, 0.1), rgba(0, 255, 100, 0.1))',
              backgroundSize: '400% 400%',
              animation: 'gradientPulse 5s ease infinite'
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between h-20 px-2 border-b border-cyber-medium-teal relative z-10 bg-cyber-dark">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-cyber-light-teal">Dolly</h2>
          <p className="text-xs text-cyber-deep-teal">Your AI Concierge</p>
        </div>
        <div className="relative w-24 h-24 overflow-hidden rounded-full bg-gradient-radial from-cyber-avatar-bg-from to-cyber-avatar-bg-to shadow-avatar-glow">
          <div className="w-full h-full flex items-center justify-center text-xs text-cyber-accent">
            {isAISpeaking ? 'SPEAKING' : 'IDLE'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-2 relative flex flex-col z-10 bg-cyber-dark">
        <div className="flex gap-1 mb-1 justify-center">
          <button
            onClick={() => setAISpeaking(!isAISpeaking)}
            className="px-2 py-1 text-xs bg-cyber-darker hover:bg-cyber-deep-teal/20 rounded text-cyber-deep-teal border border-cyber-deep-teal/30 transition-all hover:shadow-neon hover:shadow-cyber-deep-teal"
          >
            Toggle Speaking
          </button>
        </div>

        {isAnimatingFeed ? (
          <div className="tech-animation-container h-full overflow-y-auto custom-scrollbar rounded bg-cyber-darker border border-cyber-deep-teal/40 p-4 shadow-inner flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-cyber-light-teal mb-4 neon-text">Initializing Connection...</h3>
            <div className="w-full max-w-md space-y-2">
              <AnimatePresence>
                {visibleFeedItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
                    className="flex items-center justify-between text-sm text-cyber-deep-teal font-mono py-1.5 px-3 rounded bg-cyber-dark border border-cyber-deep-teal/30 shadow-sm"
                  >
                    <span>{item.text}</span>
                    <AnimatePresence mode="wait">
                      {item.status === 'loading' ? (
                        <motion.div key="loading" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Loader2 className="h-4 w-4 text-cyber-accent animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.div key="completed" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar rounded bg-cyber-dark border border-cyber-deep-teal/40 p-2 shadow-inner mb-2">
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
                      isTyping={index === messages.length - 1 && message.isAI && isLoading}
                    />
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.isAI !== true && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
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
            {currentIntegrationPrompts && (
               <IntegrationPromptsDisplay prompts={currentIntegrationPrompts} />
            )}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-cyber-medium-teal bg-cyber-darker relative z-10">
        {currentStage?.options && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentStage.options.map((option: string) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="px-3 py-1 text-sm bg-cyber-deep-teal/80 hover:bg-cyber-deep-teal text-cyber-dark rounded transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentStage?.kycChecklist && (
          <div className="mb-3 p-2 bg-cyber-darker/50 border border-cyber-deep-teal/30 rounded">
            <h3 className="font-semibold text-cyber-light-teal mb-1">AML/KYC Checklist:</h3>
            <ul className="text-sm list-disc pl-5 text-cyber-deep-teal">
              {currentStage.kycChecklist.map((item: string, index: number) => (
                <li key={index} className="mb-0.5">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2">
          {showFileUpload && (
            <FileUpload
              onFileUpload={handleFileUpload}
            />
          )}
          <div className="flex gap-1 mb-1">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="px-2 py-1 text-xs bg-cyber-dark border border-cyber-deep-teal/40 hover:bg-cyber-deep-teal/20 rounded text-cyber-deep-teal transition-all"
            >
              {showFileUpload ? 'Cancel' : 'Upload File'}
            </button>
          </div>
          <div className="flex items-center w-full">
            <input
              type="text"
              className="flex-1 p-2 rounded-l bg-cyber-dark border border-r-0 border-cyber-deep-teal/40 text-cyber-deep-teal focus:outline-none focus:ring-1 focus:ring-cyber-deep-teal"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => triggerAvatarAnimation('thinking')}
              onKeyPress={handleKeyPress}
            />
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="p-2 bg-cyber-dark border-y border-cyber-deep-teal/40 hover:bg-cyber-deep-teal/20 transition-colors"
              >
                <StopCircle size={16} className="text-cyber-deep-teal" />
              </button>
            ) : (
              <button
                onClick={() => {
                  startRecording();
                  triggerAvatarAnimation('receiving');
                }}
                className="p-2 bg-cyber-dark border-y border-cyber-deep-teal/40 hover:bg-cyber-deep-teal/20 transition-colors"
              >
                <Mic size={16} className="text-cyber-deep-teal" />
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-2 rounded-r text-cyber-dark transition-colors ${
                inputValue.trim() 
                  ? 'bg-cyber-deep-teal/80 hover:bg-cyber-deep-teal' 
                  : 'bg-cyber-deep-teal/40 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-cyber-border">
          <button
            onClick={testVoice}
            className="cyber-button mb-4"
            disabled={voiceIsSpeaking}
          >
            {voiceIsSpeaking ? "Speaking..." : "Test Voice"}
          </button>
        </div>
      </div>
    </div>
  );
};
