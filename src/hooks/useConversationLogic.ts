import { useCallback } from 'react';
import { Stage } from './useWorldApiChat';
import { fetchCurrencyRate } from '../utils/currencyRateService';
import { useSmartAgentResponse } from '../hooks/useSmartAgentResponse';
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
            description: `You sent ${quoteContext.amount} ${quoteContext.currency} to ${quoteContext.to}.\nRef: ${txn?.id || 'TXN-UNKNOWN'}`
          });

          setStage('completed');
          return;
        }
      }

      if (stage === 'choosePath') {
        if (lower.includes("test") || lower.includes("api")) {
          appendAgentMessage("Awesome! Let’s get you into technical setup...");
          setStage("technical-requirements");
          return;
        }

        if (lower.includes("send money")) {
          appendAgentMessage("Got it — we’ll collect amount and country next.");
          setStage("amount");
          return;
        }

        if (lower.includes("rates") || lower.includes("fx")) {
          appendAgentMessage("FX rate coming up — what currency pair?");
          setStage("rate");
          return;
        }

        appendAgentMessage("Hmm, want to:\n- Test API\n- Send Money\n- Get Rates?");
        return;
      }

      if (stage === 'technical-requirements') {
        appendAgentMessage(
          "worldAPI supports:\n- 🌐 REST APIs\n- 🔁 Real-time FX via Webhooks\n- 🔐 Secure OAuth2\n\nWanna:\n- 🔨 Start Integration\n- 📚 View Docs\n- 🤝 Talk to Support?"
        );
        return;
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
