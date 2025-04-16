
import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { getDefaultResponse } from './chat/useStageResponses';
import { appendMessageToChat } from './chat/useChatDomUtils';
import { handleQuoteCreation } from './chat/useQuoteHandling';

interface UseTransactionFlowReturn {
  handleIntent: (message: string) => Promise<void>;
}

export const useTransactionFlow = (
  setInputValue: (value: string) => void,
  handleSendMessage: () => void
): UseTransactionFlowReturn => {
  const {
    stage,
    setStage,
    quoteContext,
    setQuoteContext,
    handleCreateQuote,
  } = useWorldApiChat();

  const handleIntent = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    console.log(`Processing intent in stage "${stage}" with message: "${message}"`);
    const lower = message.toLowerCase();
    
    let responseText = getDefaultResponse(stage, lower);
    let shouldChangeStage: Stage | null = null;
    
    if (stage === 'intro') {
      console.log("Processing input in intro stage");
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legendary")) {
        responseText = "Setting up worldAPI test environment for you...";
        shouldChangeStage = 'choosePath';
      } else if (lower.includes("onboard") || lower.includes("start")) {
        responseText = "Starting the onboarding process...";
        shouldChangeStage = 'standardOnboarding';
      }
    }
    else if (stage === 'technical-requirements') {
      if ((lower.includes("send") && lower.includes("money"))) {
        responseText = "💬 Great! How much would you like to send?";
        shouldChangeStage = 'amount';
        setQuoteContext({});
      } else if (lower.includes("rate") || lower.includes("exchange")) {
        responseText = "I can check current exchange rates for you. Which currencies are you interested in?";
      } else if (lower.includes("network") || lower.includes("coverage") || lower.includes("countries")) {
        responseText = "Our D9 Network covers over 100 countries across Africa, Americas, Asia, Europe, and GCC regions. Any specific region you're interested in?";
      }
    }
    else if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      responseText = "📍 Got it. What is the destination country code? (e.g., PK for Pakistan)";
      shouldChangeStage = 'country';
    }
    else if (stage === 'country' && /^[A-Z]{2}$/i.test(lower) && quoteContext.amount) {
      const result = await handleQuoteCreation(
        lower.toUpperCase(),
        quoteContext.amount,
        handleCreateQuote,
        setQuoteContext
      );
      responseText = result.responseText;
      shouldChangeStage = result.nextStage;
    }
    else if (stage === 'confirm') {
      if (lower === 'yes' && quoteContext.quoteId) {
        responseText = "Great! Processing your transaction now...";
        shouldChangeStage = 'init';
      } else if (lower === 'no') {
        responseText = "🚫 Transaction cancelled. Let me know if you'd like to try again.";
        shouldChangeStage = 'init';
      }
    }
    
    console.log("Sending response:", responseText);
    appendMessageToChat(responseText);
    
    if (shouldChangeStage) {
      setStage(shouldChangeStage);
    }
  }, [stage, quoteContext, setQuoteContext, setStage, handleCreateQuote]);

  return { handleIntent };
};
