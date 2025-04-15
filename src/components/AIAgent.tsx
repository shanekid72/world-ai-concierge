
import React from 'react';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatControls from './chat/ChatControls';
import { useChatState } from '../hooks/useChatState';

interface AIAgentProps {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

const AIAgent: React.FC<AIAgentProps> = ({ onStageChange, currentStepId }) => {
  const {
    inputValue,
    setInputValue,
    conversation,
    isAgentTyping,
    handleSendMessage,
    handleReset
  } = useChatState({ currentStepId, onStageChange });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={conversation.messages} 
        isAgentTyping={isAgentTyping} 
      />
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <MessageInput
            inputValue={inputValue}
            isAgentTyping={isAgentTyping}
            onInputChange={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyDown={handleKeyDown}
          />
          <ChatControls onReset={handleReset} />
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
