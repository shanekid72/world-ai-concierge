
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

    const agentMessage: Message = {
      id: generateId(),
      content: inputValue,
      isUser: false, // This is an agent message
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, agentMessage]
    }));
    setInputValue('');
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
