
import { useCallback } from 'react';
import { Stage } from './useWorldApiChat';
import { useSmartAgentResponse } from './useSmartAgentResponse';
import { useToast } from '@/hooks/use-toast';

export const useConversationLogic = (
  stage: Stage,
  setStage: (stage: Stage) => void,
  appendAgentMessage: (message: string) => void,
  setShowBootup: (show: boolean) => void,
  setQuoteContext: (context: any) => void,
  handleIntent: (message: string) => Promise<void>,
  handleCreateQuote: (payload: any) => Promise<any>,
  handleCreateTransaction: (quoteId: string) => Promise<any>,
  quoteContext: any
) => {
  const getSmartReply = useSmartAgentResponse();
  const { toast } = useToast();

  const processUserInput = useCallback(async (value: string) => {
    if (!value.trim()) return;

    console.log("Processing user input in stage:", stage);
    const lower = value.toLowerCase();

    try {
      if (stage === 'confirm') {
        if (lower.includes("yes") || lower.includes("confirm") || lower.includes("go ahead")) {
          appendAgentMessage("Perfect, confirming your transaction now...");

          const txn = await handleCreateTransaction(quoteContext?.quoteId);

          toast({
            title: 'Transaction Confirmed',
            description: `You sent ${quoteContext.amount} ${quoteContext.currency} to ${quoteContext.to}.
Ref: ${txn?.id || 'TXN-UNKNOWN'}`
          });

          setStage('completed');
          return;
        }
      }

      if (stage === 'intro' || stage === 'amount' || stage === 'country') {
        const aiReply = await getSmartReply({
          stage,
          userInput: value,
          context: {},
        });
        appendAgentMessage(aiReply);
        return;
      }

      await handleIntent(value);
    } catch (err) {
      console.error("Error handling user input:", err);
      appendAgentMessage("Oops! Something went wrong while processing your request. Try again.");
    }
  }, [stage, setStage, appendAgentMessage, handleIntent, quoteContext]);

  return { processUserInput };
};
