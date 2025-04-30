import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content, 
  isUser, 
  timestamp,
  isTyping = false
}) => {
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [index, setIndex] = useState<number>(0);
  const typeSpeed = content.startsWith("Normally") ? 25 : 15; // Slower typing for the skip message
  const contentRef = useRef(content);
  const isTypingRef = useRef(isTyping);
  
  useEffect(() => {
    if (content !== contentRef.current || isTyping !== isTypingRef.current) {
      contentRef.current = content;
      isTypingRef.current = isTyping;
      setIndex(0);
      setDisplayedContent('');
    }
  }, [content, isTyping]);
  
  useEffect(() => {
    if (!isUser && !isTyping && content) {
      if (index < content.length) {
        const timer = setTimeout(() => {
          setDisplayedContent(content.substring(0, index + 1));
          setIndex(prevIndex => prevIndex + 1);
        }, typeSpeed);
        
        return () => clearTimeout(timer);
      }
    } else if (isUser || isTyping) {
      setDisplayedContent(content);
      setIndex(content.length);
    }
  }, [content, index, isTyping, isUser, typeSpeed]);

  return (
    <div className={cn(
      "flex mb-4 max-w-[85%]",
      isUser ? "ml-auto justify-end" : "mr-auto justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1 border border-cyan-700 bg-cyberpunk-dark shadow-neon-cyan">
          <img 
            src="/assets/ai-avatar.png"
            alt="AI"
            className="w-5 h-5 object-contain"
          />
        </div>
      )}
      <div className={cn(
        "py-3 px-4 shadow-sm",
        isUser 
          ? "bg-cyberpunk-dark border-l-2 border-l-cyberpunk-blue text-cyberpunk-blue rounded-r-md rounded-bl-md font-mono"
          : "bg-cyberpunk-darker border-l-2 border-l-cyberpunk-pink text-cyan-300 rounded-r-md rounded-bl-md font-mono"
      )}>
        {isTyping ? (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap">
              {displayedContent}
            </div>
            <div className={cn(
              "text-xs mt-1 text-right font-mono",
              isUser ? "text-cyan-600" : "text-fuchsia-800"
            )}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 ml-2 flex items-center justify-center text-cyberpunk-blue font-mono text-sm mt-1 border border-cyberpunk-blue bg-cyberpunk-dark shadow-neon-cyan">
          GP
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
