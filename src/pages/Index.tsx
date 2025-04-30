import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";

interface Message {
  text: string;
  isAI: boolean;
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <div className="min-h-screen bg-cyber-dark">
      <ChatInterface
        onStartListening={() => {}}
        onStopListening={() => {}}
        onStartSpeaking={() => {}}
        onStopSpeaking={() => {}}
        onSendMessage={(message) => {
          setMessages((prev) => [...prev, { text: message, isAI: false }]);
        }}
        onMessage={(message) => {
          setMessages((prev) => [...prev, { text: message, isAI: true }]);
        }}
        messages={messages}
      />
    </div>
  );
}
