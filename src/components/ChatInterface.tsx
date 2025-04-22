import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, StopCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useVoiceInteraction } from '../hooks/useVoiceInteraction';
import { toast, ToastContainer } from 'react-toastify';
import DollyAvatar from './DollyAvatar';
import { FileUpload } from './FileUpload';
import { uploadFile, validateFile, getFilePreview } from '../utils/fileHandler';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import useConversationStore, { ANIMATION_MAPPINGS } from '../store/conversationStore';
import { FlowService, FlowStage } from '../services/flowService';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStageId, setCurrentStageId] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const flowService = FlowService.getInstance();
  
  // Use the conversation store
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

  const currentStage = flowService.getStageById(currentStageId);
  const currentQuestions = currentStage?.questions || [];

  const handleNewMessage = async (text: string) => {
    setInputValue('');
    setIsTyping(true);

    // If we're in a question-based stage, treat this as an answer
    if (currentStage?.questions && currentStage.questions.length > 0) {
      const currentQuestion = currentStage.questions[0];
      setUserAnswer(currentQuestion.text, text);
    } else {
      // Process as an option selection if the current stage has options
      if (currentStage?.options && currentStage.options.includes(text)) {
        selectOption(text);
      } else {
        // Otherwise, just add it as a user message
        addConversationMessage(text, false);
        onSendMessage(text);
      }
    }

    setIsTyping(false);
    
    // Trigger appropriate animations based on content
    if (text.includes('?')) {
      setAnimation(ANIMATION_MAPPINGS.THINKING);
    } else if (text.includes('!') || text.toLowerCase().includes('great')) {
      setAnimation(ANIMATION_MAPPINGS.HAPPY);
    } else {
      setAnimation(ANIMATION_MAPPINGS.SPEAKING);
    }

    // Simulate spoken response after a short delay
    setTimeout(() => {
      setAISpeaking(true);
      setTimeout(() => {
        setAISpeaking(false);
      }, 3000); // Simulate voice duration
    }, 1000);
  };

  // Voice interaction hook
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
      onStartSpeaking();
      setAISpeaking(true);
    },
    onStopSpeaking: () => {
      onStopSpeaking();
      setAISpeaking(false);
    },
    onResult: (text) => {
      setInputValue(text);
      handleNewMessage(text);
    }
  });

  // Handle voice responses
  const handleVoiceResponse = async (text: string, afterVoice?: () => void) => {
    setAISpeaking(true);
    try {
      await speak(text);
    } finally {
      setAISpeaking(false);
      if (afterVoice) {
        afterVoice();
      }
    }
  };

  // Animation trigger for user interactions
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

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      triggerAvatarAnimation('typing');
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    triggerAvatarAnimation('sending');
    await handleNewMessage(inputValue.trim());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStage?.chat]);

  // Handle file uploads
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
    // Implement recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement stop recording logic
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Initialize with intro stage
  useEffect(() => {
    const initializeIntroStage = async () => {
      if (currentStage?.id === "intro" && !isProcessing) {
        setIsProcessing(true);
        const welcomeVoice = "👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.";
        try {
          await handleVoiceResponse(welcomeVoice);
          addConversationMessage("✨ Wanna go through onboarding or skip to testing our legendary worldAPI?", false);
          const options = ["Full Onboarding", "Fast-Track Testing"];
          addConversationMessage(options.map(opt => `• ${opt}`).join('\n'), false);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    initializeIntroStage();
  }, [currentStage?.id]);

  // Handle stage changes
  useEffect(() => {
    const handleStageChange = async () => {
      if (!currentStage || isProcessing) return;

      setIsProcessing(true);
      try {
        switch (currentStage.id) {
          case "partner-onboarding":
            addConversationMessage("I'll guide you through the compliance and business requirements. First, could you tell me the name of your organization? 🏢", false);
            break;
          
          case "collectMinimalInfo":
            const fastTrackVoice = "Okay, speedster! You picked the fast lane, and I'm so here for it. Just three tiny things and we're rolling. Blink and you might miss it!";
            await handleVoiceResponse(fastTrackVoice);
            if (currentQuestions.length > 0) {
              addConversationMessage(currentQuestions[currentQuestionIndex].text, false);
            }
            break;

          case "compliance-kyc":
            const complianceVoice = "Ughhh... compliance. Not my favorite chapter in this love story — but hey, rules are rules and regulators never sleep. 😔 Don't worry, I'll make this as painless as possible. Here's the shopping list!";
            await handleVoiceResponse(complianceVoice);
            addConversationMessage("Let's get your compliance docs sorted. Below is our standard AML/KYC checklist. You can either upload the docs right here or email them to us at 👉 partnerships@digitnine.com", false);
            if (currentStage.kycChecklist) {
              addConversationMessage(currentStage.kycChecklist.map(item => `• ${item}`).join('\n'), false);
              const afterListVoice = "Whew. That's quite the list, I know — but once it's done, it's DONE. Upload them or shoot them to partnerships@digitnine.com. I'll be sipping tea and checking boxes. ☕";
              await handleVoiceResponse(afterListVoice);
            }
            break;
        }
      } finally {
        setIsProcessing(false);
      }
    };
    handleStageChange();
  }, [currentStage?.id]);

  // Handle option selection
  const handleOptionSelect = useCallback(async (option: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      setSelectedOption(option);
      addConversationMessage(option, true);

      switch (option) {
        case "Full Onboarding":
          moveToStage("partner-onboarding");
          const onboardingVoice = "Great! Let's get you set up as a partner. First, what's your organization's name?";
          await handleVoiceResponse(onboardingVoice);
          break;
        case "Fast-Track Testing":
          moveToStage("collectMinimalInfo");
          const fastTrackVoice = "Okay, speedster! You picked the fast lane, and I'm so here for it. Just three tiny things and we're rolling. Blink and you might miss it!";
          await handleVoiceResponse(fastTrackVoice);
          break;
      }

      setCurrentQuestionIndex(0);
      setUserAnswers({});
    } finally {
      setIsProcessing(false);
    }
  }, [addConversationMessage, moveToStage, isProcessing]);

  // Handle question responses
  const handleQuestionResponse = useCallback(async (answer: string) => {
    if (!currentStage?.questions || currentQuestionIndex >= currentStage.questions.length) return;

    const currentQuestion = currentStage.questions[currentQuestionIndex];
    setUserAnswers(prev => ({ ...prev, [currentQuestion.text]: answer }));
    
    // Add user's answer to conversation
    addConversationMessage(answer, true);

    // Handle CFO-specific response
    if (currentQuestion.text === "Are you a CFO?" && answer.toLowerCase().includes("yes")) {
      if (currentQuestion.voiceIfCFO) {
        for (const voiceLine of currentQuestion.voiceIfCFO) {
          await handleVoiceResponse(voiceLine);
        }
      }
    } else if (currentQuestion.voiceAfter) {
      await handleVoiceResponse(currentQuestion.voiceAfter);
    }

    // Move to next question or stage
    if (currentQuestionIndex < currentStage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentStage.next) {
      moveToStage(currentStage.next);
    }
  }, [currentStage, currentQuestionIndex, addConversationMessage, moveToStage]);

  // Handle input submission
  const handleInputSubmit = useCallback(async () => {
    if (!inputValue.trim()) return;

    if (currentStage?.questions && currentQuestionIndex < currentStage.questions.length) {
      await handleQuestionResponse(inputValue.trim());
    } else {
      handleNewMessage(inputValue.trim());
    }

    setInputValue('');
  }, [inputValue, currentStage, currentQuestionIndex, handleQuestionResponse, handleNewMessage]);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-cyber-dark">
      {/* Header and Avatar */}
      <div className="flex items-center justify-between h-20 px-2 border-b border-cyber-medium-teal">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-cyber-light-teal">Dolly</h2>
          <p className="text-xs text-cyber-deep-teal">Your AI Concierge</p>
        </div>
        <div className="relative w-24 h-24 overflow-hidden rounded-full bg-gradient-radial from-cyber-avatar-bg-from to-cyber-avatar-bg-to shadow-avatar-glow">
          <Canvas
            camera={{ position: [0, 0, 5] as [number, number, number], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <group scale={0.01} position={[0, -1.5, 0]} rotation={[0, Math.PI, 0]}>
              <DollyAvatar clipName={currentAnimation} />
            </group>
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>
      </div>

      {/* Main content area with messages */}
      <div className="flex-1 overflow-hidden p-2 relative flex flex-col">
        {/* Buttons in a compact layout */}
        <div className="flex gap-1 mb-1 justify-center">
          <button
            onClick={() => setAISpeaking(!isAISpeaking)}
            className="px-2 py-1 text-xs bg-cyber-darker hover:bg-cyber-deep-teal/20 rounded text-cyber-deep-teal border border-cyber-deep-teal/30 transition-all hover:shadow-neon hover:shadow-cyber-deep-teal"
          >
            Toggle Speaking
          </button>
        </div>

        {/* Chat messages container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar rounded bg-cyber-dark border border-cyber-deep-teal/40 p-2 shadow-inner">
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isAI={message.isAI}
                  isTyping={index === messages.length - 1 && message.isAI && isLoading}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.isAI !== true && (
                <ChatMessage
                  message=""
                  isAI={true}
                  isTyping={true}
                />
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Footer with input area */}
      <div className="p-2 border-t border-cyber-medium-teal bg-cyber-darker">
        {/* Current stage options */}
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

        {/* KYC Checklist if applicable */}
        {currentStage?.kycChecklist && (
          <div className="mb-3 p-2 bg-cyber-darker/50 border border-cyber-deep-teal/30 rounded">
            <h3 className="font-semibold text-cyber-light-teal mb-1">AML/KYC Checklist:</h3>
            <ul className="text-sm list-disc pl-5 text-cyber-deep-teal">
              {currentStage?.kycChecklist.map((item: string, index: number) => (
                <li key={index} className="mb-0.5">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Message input */}
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
