import React, { useEffect, useRef, useState } from 'react';
import MessageList from './chat/MessageList';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { useTransactionFlow } from '../hooks/useTransactionFlow';
import { UserInputHandler } from './chat/UserInputHandler';
import AnimatedTerminal from './AnimatedTerminal';

interface AIAgentProps {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

const AIAgent: React.FC<AIAgentProps> = ({ onStageChange, currentStepId }) => {
  const {
    stage,
    setStage,
    quoteContext,
    autoPoll,
    setAutoPoll,
    enquireTransaction
  } = useWorldApiChat();

  const {
    inputValue,
    setInputValue,
    conversation,
    isAgentTyping,
    appendAgentMessage,
    appendUserMessage
  } = useChatState({ currentStepId, onStageChange });

  const { isPolling } = useTransactionPolling(quoteContext.lastTxnRef, autoPoll);
  const hasShownIntro = useRef(false);
  const { handleIntent } = useTransactionFlow(setInputValue, appendAgentMessage);
  const [showBootup, setShowBootup] = useState(false);

  // Show intro + prompt then switch stage
  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      appendAgentMessage("👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.");
      setTimeout(() => {
        appendAgentMessage("✨ So… wanna stroll through onboarding, or skip straight to testing our legendary worldAPI like the tech boss you are? 😎");
        setStage('choosePath');
      }, 800);
    }
  }, [stage, appendAgentMessage, setStage]);

  const processUserInput = (value: string) => {
    if (!value.trim()) return;

    appendUserMessage(value);
    const lower = value.toLowerCase();

    if (stage === 'choosePath') {
      const isTestIntent = ['test', 'test worldapi', 'i want to test', 'skip onboarding', 'proceed to integration', 'jump to technical']
        .some(phrase => lower.includes(phrase));

      if (isTestIntent) {
        appendAgentMessage("🛠 Setting up worldAPI test environment for you...");
        setTimeout(() => {
          appendAgentMessage("📌 Just need a few details:\n1. Your name\n2. Company name\n3. Contact info");
          setStage('collectMinimalInfo');
        }, 1000);
        return;
      }
    }

    if (stage === 'collectMinimalInfo') {
      appendAgentMessage("I'm processing your request...");
      setTimeout(() => {
        appendAgentMessage("🤖 Initializing your assistant...");
        setShowBootup(true);
      }, 1200);
      return;
    }

    try {
      handleIntent(value);
    } catch (err) {
      console.error("Error handling intent:", err);
      appendAgentMessage("⚠️ Something glitched. Mind trying that again?");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserInput(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={conversation.messages} isAgentTyping={isAgentTyping} />
      <div className="border-t p-4 bg-white rounded-b-lg">
        {showBootup ? (
          <AnimatedTerminal
            onComplete={() => {
              appendAgentMessage("✅ Your assistant is now online. Let’s dive into worldAPI! 💥");
              setShowBootup(false);
              setStage('init');
            }}
          />
        ) : (
          <div className="flex items-center">
            <UserInputHandler
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onSend={() => {
                processUserInput(inputValue);
                setInputValue('');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgent;
