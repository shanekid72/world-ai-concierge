import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useSmartAgentResponse } from "@/hooks/useSmartAgentResponse";

interface Props {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
  onTypingStateChange?: (isTyping: boolean) => void;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

const WELCOME_MESSAGES = [
  "💬 Hi, I'm Dolly — your AI assistant from Digit9.",
  "🌍 Welcome to worldAPI, The API you can talk to.",
  "💡 I'm here to help you explore and integrate with worldAPI. What would you like to know?"
];

const AIAgent = ({ onStageChange, currentStepId, onTypingStateChange }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const getSmartResponse = useSmartAgentResponse();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Display welcome messages one by one
    if (welcomeIndex < WELCOME_MESSAGES.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `welcome-${welcomeIndex}`,
          content: WELCOME_MESSAGES[welcomeIndex],
          type: 'assistant',
          timestamp: new Date()
        }]);
        setWelcomeIndex(prev => prev + 1);
      }, welcomeIndex === 0 ? 500 : 1000);

      return () => clearTimeout(timer);
    }
  }, [welcomeIndex]);

  useEffect(() => {
    onTypingStateChange?.(isTyping);
  }, [isTyping, onTypingStateChange]);

  const handleSubmit = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: input,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setHasUserInteracted(true);

    try {
      const response = await getSmartResponse({
        stage: currentStepId,
        userInput: input,
        context: {}
      });

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        content: response,
        type: 'assistant',
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        content: "⚡ System glitch detected! Let me try that again...",
        type: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 space-y-4">
      <div className="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.type === 'user' 
                    ? 'bg-cyberpunk-pink/20 border border-cyberpunk-pink/40' 
                    : 'bg-cyberpunk-blue/20 border border-cyberpunk-blue/40'
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <p className="text-sm text-cyan-300">{msg.content}</p>
                <span className="text-xs text-cyan-500/50 mt-1 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center space-x-2 text-cyan-400"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Dolly is typing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Type your message..."
          className="flex-1 bg-cyberpunk-dark/50 text-cyan-300 p-3 rounded-lg border border-cyberpunk-blue/30 
                   placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyberpunk-pink/50 
                   focus:border-transparent transition-all duration-200"
        />
        <motion.button
          onClick={handleSubmit}
          disabled={isTyping || !input.trim()}
          className="bg-cyberpunk-pink/80 hover:bg-cyberpunk-pink px-4 py-3 text-white rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AIAgent;
