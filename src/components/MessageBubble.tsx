
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
      "flex mb-4 max-w-[85%]",
      isUser ? "ml-auto justify-end" : "mr-auto justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
          <img 
            src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" 
            alt="AI" 
            className="w-5 h-5 object-contain" 
          />
        </div>
      )}
      <div className={cn(
        "rounded-2xl py-3 px-4 shadow-sm",
        isUser 
          ? "bg-worldapi-blue-500 text-white rounded-tr-none"
          : "bg-gray-100 text-gray-800 rounded-tl-none"
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
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-worldapi-blue-100 flex-shrink-0 ml-2 flex items-center justify-center text-worldapi-blue-500 font-medium text-sm mt-1">
          GP
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
