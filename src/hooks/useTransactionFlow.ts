
import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { getDefaultResponse, getRandomFunFact, getFollowUpResponse } from './chat/useStageResponses';
import { handleQuoteCreation } from './chat/useQuoteHandling';
import { fetchCurrencyRate } from '@/utils/currencyRateService';

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
    if (lower.includes('api') && (lower.includes('do') || lower.includes('what'))) {
      appendAgentMessage("worldAPI helps you send money globally through a single integration. You can transfer funds, check rates, and access multiple payment networks in over 100 countries. What would you like to know specifically? 🌍");
      return;
    }
    
    if (lower.includes('rocket') || lower.includes('fast') || lower.includes('speed')) {
      appendAgentMessage("To use worldAPI for fast transfers, you'd first integrate our API, then use our payment initiation endpoints with the destination country and amount. Our system automatically selects the fastest route for your transfer. Would you like me to explain the technical details? 🚀");
      return;
    }
    
    // For D9 network queries
    if (lower.includes('network') || lower.includes('coverage') || lower.includes('countries') || lower.includes('where')) {
      appendAgentMessage("Our D9 Network covers over 100 countries across Africa, Americas, Asia, Europe, and the GCC region. We offer various services like bank transfers, mobile wallets, and cash pickups depending on the country. Is there a specific region or country you're interested in? 🗺️");
      return;
    }
    
    // For business partner profile queries
    if (lower.includes('partner') || lower.includes('onboard') || lower.includes('business profile')) {
      appendAgentMessage("I can help with Business Partner Profile management. We collect details like company information, contact details, compliance info, business capabilities, and integration preferences. Would you like to start filling in these details or export a template CSV? 📋");
      return;
    }
    
    // Handle stage-specific logic
    if (stage === 'technical-requirements' || stage === 'init') {
      if ((lower.includes("send") && lower.includes("money")) || lower.includes("transfer")) {
        responseText = "Let's set up a money transfer. How much would you like to send? 💸";
        appendAgentMessage(responseText);
        setStage('amount');
        setQuoteContext({});
        return;
      } else if (lower.includes("help") || lower.includes("what") || lower.includes("can you do")) {
        appendAgentMessage("I can help you send money globally, check current exchange rates, or learn about our network coverage. What would you like to do? 🌟");
        return;
      }
    }
    else if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      appendAgentMessage(`Got it! $${amount} to send. Where would you like to send this to? Please provide a country code (like PK for Pakistan). 🌎`);
      setStage('country');
      return;
    }
    else if (stage === 'country' && /^[A-Z]{2}$/i.test(lower) && quoteContext.amount) {
      const result = await handleQuoteCreation(
        lower.toUpperCase(),
        quoteContext.amount,
        handleCreateQuote,
        setQuoteContext
      );
      appendAgentMessage(result.responseText);
      setStage(result.nextStage);
      return;
    }
    else if (stage === 'confirm') {
      if (lower === 'yes' && quoteContext.quoteId) {
        appendAgentMessage("Great! Your transaction is being processed. I'll keep you updated on its progress. 🚀");
        setStage('init');
        return;
      } else if (lower === 'no') {
        appendAgentMessage("No problem. Your transaction has been cancelled. Let me know if you'd like to try again with different details. 👍");
        setStage('init');
        return;
      }
    }
    
    // Get default response based on stage
    let responseText = getDefaultResponse(stage, lower);
    
    // Add fun facts occasionally (15% chance)
    const shouldAddFunFact = Math.random() < 0.15;
    if (shouldAddFunFact && (stage === 'init' || stage === 'technical-requirements')) {
      responseText += "\n\n" + getRandomFunFact();
    }
    
    appendAgentMessage(responseText);
  }, [stage, quoteContext, setQuoteContext, setStage, handleCreateQuote, appendAgentMessage]);

  return { handleIntent };
};
