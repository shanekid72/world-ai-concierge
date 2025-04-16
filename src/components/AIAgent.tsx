
import React, { useEffect, useRef, useState } from 'react';
import MessageList from './chat/MessageList';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { useTransactionFlow } from '../hooks/useTransactionFlow';
import { UserInputHandler } from './chat/UserInputHandler';
import AnimatedTerminal from './chat/AnimatedTerminal';
import { ChatStageHandler } from './chat/ChatStageHandler';

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
        appendAgentMessage("✨ Wanna go through onboarding or skip to testing our legendary worldAPI? I'm flexible, just like our API! 😎");
        setStage('choosePath');
      }, 800);
    }
  }, [stage, appendAgentMessage, setStage]);

  const processUserInput = (value: string) => {
    if (!value.trim()) return;

    appendUserMessage(value);
    const lower = value.toLowerCase();

    if (stage === 'choosePath') {
      const isTestIntent = ['test', 'test worldapi', 'i want to test', 'skip onboarding', 'proceed to integration', 'jump to technical', 'skip', 'legendary']
        .some(phrase => lower.includes(phrase));

      if (isTestIntent) {
        appendAgentMessage("🚀 Perfect! Setting up worldAPI test environment for you - this is gonna be fun!");
        setTimeout(() => {
          appendAgentMessage("📌 Just need a few quick details to get started:\n1. Your name (or what you'd like me to call you)\n2. Company name (or 'personal project' if you're flying solo)\n3. Contact info (for the fancy digital paperwork)");
          setStage('collectMinimalInfo');
        }, 1000);
        return;
      }
    }

    if (stage === 'collectMinimalInfo') {
      appendAgentMessage("Awesome info! Let me process that for you...");
      setTimeout(() => {
        appendAgentMessage("🤖 Initializing your super-powered assistant... *beep boop* fancy tech noises...");
        setShowBootup(true);
      }, 1200);
      return;
    }

    try {
      handleIntent(value);
    } catch (err) {
      console.error("Error handling intent:", err);
      appendAgentMessage("⚠️ Oops! Even digital assistants have clumsy moments. Mind trying that again? My circuits got a little tangled!");
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
      
      {/* Stage handler for conditional special cases */}
      <ChatStageHandler 
        stage={stage} 
        onStageChange={setStage} 
        onMessage={appendAgentMessage} 
      />
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        {showBootup ? (
          <AnimatedTerminal
            onComplete={() => {
              appendAgentMessage("✅ Your assistant is live and fabulous! Let's make some worldAPI magic happen! 💥");
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
