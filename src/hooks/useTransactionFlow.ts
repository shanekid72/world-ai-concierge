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
  appendAgentMessage: (message: string) => void
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
        responseText = "Oh, you like to move fast - I respect that! 🚀 Let me spin up the test environment for you real quick...";
        shouldChangeStage = 'choosePath';
      } else if (lower.includes("onboard") || lower.includes("start")) {
        responseText = "Love the enthusiasm! Let's walk through this together step by step - I promise to make it fun! 🎉";
        shouldChangeStage = 'standardOnboarding';
      }
    }
    else if (stage === 'choosePath') {
      // This stage is handled by AnimatedTerminal component
      responseText = "Awesome, gimme just a sec to get everything ready for you... 🛠️";
    }
    else if (stage === 'technical-requirements') {
      if ((lower.includes("send") && lower.includes("money"))) {
        responseText = "Alright, let's get that money moving! 💸 How much are we talking about here?";
        shouldChangeStage = 'amount';
        setQuoteContext({});
      } else if (lower.includes("rate") || lower.includes("exchange")) {
        responseText = "Exchange rates? I've got you covered! Which currencies are you curious about? 💱";
      } else if (lower.includes("network") || lower.includes("coverage") || lower.includes("countries")) {
        responseText = "Oh, you're gonna love this! We're practically everywhere - 100+ countries across Africa, Americas, Asia, Europe, and GCC! 🌍 Any specific region you're curious about?";
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
    else if (stage === 'standardOnboarding' || stage === 'collectMinimalInfo') {
      // These stages are handled directly by ChatStageHandler
      responseText = "Processing your information...";
    }
    else if (stage === 'init') {
      // Handle any input in init stage
      if (lower.includes("send") && lower.includes("money")) {
        responseText = "How much would you like to send?";
        shouldChangeStage = 'amount';
      } else if (lower.includes("help") || lower.includes("what") || lower.includes("can you")) {
        responseText = "I can help you send money, check rates, or explore our network coverage. What would you like to do?";
      } else {
        responseText = "I'm here to help with worldAPI. You can ask me about sending money, checking rates, or exploring our network coverage.";
      }
    }
    
    console.log("Sending response:", responseText);
    appendAgentMessage(responseText);
    
    if (shouldChangeStage) {
      console.log(`Changing stage from ${stage} to ${shouldChangeStage}`);
      setStage(shouldChangeStage);
    }
  }, [stage, quoteContext, setQuoteContext, setStage, handleCreateQuote, appendAgentMessage]);

  return { handleIntent };
};
