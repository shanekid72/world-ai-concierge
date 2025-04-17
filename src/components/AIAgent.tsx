
import React, { useState } from 'react';
import { useConversationLogic } from '../hooks/useConversationLogic';
import { useWorldApiChat } from '../hooks/useWorldApiChat';

interface AIAgentProps {
  currentStepId: string;
  onStageChange: (stageId: string) => void;
}

const AIAgent: React.FC<AIAgentProps> = ({ currentStepId, onStageChange }) => {
  const [messages, setMessages] = useState<string[]>([
    "⚡ Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.",
    "💡 Do you want to jump straight into testing the integration — like a boss 😎 — and skip the usual onboarding stuff?",
  ]);
  const [input, setInput] = useState('');

  const {
    stage,
    setStage,
    setQuoteContext,
    handleCreateQuote,
    handleCreateTransaction,
  } = useWorldApiChat();

  const { processUserInput } = useConversationLogic(
    stage,
    setStage,
    (msg) => setMessages((prev) => [...prev, `🤖 Dolly: ${msg}`]),
    () => {},
    setQuoteContext,
    async () => {},
    handleCreateQuote,
    handleCreateTransaction,
    {}
  );

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, `🧠 You: ${input}`]);
    await processUserInput(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">{msg}</div>
        ))}
      </div>
      <div className="border-t p-2 flex gap-2">
        <input
          className="flex-1 bg-gray-900 text-white p-2 rounded"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="px-4 bg-fuchsia-600 rounded text-white">
          Send
        </button>
      </div>
    </div>
  );
};

export default AIAgent;
