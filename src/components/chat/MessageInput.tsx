
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Paperclip, Mic } from "lucide-react";

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
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 relative rounded-full border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
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
        onClick={onSendMessage}
        disabled={!inputValue.trim() || isAgentTyping}
        size="icon"
        className="bg-worldapi-teal-500 hover:bg-worldapi-teal-600 h-12 w-12 rounded-full shadow-sm"
      >
        <ArrowUp size={18} />
      </Button>
    </div>
  );
};

export default MessageInput;
