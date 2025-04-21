import React from 'react';
import { DollyAvatar } from './avatar/DollyAvatar';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  isTyping?: boolean;
}

export default function ChatMessage({ message, isAI, isTyping = false }: ChatMessageProps) {
  return (
    <div className={`flex items-start space-x-4 p-4 ${
      isAI ? 'bg-cyber-darker/40' : 'bg-cyber-darker/20'
    }`}>
      {isAI ? (
        <div className="flex-shrink-0">
          <DollyAvatar 
            isSpeaking={false}
            expression="neutral"
            position={{ x: 0, y: 0 }}
          />
        </div>
      ) : (
        <div className="relative h-8 w-8 rounded-full bg-cyber-blue/20 border-2 border-cyber-blue flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-cyber text-cyber-blue">YOU</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`text-sm font-cyber ${isAI ? 'text-cyber-pink' : 'text-cyber-blue'}`}>
            {isAI ? 'DOLLY.AI' : 'USER'}
          </span>
          <div className={`h-px flex-1 ${isAI ? 'bg-cyber-pink/30' : 'bg-cyber-blue/30'}`} />
        </div>

        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <p className={`text-sm break-words ${isAI ? 'font-mono' : ''}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
} 