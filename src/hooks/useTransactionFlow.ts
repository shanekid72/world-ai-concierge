import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { getDefaultResponse, getRandomFunFact, getFollowUpResponse } from './chat/useStageResponses';
import { handleQuoteCreation } from './chat/useQuoteHandling';
import { fetchCurrencyRate } from '@/utils/currencyRateService';
import { useQuoteExtraction } from './useQuoteExtraction';
import { useToast } from '@/hooks/use-toast';

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

  const extractQuoteFields = useQuoteExtraction();
  const { toast } = useToast();

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
          action: {
            label: "Confirm",
            onClick: () => setStage('confirm')
          }
        });

        return;
      } else {
        appendAgentMessage("I need a bit more info — how much do you want to send and to which country?");
        return;
      }
    }

    appendAgentMessage("I’m here to help! You can tell me to send money, check rates, or get started.");
  }, [stage, quoteContext, handleCreateQuote, setQuoteContext, setStage, appendAgentMessage, toast]);

  return { handleIntent };
};
