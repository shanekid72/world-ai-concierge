
import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { fetchCurrencyRate } from '@/utils/currencyRateService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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

  const { toast } = useToast();

  const extractQuoteFields = useCallback(async (message: string) => {
    try {
      // Simple extraction logic - in a real app, this might use AI/NLP
      const amountMatch = message.match(/(\d+(\.\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
      
      const currencyMatch = message.match(/usd|eur|inr|aed|gbp|pkr/i);
      const currency = currencyMatch ? currencyMatch[0].toUpperCase() : 'AED';
      
      // Extract country codes or names
      const countryMatch = message.match(/india|pakistan|uk|usa|united states|united kingdom|uae|philippines/i);
      
      // Map country names to country codes
      let countryCode = 'IN'; // Default
      if (countryMatch) {
        const country = countryMatch[0].toLowerCase();
        if (country.includes('pakistan')) countryCode = 'PK';
        else if (country.includes('uk') || country.includes('united kingdom')) countryCode = 'GB';
        else if (country.includes('usa') || country.includes('united states')) countryCode = 'US';
        else if (country.includes('uae')) countryCode = 'AE';
        else if (country.includes('philippines')) countryCode = 'PH';
        else if (country.includes('india')) countryCode = 'IN';
      }
      
      if (amount <= 0) {
        return null;
      }
      
      return {
        amount,
        currency,
        to: countryCode
      };
    } catch (error) {
      console.error('Error extracting quote fields:', error);
      return null;
    }
  }, []);

  const handleIntent = useCallback(async (message: string) => {
    if (!message.trim()) return;

    console.log(`Processing intent in stage "${stage}" with message: "${message}"`);

    if (stage === 'amount' || stage === 'country') {
      const extracted = await extractQuoteFields(message);
      if (extracted) {
        appendAgentMessage(`Got it! Creating a quote to send ${extracted.amount} ${extracted.currency} to ${extracted.to}...`);
        const quote = await handleCreateQuote(extracted);
        setQuoteContext(prev => ({ ...prev, ...extracted, quoteId: quote?.id }));
        setStage('confirm');

        toast({
          title: `Quote Created`,
          description: `Amount: ${extracted.amount} ${extracted.currency}\nTo: ${extracted.to}\nFX Rate: ${quote?.fxRate || 'N/A'}\nFee: ${quote?.fee || 'N/A'}\nDelivery: ${quote?.deliveryTime || '1-2 days'}`,
          action: <Button variant="outline" onClick={() => setStage('confirm')}>Confirm</Button>
        });

        return;
      } else {
        appendAgentMessage("I need a bit more info — how much do you want to send and to which country?");
        return;
      }
    }

    appendAgentMessage("I'm here to help! You can tell me to send money, check rates, or get started.");
  }, [stage, quoteContext, handleCreateQuote, setQuoteContext, setStage, appendAgentMessage, toast, extractQuoteFields]);

  return { handleIntent };
};
