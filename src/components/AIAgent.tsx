import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, RefreshCw, Paperclip, Mic } from "lucide-react";
import { 
  Message, 
  generateId, 
  initializeConversation, 
  ConversationState,
  processUserMessage
} from '../utils/chatLogic';
import { toast } from "@/hooks/use-toast";
import { onboardingStages } from './OnboardingStages';

const AIAgent: React.FC<{
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}> = ({ onStageChange, currentStepId }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationState>(initializeConversation());
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);
  const [previousStepId, setPreviousStepId] = useState<string>(conversation.currentStageId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // When currentStepId changes from parent, update the conversation
  useEffect(() => {
    // Only process the stage change if it's different from the previous one
    // This prevents the toggle effect between stages
    if (currentStepId !== conversation.currentStageId && currentStepId !== previousStepId) {
      setPreviousStepId(conversation.currentStageId);
      
      const stage = onboardingStages.find(s => s.id === currentStepId);
      if (stage) {
        // Create a welcome message for the new stage
        const newMessage: Message = {
          id: generateId(),
          content: `${stage.description}. ${stage.questions[0].text}`,
          isUser: false,
          timestamp: new Date()
        };
        
        // Create a new conversation state for the selected stage
        const newState: ConversationState = {
          currentStageId: currentStepId,
          currentQuestionIndex: 0,
          completedStages: [...conversation.completedStages],
          answers: {...conversation.answers},
          // Start with a fresh set of messages for this stage
          messages: [newMessage]
        };
        
        setConversation(newState);
      }
    }
  }, [currentStepId, conversation.currentStageId, conversation.completedStages, conversation.answers, conversation.messages, previousStepId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);
  
  // This useEffect only handles natural progression through stages by AI agent
  useEffect(() => {
    // Only inform parent component if the stage changed through natural conversation
    // and not from a user clicking on a stage (which would be handled by the above useEffect)
    if (conversation.currentStageId !== currentStepId && conversation.currentStageId !== previousStepId) {
      onStageChange(conversation.currentStageId);
      setPreviousStepId(currentStepId);
    }
  }, [conversation.currentStageId, onStageChange, currentStepId, previousStepId]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setInputValue('');
    setIsAgentTyping(true);
    
    const typingMessage: Message = {
      id: generateId(),
      content: '',
      isUser: false,
      timestamp: new Date()
    };
    
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, typingMessage]
    }));
    
    try {
      const { newState, aiResponse } = await processUserMessage(userMessage.content, conversation);
      
      const typingDelay = Math.min(1000 + aiResponse.length * 10, 3000);
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: generateId(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        };
        
        setConversation(prev => ({
          ...newState,
          messages: [...prev.messages.filter(m => m.id !== typingMessage.id), aiMessage]
        }));
        setIsAgentTyping(false);
      }, typingDelay);
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages.filter(m => m.id !== typingMessage.id), {
          id: generateId(),
          content: "I'm sorry, there was an error processing your request. Please try again later.",
          isUser: false,
          timestamp: new Date()
        }]
      }));
      setIsAgentTyping(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleReset = () => {
    if (window.confirm('This will reset your conversation. Are you sure?')) {
      setConversation(initializeConversation());
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 px-4 chat-container">
        {conversation.messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isTyping={index === conversation.messages.length - 1 && isAgentTyping}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative rounded-full border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-5 px-4"
                disabled={isAgentTyping}
              />
              <div className="flex items-center pr-2 space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-worldapi-teal-500"
                  title="Attach file (coming soon)"
                  disabled
                >
                  <Paperclip size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-worldapi-teal-500"
                  title="Voice input (coming soon)"
                  disabled
                >
                  <Mic size={18} />
                </Button>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isAgentTyping}
            size="icon"
            className="bg-worldapi-teal-500 hover:bg-worldapi-teal-600 h-12 w-12 rounded-full shadow-sm"
          >
            <ArrowUp size={18} />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            title="Reset conversation"
            className="h-12 w-12 rounded-full"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
