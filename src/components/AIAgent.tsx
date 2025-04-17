import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { useSmartAgentResponse } from "@/hooks/useSmartAgentResponse";

interface Props {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

const AIAgent = ({ onStageChange, currentStepId }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const getSmartResponse = useSmartAgentResponse();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const introMessages = [
      "💬 Hi, I'm Dolly — your AI assistant from Digit9.",
      "🌍 Welcome to worldAPI, The API you can talk to.",
      "💡 Do you want to jump straight into testing the integration — like a boss 😎 — and skip the usual onboarding stuff? (You can always explore other modules later!)"
    ];
    
    introMessages.forEach((msg, i) =>
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-${i}`,
          content: msg,
          type: 'assistant',
          timestamp: new Date()
        }]);
      }, i * 1000)
    );
  }, []);

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

  return (
    <div className="h-full flex flex-col justify-between p-4 space-y-4">
      <div className="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.type === 'user' 
                  ? 'bg-cyberpunk-pink/20 border border-cyberpunk-pink/40' 
                  : 'bg-cyberpunk-blue/20 border border-cyberpunk-blue/40'
              }`}>
                <p className="text-sm text-cyan-300">{msg.content}</p>
                <span className="text-xs text-cyan-500/50 mt-1 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-cyan-400"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Dolly is typing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Type your message..."
          className="flex-1 bg-cyberpunk-dark/50 text-cyan-300 p-3 rounded-lg border border-cyberpunk-blue/30 
                   placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyberpunk-pink/50 
                   focus:border-transparent transition-all duration-200"
        />
        <button
          onClick={handleSubmit}
          disabled={isTyping || !input.trim()}
          className="bg-cyberpunk-pink/80 hover:bg-cyberpunk-pink px-4 py-3 text-white rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   flex items-center justify-center"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAgent;
