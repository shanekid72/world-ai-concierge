import React from 'react';
import MessageInput from './MessageInput';
import ChatControls from './ChatControls';

interface UserInputHandlerProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
}

export const UserInputHandler: React.FC<UserInputHandlerProps> = ({
  value,
  onChange,
  onKeyDown,
  onSend,
}) => {
  return (
    <div className="flex items-center w-full">
      <MessageInput
        inputValue={value || ''} // Ensure inputValue is never undefined
        isAgentTyping={false}
        onInputChange={(newValue) => {
          const mockEvent = {
            target: { value: newValue }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(mockEvent);
        }}
        onSendMessage={onSend}
        onKeyDown={onKeyDown}
      />
      <ChatControls onReset={() => {/* Reset functionality placeholder */}} />
    </div>
  );
};
