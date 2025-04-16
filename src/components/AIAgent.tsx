
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

  // Show intro message but don't auto-progress to choose path
  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      appendAgentMessage("👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.");
      // Wait for user to respond before showing the next prompt
      appendAgentMessage("Would you like to go through onboarding or skip to testing our worldAPI?");
      // Don't automatically change stage - wait for user input
    }
  }, [stage, appendAgentMessage, setStage]);

  const processUserInput = (value: string) => {
    if (!value.trim()) return;

    appendUserMessage(value);
    const lower = value.toLowerCase();

    if (stage === 'intro') {
      // Now handle intro stage response in the processUserInput function
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi")) {
        appendAgentMessage("Great! Let me set up the test environment for you.");
        setStage('choosePath');
        return;
      } else if (lower.includes("onboard") || lower.includes("start") || lower.includes("full") || lower.includes("experience")) {
        appendAgentMessage("Perfect! Let's walk through the onboarding process together.");
        setStage('standardOnboarding');
        return;
      }
    }
    
    if (stage === 'choosePath') {
      const isTestIntent = ['test', 'test worldapi', 'i want to test', 'skip onboarding', 'proceed to integration', 'jump to technical', 'skip', 'legendary']
        .some(phrase => lower.includes(phrase));

      if (isTestIntent) {
        appendAgentMessage("Setting up the worldAPI test environment for you now.");
        setTimeout(() => {
          appendAgentMessage("I just need a few quick details to get started:\n1. Your name\n2. Company name (or 'personal project')\n3. Contact information");
          setStage('collectMinimalInfo');
        }, 1000);
        return;
      }
    }

    if (stage === 'collectMinimalInfo') {
      appendAgentMessage("Thanks for the information. Processing your details now...");
      setTimeout(() => {
        appendAgentMessage("Initializing your worldAPI assistant...");
        setShowBootup(true);
      }, 1200);
      return;
    }

    try {
      handleIntent(value);
    } catch (err) {
      console.error("Error handling intent:", err);
      appendAgentMessage("I'm sorry, I encountered an error processing your request. Could you try again?");
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
      
      {/* Stage handler for conditional special cases - prevent auto progression */}
      {stage !== 'intro' && (
        <ChatStageHandler 
          stage={stage} 
          onStageChange={setStage} 
          onMessage={appendAgentMessage} 
        />
      )}
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        {showBootup ? (
          <AnimatedTerminal
            onComplete={() => {
              appendAgentMessage("Your worldAPI assistant is now ready to use. How can I help you today?");
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
