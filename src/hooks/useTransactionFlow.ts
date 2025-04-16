
import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useWorldApiChat, type Stage } from './useWorldApiChat';

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
    
    // Remove the initial processing message
    if (stage !== 'confirm') {
      // This will replace the "processing" message with an actual response
      const response = getResponseForStageAndMessage(stage, lower);
      setInputValue(response);
      handleSendMessage();
    }
    
    // Handle initial response for testing worldAPI
    if (stage === 'intro') {
      console.log("Processing input in intro stage");
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legendary")) {
        console.log("Detected test/skip/worldapi command in intro stage");
        // Set stage to choosePath to trigger animation
        setStage('choosePath');
        return;
      }
    }

    if (stage === 'technical-requirements' && (lower.includes("send") && lower.includes("money"))) {
      setInputValue("💬 Great! How much would you like to send?");
      handleSendMessage();
      setQuoteContext({});
      setStage('amount');
      return;
    }

    if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      setInputValue("📍 Got it. What is the destination country code? (e.g., PK for Pakistan)");
      handleSendMessage();
      setStage('country');
      return;
    }

    if (stage === 'country' && lower.match(/^[A-Z]{2}$/i) && quoteContext.amount) {
      const to = lower.toUpperCase();
      try {
        const payload = {
          sending_country_code: 'AE',
          sending_currency_code: 'AED',
          receiving_country_code: to,
          receiving_currency_code: to === 'PK' ? 'PKR' : 'INR',
          sending_amount: quoteContext.amount,
          receiving_mode: 'BANK',
          type: 'SEND',
          instrument: 'REMITTANCE'
        };
        
        const quoteResult = await handleCreateQuote(payload);
        const quoteId = quoteResult?.data?.quote_id;
        setQuoteContext(prev => ({ ...prev, to, quoteId }));
        
        setInputValue(
          `📄 Here's your quote: Send ${quoteContext.amount} AED to ${to} → ` +
          `receive ${quoteResult?.data?.receiving_amount} ${quoteResult?.data?.receiving_currency_code}. ` +
          `💱 Rate: ${quoteResult?.data?.fx_rates?.[0]?.rate}\n\n` +
          "✅ Would you like to proceed with this transaction? (yes/no)"
        );
        handleSendMessage();
        setStage('confirm');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create quote. Please try again.",
          variant: "destructive",
        });
        
        // Add a default response when error occurs
        setInputValue("I'm having trouble creating that quote. Let's try something else. What would you like to do with worldAPI?");
        handleSendMessage();
        setStage('init');
      }
      return;
    }

    if (stage === 'confirm' && lower === 'yes' && quoteContext.quoteId) {
      setStage('init');
      return;
    }

    if (stage === 'confirm' && lower === 'no') {
      setInputValue("🚫 Transaction cancelled. Let me know if you'd like to try again.");
      handleSendMessage();
      setStage('init');
      return;
    }
  }, [stage, quoteContext, setQuoteContext, setStage, setInputValue, handleSendMessage, handleCreateQuote]);

  // Helper function to generate responses based on stage and message
  const getResponseForStageAndMessage = (stage: Stage, message: string): string => {
    // Check for greetings in any stage
    if (/^(hi|hello|hey|greetings|howdy)(\s|$)/i.test(message)) {
      return `👋 Hey there! I'm Dolly, your AI assistant. ${getStageSpecificPrompt(stage)}`;
    }
    
    // Handle stage-specific responses
    switch (stage) {
      case 'intro':
        return "I'm Dolly! Would you like to go through onboarding or skip straight to testing worldAPI?";
        
      case 'choosePath':
        return "I'm setting up the environment for you. What would you like to do with worldAPI once we're ready?";
        
      case 'technical-requirements':
        return "You can ask me about sending money, checking rates, or exploring our network coverage across different countries.";
        
      case 'init':
        return "I'm ready to help with worldAPI! You can ask about sending money, checking exchange rates, or exploring our network coverage.";
        
      default:
        return "I'm here to help with worldAPI. What would you like to know about our payment services?";
    }
  };
  
  // Helper function to get stage-specific prompts
  const getStageSpecificPrompt = (stage: Stage): string => {
    switch (stage) {
      case 'intro':
        return "Would you like to go through onboarding or skip to testing worldAPI?";
      case 'choosePath':
        return "I'm preparing your environment. What would you like to explore first?";
      case 'technical-requirements':
      case 'init':
        return "You can ask about sending money, checking rates, or exploring our network coverage.";
      default:
        return "How can I assist you with worldAPI today?";
    }
  };

  return { handleIntent };
};
