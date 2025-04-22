import React from 'react';
import { DollyAvatar } from './avatar/DollyAvatar';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  isTyping?: boolean;
}

export default function ChatMessage({ message, isAI, isTyping = false }: ChatMessageProps) {
  return (
    <div className={`flex items-start space-x-4 p-4 rounded-lg mb-4 ${
      isAI 
        ? 'bg-cyber-deep-teal/10 border border-cyber-deep-teal shadow-sm' 
        : 'bg-cyber-blue/5 border border-cyber-blue/30 shadow-sm'
    }`}>
      {isAI ? (
        <div className="flex-shrink-0 w-10 h-10 bg-cyber-avatar-bg-from rounded-full border border-cyber-deep-teal flex items-center justify-center">
          <div className="text-xs font-mono text-cyber-deep-teal">AI</div>
        </div>
      ) : (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyber-blue/10 border border-cyber-blue flex items-center justify-center">
          <span className="text-xs font-mono text-cyber-blue">YOU</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`text-sm font-bold ${isAI ? 'text-cyber-deep-teal' : 'text-cyber-blue'}`}>
            {isAI ? 'DOLLY.AI' : 'USER'}
          </span>
          <div className={`h-px flex-1 ${isAI ? 'bg-cyber-deep-teal/50' : 'bg-cyber-blue/30'}`} />
        </div>

        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <p className={`text-sm break-words ${isAI ? 'text-cyber-deep-teal' : 'text-cyber-blue'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
} 