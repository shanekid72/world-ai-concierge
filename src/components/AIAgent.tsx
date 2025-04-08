
import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, RefreshCw } from "lucide-react";
import { 
  Message, 
  generateId, 
  initializeConversation, 
  ConversationState,
  processUserMessage
} from '../utils/chatLogic';

const AIAgent: React.FC<{
  onStageChange: (stageId: string) => void;
}> = ({ onStageChange }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationState>(initializeConversation());
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);
  
  // Monitor stage changes and notify parent
  useEffect(() => {
    onStageChange(conversation.currentStageId);
  }, [conversation.currentStageId, onStageChange]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
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
    
    // Process the message and generate response
    setTimeout(() => {
      const { newState, aiResponse } = processUserMessage(userMessage.content, conversation);
      
      // Add typing indicator
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
      
      // Simulate agent typing delay (proportional to response length)
      const typingDelay = Math.min(1000 + aiResponse.length * 10, 3000);
      
      setTimeout(() => {
        // Remove typing indicator and add real response
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
      
    }, 500);
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
      
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isAgentTyping}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isAgentTyping}
            size="icon"
            className="bg-worldapi-blue-500 hover:bg-worldapi-blue-600"
          >
            <ArrowUp size={18} />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            title="Reset conversation"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
