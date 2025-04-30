import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, StopCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FileUpload } from './FileUpload';
import { uploadFile, validateFile } from '../utils/fileHandler';
import useConversationStore from '../store/conversationStore';
import { FlowService } from '../services/flowService';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import UpdatedPromptDisplay from './UpdatedPromptDisplay';
import CyberpunkGridAnimation from './animations/CyberpunkGridAnimation';

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
  const [isTyping, _setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [_isListening, _setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [_uploadedFile, _setUploadedFile] = useState<File | null>(null);
  const [_isUploading, setIsUploading] = useState(false);
  const [_uploadProgress, setUploadProgress] = useState(0);
  const [_selectedOption, _setSelectedOption] = useState<string | null>(null);
  const [_isProcessing, _setIsProcessing] = useState(false);
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
        setAnimation('thinking');
        break;
      case 'sending':
        setAnimation('explaining');
        setTimeout(() => setAnimation('idle'), 3000);
        break;
      case 'receiving':
        setAnimation('excited');
        setTimeout(() => setAnimation('idle'), 2000);
        break;
      case 'thinking':
        setAnimation('thinking');
        setTimeout(() => setAnimation('idle'), 4000);
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
    if (option === "Boss Mode") {
      setAnimation('happy');
      setTimeout(() => setAnimation('idle'), 2500); 
    } else if (option === "Legacy Mode") {
      setAnimation('thinking');
      setTimeout(() => setAnimation('idle'), 2500); 
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
              backgroundPosition: 'center center',
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
          <div className="flex-1 overflow-y-auto custom-scrollbar rounded bg-cyber-dark border border-cyber-deep-teal/40 shadow-inner relative">
            <CyberpunkGridAnimation isActive={isAnimatingFeed} />
            <div className="z-10 relative">
              <UpdatedPromptDisplay prompts={visibleFeedItems.map(item => item.text)} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
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
               <>
                 <div className="relative">
                   <CyberpunkGridAnimation isActive={Boolean(currentIntegrationPrompts)} />
                   <div className="z-10 relative">
                     <UpdatedPromptDisplay prompts={currentIntegrationPrompts} />
                   </div>
                 </div>
               </>
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
                className={option === "Legacy Mode" || option === "Boss Mode" ? "bg-transparent border-0" : "gradient-border"}
              >
                {option === "Legacy Mode" || option === "Boss Mode" ? (
                  <CyberpunkButtonWrapper>
                    <div className="grid" />
                    <div className="glow" />
                    <div className="darkBorderBg" />
                    <div className="white" />
                    <div className="border" />
                    <span>{option}</span>
                  </CyberpunkButtonWrapper>
                ) : (
                  <span>{option}</span>
                )}
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
          <StyledInputWrapper>
            <div className="grid" />
            <div id="poda">
              <div className="glow" />
              <div className="darkBorderBg" />
              <div className="darkBorderBg" />
              <div className="darkBorderBg" />
              <div className="white" />
              <div className="border" />
              <div id="main">
                <input
                  type="text"
                  className="input"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => triggerAvatarAnimation('thinking')}
                  onKeyPress={handleKeyPress}
                  data-component-name="ChatInterface"
                />
                <div id="input-mask" />
                <div id="pink-mask" />
                <div className="filterBorder" />
                
                <div id="search-icon">
                  {isRecording ? (
                    <StyledButtonWrapper onClick={stopRecording}>
                      <StopCircle size={18} color="#fe53bb" />
                    </StyledButtonWrapper>
                  ) : (
                    <StyledButtonWrapper 
                      onClick={() => {
                        startRecording();
                        triggerAvatarAnimation('receiving');
                      }}
                    >
                      <Mic size={18} color="#fe53bb" />
                    </StyledButtonWrapper>
                  )}
                </div>
                
                <div id="filter-icon">
                  <StyledButtonWrapper
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={!inputValue.trim() ? 'disabled' : ''}
                  >
                    <Send size={16} color={inputValue.trim() ? '#09fbd3' : '#767676'} />
                  </StyledButtonWrapper>
                </div>
              </div>
            </div>
          </StyledInputWrapper>
        </div>

        <div className="p-4 border-t border-cyber-border">
          <button
            onClick={testVoice}
            className="gradient-border"
            disabled={voiceIsSpeaking}
          >
            <span>{voiceIsSpeaking ? "Speaking..." : "Test Voice"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import styled from 'styled-components';

const StyledInputWrapper = styled.div`
  .grid {
    height: 200px;
    width: 400px;
    background-image: linear-gradient(to right, #0f0f10 1px, transparent 1px),
      linear-gradient(to bottom, #0f0f10 1px, transparent 1px);
    background-size: 1rem 1rem;
    background-position: center center;
    position: absolute;
    z-index: -1;
    filter: blur(1px);
  }
  .white,
  .border,
  .darkBorderBg,
  .glow {
    max-height: 70px;
    max-width: 100%;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 12px;
    filter: blur(3px);
  }
  .input {
    background-color: #010201;
    border: none;
    width: 100%;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 59px;
    font-size: 18px;
  }
  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
  }
  .input::placeholder {
    color: #c0b9c0;
  }

  .input:focus {
    outline: none;
  }

  #main:focus-within > #input-mask {
    display: none;
  }

  #input-mask {
    pointer-events: none;
    width: 100px;
    height: 20px;
    position: absolute;
    background: linear-gradient(90deg, transparent, black);
    top: 18px;
    left: 70px;
  }
  #pink-mask {
    pointer-events: none;
    width: 30px;
    height: 20px;
    position: absolute;
    background: #cf30aa;
    top: 10px;
    left: 5px;
    filter: blur(20px);
    opacity: 0.8;
    transition: all 2s;
  }
  #main:hover > #pink-mask {
    opacity: 0;
  }

  .white {
    max-height: 63px;
    max-width: 100%;
    border-radius: 10px;
    filter: blur(2px);
  }

  .white::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.4);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0) 0%,
      #a099d8,
      rgba(0, 0, 0, 0) 8%,
      rgba(0, 0, 0, 0) 50%,
      #dfa2da,
      rgba(0, 0, 0, 0) 58%
    );
    transition: all 2s;
  }
  .border {
    max-height: 59px;
    max-width: 100%;
    border-radius: 11px;
    filter: blur(0.5px);
  }
  .border::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    position: absolute;
    width: 600px;
    height: 600px;
    filter: brightness(1.3);
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #1c191c,
      #402fb5 5%,
      #1c191c 14%,
      #1c191c 50%,
      #cf30aa 60%,
      #1c191c 64%
    );
    transition: all 2s;
  }
  .darkBorderBg {
    max-height: 65px;
    max-width: 100%;
  }
  .darkBorderBg::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #18116a,
      rgba(0, 0, 0, 0) 10%,
      rgba(0, 0, 0, 0) 50%,
      #6e1b60,
      rgba(0, 0, 0, 0) 60%
    );
    transition: all 2s;
  }
  #poda:hover > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(262deg);
  }
  #poda:hover > .glow::before {
    transform: translate(-50%, -50%) rotate(240deg);
  }
  #poda:hover > .white::before {
    transform: translate(-50%, -50%) rotate(263deg);
  }
  #poda:hover > .border::before {
    transform: translate(-50%, -50%) rotate(250deg);
  }

  #poda:hover > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(-98deg);
  }
  #poda:hover > .glow::before {
    transform: translate(-50%, -50%) rotate(-120deg);
  }
  #poda:hover > .white::before {
    transform: translate(-50%, -50%) rotate(-97deg);
  }
  #poda:hover > .border::before {
    transform: translate(-50%, -50%) rotate(-110deg);
  }

  #poda:focus-within > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(442deg);
    transition: all 4s;
  }
  #poda:focus-within > .glow::before {
    transform: translate(-50%, -50%) rotate(420deg);
    transition: all 4s;
  }
  #poda:focus-within > .white::before {
    transform: translate(-50%, -50%) rotate(443deg);
    transition: all 4s;
  }
  #poda:focus-within > .border::before {
    transform: translate(-50%, -50%) rotate(430deg);
    transition: all 4s;
  }

  .glow {
    overflow: hidden;
    filter: blur(30px);
    opacity: 0.4;
    max-height: 130px;
    max-width: 100%;
  }
  .glow:before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    position: absolute;
    width: 999px;
    height: 999px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #000,
      #402fb5 5%,
      #000 38%,
      #000 50%,
      #cf30aa 60%,
      #000 87%
    );
    transition: all 2s;
  }

  #filter-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    max-height: 40px;
    max-width: 38px;
    height: 100%;
    width: 100%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(180deg, #161329, black, #1d1b4b);
    border: 1px solid transparent;
  }
  .filterBorder {
    height: 42px;
    width: 40px;
    position: absolute;
    overflow: hidden;
    top: 7px;
    right: 7px;
    border-radius: 10px;
  }

  .filterBorder::before {
    content: "";
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.35);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #3d3a4f,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0) 50%,
      #3d3a4f,
      rgba(0, 0, 0, 0) 100%
    );
    animation: rotate 4s linear infinite;
  }
  #main {
    position: relative;
    width: 100%;
  }
  #search-icon {
    position: absolute;
    left: 20px;
    top: 15px;
  }

  @keyframes rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }
`;

const CyberpunkButtonWrapper = styled.button`
  position: relative;
  height: 62px;
  width: 170px;
  padding: 16px;
  margin: 5px;
  cursor: pointer;
  background: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    position: relative;
    z-index: 10;
    color: white;
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .grid {
    height: 100px;
    width: 100px;
    background-image: linear-gradient(to right, #0f0f10 1px, transparent 1px),
      linear-gradient(to bottom, #0f0f10 1px, transparent 1px);
    background-size: 1rem 1rem;
    background-position: center center;
    position: absolute;
    z-index: -1;
    filter: blur(1px);
  }

  .white,
  .border,
  .darkBorderBg,
  .glow {
    max-height: 60px;
    max-width: 170px;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 8px;
    filter: blur(3px);
  }

  .white {
    max-height: 54px;
    max-width: 164px;
    border-radius: 7px;
    filter: blur(2px);
  }

  .white::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    position: absolute;
    width: 300px;
    height: 300px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.4);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0) 0%,
      #a099d8,
      rgba(0, 0, 0, 0) 8%,
      rgba(0, 0, 0, 0) 50%,
      #dfa2da,
      rgba(0, 0, 0, 0) 58%
    );
    transition: all 0.8s;
  }

  .border {
    max-height: 52px;
    max-width: 166px;
    border-radius: 7px;
    filter: blur(0.5px);
  }

  .border::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    position: absolute;
    width: 300px;
    height: 300px;
    filter: brightness(1.3);
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #1c191c,
      #402fb5 5%,
      #1c191c 14%,
      #1c191c 50%,
      #cf30aa 60%,
      #1c191c 64%
    );
    transition: all 0.8s;
  }

  .darkBorderBg {
    max-height: 58px;
    max-width: 168px;
  }

  .darkBorderBg::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    position: absolute;
    width: 300px;
    height: 300px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #18116a,
      rgba(0, 0, 0, 0) 10%,
      rgba(0, 0, 0, 0) 50%,
      #6e1b60,
      rgba(0, 0, 0, 0) 60%
    );
    transition: all 0.8s;
  }

  .glow {
    overflow: hidden;
    filter: blur(30px);
    opacity: 0.4;
    max-height: 70px;
    max-width: 180px;
  }

  .glow:before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    position: absolute;
    width: 400px;
    height: 400px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #000,
      #402fb5 5%,
      #000 38%,
      #000 50%,
      #cf30aa 60%,
      #000 87%
    );
    transition: all 0.8s;
  }

  &:hover .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(-98deg);
  }
  &:hover .glow::before {
    transform: translate(-50%, -50%) rotate(-120deg);
  }
  &:hover .white::before {
    transform: translate(-50%, -50%) rotate(-97deg);
  }
  &:hover .border::before {
    transform: translate(-50%, -50%) rotate(-110deg);
  }

  &:focus .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(442deg);
    transition: all 2s;
  }
  &:focus .glow::before {
    transform: translate(-50%, -50%) rotate(420deg);
    transition: all 2s;
  }
  &:focus .white::before {
    transform: translate(-50%, -50%) rotate(443deg);
    transition: all 2s;
  }
  &:focus .border::before {
    transform: translate(-50%, -50%) rotate(430deg);
    transition: all 2s;
  }

  @keyframes rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }
`;

const StyledButtonWrapper = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(100, 100, 255, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: transparent;
    }
    
    &:active {
      transform: none;
    }
  }
`;
