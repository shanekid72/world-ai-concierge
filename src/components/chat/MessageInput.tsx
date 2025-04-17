
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Zap } from "lucide-react";

interface MessageInputProps {
  inputValue: string;
  isAgentTyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  isAgentTyping,
  onInputChange,
  onSendMessage,
  onKeyDown,
}) => {
  // Ensure inputValue is never undefined
  const safeInputValue = inputValue || '';
  
  return (
    <div className="flex items-center space-x-2 w-full">
      <div className="flex-1 relative rounded-md border border-cyan-700 bg-cyberpunk-darker overflow-hidden shadow-sm">
        <div className="flex">
          <Input
            value={safeInputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter command sequence..."
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-5 px-4 bg-transparent text-cyan-300 font-mono"
            disabled={isAgentTyping}
          />
        </div>
      </div>
      <Button 
        onClick={onSendMessage}
        disabled={!safeInputValue.trim() || isAgentTyping}
        size="icon"
        className="cyber-button h-12 w-12 rounded-md flex items-center justify-center"
      >
        <Zap size={18} className="text-cyberpunk-darker" />
      </Button>
    </div>
  );
};

export default MessageInput;
