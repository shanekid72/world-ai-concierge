
import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { getDefaultResponse, getRandomFunFact, getFollowUpResponse } from './chat/useStageResponses';
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
    
    // Check for specific currency pair patterns (e.g., "USD to INR", "AED to INR")
    const currencyPairRegex = /([A-Z]{3})\s+to\s+([A-Z]{3})|([A-Z]{3})\s*\/\s*([A-Z]{3})/i;
    const currencyMatch = message.match(currencyPairRegex);
    
    if (currencyMatch) {
      const sourceCurrency = currencyMatch[1] || currencyMatch[3];
      const targetCurrency = currencyMatch[2] || currencyMatch[4];
      
      appendAgentMessage(`Looking up the current exchange rate from ${sourceCurrency.toUpperCase()} to ${targetCurrency.toUpperCase()}. One moment please...`);
      
      // This would be replaced with an actual API call in a real implementation
      // Simulating response for demo
      setTimeout(() => {
        appendAgentMessage(`The current exchange rate from ${sourceCurrency.toUpperCase()} to ${targetCurrency.toUpperCase()} is 22.5123. Is there anything else you would like to know about our currency services?`);
      }, 1000);
      
      return;
    }
    
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
    
    // For currency rate inquiries - handle them in any stage
    if (lower.includes('rate') || lower.includes('exchange') || (lower.includes('check') && lower.includes('rates'))) {
      appendAgentMessage("I'd be happy to check exchange rates for you. Which currencies would you like to compare? For example, 'USD to INR' or 'EUR to GBP'.");
      return;
    }
    
    // Get default response based on stage
    let responseText = getDefaultResponse(stage, lower);
    let shouldChangeStage: Stage | null = null;
    
    // Add fun facts occasionally (15% chance)
    const shouldAddFunFact = Math.random() < 0.15;
    
    // Handle stage-specific logic
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
    else if (stage === 'technical-requirements' || stage === 'init') {
      if ((lower.includes("send") && lower.includes("money")) || lower.includes("transfer")) {
        responseText = "Let's set up a money transfer. How much would you like to send?";
        shouldChangeStage = 'amount';
        setQuoteContext({});
      } else if (lower.includes("rate") || lower.includes("exchange") || lower.includes("currency")) {
        responseText = "I'd be happy to check exchange rates for you. Which currencies would you like to compare? For example, 'USD to INR' or 'EUR to GBP'.";
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
      // These stages collect user input before moving to the next stage
      if (stage === 'standardOnboarding') {
        responseText = "Thank you! I'll add that to your profile. Now, could you tell me a bit about your business model?";
      } else {
        responseText = "Thank you for providing that information. Just to confirm, what's the best email to reach you at?";
      }
    }
    
    // Only occasionally add a fun fact if appropriate
    if (shouldAddFunFact && (stage === 'init' || stage === 'technical-requirements')) {
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
