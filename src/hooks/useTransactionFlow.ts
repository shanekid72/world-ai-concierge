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
    if (stage === 'intro' && (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi"))) {
      console.log("Detected test/skip/worldapi command in intro stage");
      // Set stage to choosePath to trigger animation
      setStage('choosePath');
      return;
    }

    if (stage === 'technical-requirements' && lower.includes("send") && lower.includes("money")) {
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
    // If we didn't match any specific intent, let's just set the input to empty
    // and let the message be added to the conversation
    setInputValue('');
  }, [stage, quoteContext, setQuoteContext, setStage, setInputValue, handleSendMessage, handleCreateQuote]);

  return { handleIntent };
};
