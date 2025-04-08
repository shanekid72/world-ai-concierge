
import React, { useState, useEffect } from 'react';
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
  const typeSpeed = 15; // in milliseconds
  
  useEffect(() => {
    if (!isUser && !isTyping && content) {
      const timer = setTimeout(() => {
        if (index < content.length) {
          setDisplayedContent(content.substring(0, index + 1));
          setIndex(index + 1);
        }
      }, typeSpeed);
      
      return () => clearTimeout(timer);
    } else if (isUser || isTyping) {
      setDisplayedContent(content);
      setIndex(content.length);
    }
  }, [content, index, isTyping, isUser]);

  return (
    <div className={cn(
      "flex mb-4 max-w-[80%]",
      isUser ? "ml-auto justify-end" : "mr-auto justify-start"
    )}>
      <div className={cn(
        "rounded-2xl py-3 px-4",
        isUser 
          ? "bg-worldapi-blue-500 text-white"
          : "bg-gray-100 text-gray-800"
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
              "text-xs mt-1 text-right",
              isUser ? "text-worldapi-blue-100" : "text-gray-500"
            )}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
