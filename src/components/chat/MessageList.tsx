
import React, { useEffect, useRef } from 'react';
import MessageBubble from '../MessageBubble';
import { Message } from '@/utils/types';

interface MessageListProps {
  messages: Message[];
  isAgentTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isAgentTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto py-4 px-4 chat-container">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          isUser={message.isUser}
          timestamp={message.timestamp}
          isTyping={index === messages.length - 1 && isAgentTyping}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
