import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { getDefaultResponse, getRandomFunFact, getFollowUpResponse } from './chat/useStageResponses';
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
    
    // Check for follow-up response first
    const followUp = getFollowUpResponse(lower);
    if (followUp) {
      appendAgentMessage(followUp);
      return;
    }
    
    // Process specific inquiries about the API, rates or other direct questions
    if (lower.includes('api') && lower.includes('do')) {
      appendAgentMessage("worldAPI helps you send money globally through a single integration. You can transfer funds, check rates, and access multiple payment networks in over 100 countries. What would you like to know specifically?");
      return;
    }
    
    if (lower.includes('rocket') || lower.includes('fast')) {
      appendAgentMessage("To use worldAPI for fast transfers, you'd first integrate our API, then use our payment initiation endpoints with the destination country and amount. Our system automatically selects the fastest route for your transfer. Would you like me to explain the technical details?");
      return;
    }
    
    // Get default response based on stage
    let responseText = getDefaultResponse(stage, lower);
    let shouldChangeStage: Stage | null = null;
    
    // Much lower chance of adding a fun fact (5% instead of 15%)
    const shouldAddFunFact = Math.random() < 0.15;
    
    if (stage === 'intro') {
      console.log("Processing input in intro stage");
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi")) {
        responseText = "Great! Let me set up the test environment for you.";
        shouldChangeStage = 'choosePath';
      } else if (lower.includes("onboard") || lower.includes("start") || lower.includes("full") || lower.includes("experience")) {
        responseText = "Perfect! Let's walk through the onboarding process together.";
        shouldChangeStage = 'standardOnboarding';
      }
    }
    else if (stage === 'choosePath') {
      // This stage is handled by AnimatedTerminal component
      responseText = "Setting things up for you now. This will just take a moment.";
    }
    else if (stage === 'technical-requirements') {
      if ((lower.includes("send") && lower.includes("money")) || lower.includes("transfer")) {
        responseText = "Let's set up a money transfer. How much would you like to send?";
        shouldChangeStage = 'amount';
        setQuoteContext({});
      } else if (lower.includes("rate") || lower.includes("exchange") || lower.includes("currency")) {
        responseText = "I can help with exchange rates. Which currencies are you interested in?";
      } else if (lower.includes("network") || lower.includes("coverage") || lower.includes("countries") || lower.includes("where")) {
        responseText = "Our network covers over 100 countries across Africa, Americas, Asia, Europe, and the GCC region. Is there a specific region you're interested in?";
      } else if (lower.includes("help") || lower.includes("what") || lower.includes("can you do")) {
        responseText = "I can help you send money globally, check current exchange rates, or learn about our network coverage. What would you like to do?";
      } else {
        // Direct response for other questions
        responseText = "I'm here to help with worldAPI. You can ask about sending money, checking rates, or our global coverage. What would you like to know?";
      }
    }
    else if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      responseText = `Got it! $${amount} to send. Where would you like to send this to? Please provide a country code (like PK for Pakistan).`;
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
        responseText = "Great! Your transaction is being processed. I'll keep you updated on its progress.";
        shouldChangeStage = 'init';
      } else if (lower === 'no') {
        responseText = "No problem. Your transaction has been cancelled. Let me know if you'd like to try again with different details.";
        shouldChangeStage = 'init';
      }
    }
    else if (stage === 'standardOnboarding' || stage === 'collectMinimalInfo') {
      // These stages are handled directly by ChatStageHandler
      responseText = "Processing your information now. This will just take a moment.";
    }
    else if (stage === 'init') {
      // Handle any input in init stage
      if (lower.includes("send") && (lower.includes("money") || lower.includes("cash"))) {
        responseText = "I can help you send money. How much would you like to transfer?";
        shouldChangeStage = 'amount';
      } else if (lower.includes("help") || lower.includes("what") || lower.includes("can you")) {
        responseText = "I can help you send money globally, check current exchange rates, or explore our network coverage. What would you like to do?";
      } else if (lower.includes("rate") || lower.includes("exchange")) {
        responseText = "I can check exchange rates for you. Which currencies are you interested in?";
      } else if (lower.includes("thank")) {
        responseText = "You're welcome! Is there anything else I can help you with regarding worldAPI?";
      } else {
        // Direct response for other questions
        responseText = "I'm here to help with worldAPI. You can ask about sending money, checking rates, or our global coverage. What would you like to know?";
      }
    }
    
    // Only occasionally add a fun fact if appropriate
    if (shouldAddFunFact && !shouldChangeStage && stage === 'init') {
      responseText += "\n\n" + getRandomFunFact();
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
