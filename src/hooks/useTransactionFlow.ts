
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
    
    // Handle initial response for testing worldAPI
    if (stage === 'intro') {
      console.log("Processing input in intro stage");
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legendary")) {
        console.log("Detected test/skip/worldapi command in intro stage");
        // Set stage to choosePath to trigger animation
        setStage('choosePath');
        return;
      } else {
        console.log("No matching command found in intro, using default response");
        setInputValue("I see you'd like to explore worldAPI. Would you like to go through onboarding or skip to testing?");
        handleSendMessage();
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

    console.log("No specific intent matched for message in stage", stage);
    // If we didn't match any specific intent, respond with a default message
    setInputValue("I'm here to help with worldAPI. You can ask about sending money, checking rates, or learning about our network coverage.");
    handleSendMessage();
  }, [stage, quoteContext, setQuoteContext, setStage, setInputValue, handleSendMessage, handleCreateQuote]);

  return { handleIntent };
};
