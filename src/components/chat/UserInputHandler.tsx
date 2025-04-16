
import React from 'react';
import MessageInput from './MessageInput';
import ChatControls from './ChatControls';

interface UserInputHandlerProps {
  inputValue: string;
  isAgentTyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (value: string) => void;
  onReset: () => void;
}

export const UserInputHandler: React.FC<UserInputHandlerProps> = ({
  inputValue,
  isAgentTyping,
  onInputChange,
  onSendMessage,
  onReset,
}) => {
  const handleSend = () => {
    console.log("UserInputHandler: Sending message:", inputValue);
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      // Send the current input value and clear it
      onSendMessage(trimmedValue);
      onInputChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-white rounded-b-lg">
      <div className="flex items-center space-x-2">
        <MessageInput
          inputValue={inputValue}
          isAgentTyping={isAgentTyping}
          onInputChange={onInputChange}
          onSendMessage={handleSend}
          onKeyDown={handleKeyDown}
        />
        <ChatControls onReset={onReset} />
      </div>
    </div>
  );
};
