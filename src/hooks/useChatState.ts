
import { useState, useEffect } from 'react';
import { Message, ConversationState } from '@/utils/types';
import { toast } from "@/hooks/use-toast";
import { 
  generateId, 
  initializeConversation, 
  processUserMessage 
} from '@/utils/chatLogic';
import { onboardingStages } from '@/components/OnboardingStages';

interface UseChatStateProps {
  currentStepId: string;
  onStageChange: (stageId: string) => void;
}

export const useChatState = ({ currentStepId, onStageChange }: UseChatStateProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationState>(initializeConversation());
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);
  const [stageConversations, setStageConversations] = useState<Record<string, Message[]>>({});
  const [previousStepId, setPreviousStepId] = useState<string>(conversation.currentStageId);

  useEffect(() => {
    if (Object.keys(stageConversations).length === 0) {
      const initialStageConversations: Record<string, Message[]> = {};
      onboardingStages.forEach(stage => {
        initialStageConversations[stage.id] = [{
          id: generateId(),
          content: `${stage.description}. ${stage.questions[0].text}`,
          isUser: false,
          timestamp: new Date()
        }];
      });
      setStageConversations(initialStageConversations);
    }
  }, [stageConversations]);

  useEffect(() => {
    if (currentStepId === conversation.currentStageId) return;
    
    const stage = onboardingStages.find(s => s.id === currentStepId);
    if (!stage) return;
    
    setStageConversations(prev => ({
      ...prev,
      [conversation.currentStageId]: conversation.messages
    }));
    
    let newStageMessages = stageConversations[currentStepId];
    if (!newStageMessages || newStageMessages.length === 0) {
      newStageMessages = [{
        id: generateId(),
        content: `${stage.description}. ${stage.questions[0].text}`,
        isUser: false,
        timestamp: new Date()
      }];
    }
    
    setConversation(prev => ({
      ...prev,
      currentStageId: currentStepId,
      currentQuestionIndex: 0,
      messages: newStageMessages
    }));
    
    setPreviousStepId(conversation.currentStageId);
  }, [currentStepId, conversation.currentStageId, stageConversations, conversation.messages]);

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
        
        setStageConversations(prev => ({
          ...prev,
          [newState.currentStageId]: [...prev[newState.currentStageId] || [], userMessage, aiMessage]
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

  const handleReset = () => {
    if (window.confirm('This will reset your conversation. Are you sure?')) {
      setConversation(initializeConversation());
      setStageConversations({});
    }
  };

  return {
    inputValue,
    setInputValue,
    conversation,
    isAgentTyping,
    handleSendMessage,
    handleReset
  };
};
