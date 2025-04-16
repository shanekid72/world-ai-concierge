
import React, { useEffect, useRef, useState } from 'react';
import MessageList from './chat/MessageList';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { useTransactionFlow } from '../hooks/useTransactionFlow';
import { UserInputHandler } from './chat/UserInputHandler';
import AnimatedTerminal from './chat/AnimatedTerminal';
import { ChatStageHandler } from './chat/ChatStageHandler';
import { fetchCurrencyRate, isCurrencyRateQuery } from '../utils/currencyRateService';

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
  const techStageInitialized = useRef(false);
  const processingCurrency = useRef(false);
  const conversationStarted = useRef(false);

  // Show intro message but don't auto-progress to choose path
  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      appendAgentMessage("👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.");
      setTimeout(() => {
        appendAgentMessage("✨ Wanna go through onboarding or skip to testing our legendary worldAPI?");
      }, 1000);
    }
    
    // Initialize technical-requirements stage with a welcome message
    if (stage === 'technical-requirements' && !techStageInitialized.current) {
      techStageInitialized.current = true;
      appendAgentMessage("You're all set to use worldAPI! I can help you send money globally, check exchange rates, or explore our network coverage. What would you like to do today?");
    }
  }, [stage, appendAgentMessage]);

  const handleCurrencyQuery = async (value: string) => {
    const currencyCode = isCurrencyRateQuery(value);
    if (!currencyCode) return false;

    processingCurrency.current = true;
    appendAgentMessage("Looking up the current exchange rate. One moment please...");
    
    try {
      const rate = await fetchCurrencyRate(currencyCode);
      if (rate !== null) {
        // Determine currency pair if present
        const currencyPairRegex = /([A-Z]{3})\s+to\s+([A-Z]{3})|([A-Z]{3})\s*\/\s*([A-Z]{3})/i;
        const match = value.match(currencyPairRegex);
        
        let response = "";
        if (match) {
          const sourceCurrency = match[1] || match[3];
          response = `The current exchange rate from ${sourceCurrency} to ${currencyCode} is ${rate.toFixed(4)}. Is there anything else you'd like to know? 💱`;
        } else {
          response = `The current exchange rate for ${currencyCode} is ${rate.toFixed(4)}. Is there anything else you'd like to know? 💱`;
        }
        
        appendAgentMessage(response);
      } else {
        appendAgentMessage(`Sorry, I couldn't find the rate for ${currencyCode}. Would you like to try another currency? 😕`);
      }
    } catch (error) {
      console.error("Error fetching currency rate:", error);
      appendAgentMessage("I'm having trouble accessing exchange rates right now. Please try again later. 😕");
    }
    
    processingCurrency.current = false;
    return true;
  };

  const processUserInput = async (value: string) => {
    if (!value.trim()) return;

    appendUserMessage(value);
    conversationStarted.current = true;
    console.log("Processing user input in stage:", stage);
    
    try {
      // Always check for currency queries first, regardless of stage
      const isCurrencyQuery = await handleCurrencyQuery(value);
      if (isCurrencyQuery) return;
      
      if (stage === 'intro') {
        // Handle intro stage response
        const lower = value.toLowerCase();
        if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legend")) {
          appendAgentMessage("Great! Let me set up the test environment for you. 🚀");
          setStage('choosePath');
          return;
        } else if (lower.includes("onboard") || lower.includes("start") || lower.includes("full") || lower.includes("experience")) {
          appendAgentMessage("Perfect! Let's walk through the onboarding process together. 📝");
          setStage('standardOnboarding');
          return;
        }
      }
      
      if (stage === 'choosePath') {
        const lower = value.toLowerCase();
        const isTestIntent = ['test', 'test worldapi', 'i want to test', 'skip onboarding', 'proceed to integration', 'jump to technical', 'skip', 'legendary']
          .some(phrase => lower.includes(phrase));

        if (isTestIntent) {
          appendAgentMessage("Setting up the worldAPI test environment for you now. 🛠️");
          setTimeout(() => {
            appendAgentMessage("I just need a few quick details to get started:\n1. Your name\n2. Company name (or 'personal project')\n3. Contact information");
            setStage('collectMinimalInfo');
          }, 1000);
          return;
        }
      }

      if (stage === 'collectMinimalInfo') {
        appendAgentMessage("Thanks for the information! Processing your details now... ⚙️");
        setTimeout(() => {
          appendAgentMessage("Initializing your worldAPI assistant...");
          setShowBootup(true);
        }, 1200);
        return;
      }

      if (stage === 'standardOnboarding') {
        appendAgentMessage("Thank you for that information! Just a few more questions about your business requirements... 📊");
        setTimeout(() => {
          appendAgentMessage("Processing onboarding information...");
          setShowBootup(true);
        }, 1500);
        return;
      }

      // For all other cases, use the general intent handler
      await handleIntent(value);
    } catch (err) {
      console.error("Error handling intent:", err);
      appendAgentMessage("I'm sorry, I encountered an error processing your request. Could you try again? 😕");
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
          conversationStarted={conversationStarted.current}
        />
      )}
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        {showBootup ? (
          <AnimatedTerminal
            onComplete={() => {
              appendAgentMessage("Your worldAPI assistant is now ready to use. How can I help you today? 🌍");
              setShowBootup(false);
              setStage('technical-requirements');
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
