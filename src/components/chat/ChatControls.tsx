
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ChatControlsProps {
  onReset: () => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({ onReset }) => {
  return (
    <Button
      onClick={onReset}
      variant="outline"
      size="icon"
      title="Reset conversation"
      className="h-12 w-12 rounded-full"
    >
      <RefreshCw size={16} />
    </Button>
  );
};

export default ChatControls;
