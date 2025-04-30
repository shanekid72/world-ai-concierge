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
  const { toast } = useToast();
  const { getResponse } = useSmartAgentResponse();

  const handleUserMessage = useCallback(async (value: string) => {
    if (!value) return;
    
    try {
      if (stage === 'confirm') { 
        if (value.toLowerCase().includes('yes') || value.toLowerCase().includes('confirm')) {
          // Send the transaction
          appendAgentMessage("Processing your transaction now...");
          
          if (!quoteContext?.quoteId) {
            appendAgentMessage("I couldn't find a valid quote. Let's try again.");
            setStage('amount');
            return;
          }

          const txn = await handleCreateTransaction(quoteContext?.quoteId);

          toast(`You sent ${quoteContext.amount} ${quoteContext.currency} to ${quoteContext.to}. Ref: ${txn?.id || 'TXN-UNKNOWN'}`, {
            type: 'success'
          });

          setStage('completed');
          return;
        } else {
          appendAgentMessage("Transaction cancelled. How else can I assist you today?");
          setStage('intro');
          return;
        }
      }

      if (stage === 'intro' || stage === 'amount' || stage === 'country') {
        const aiReply = await getResponse({
          stage,
          userInput: value,
          context: {},
        });
        
        if (aiReply) {
          appendAgentMessage(aiReply);
        } else {
          appendAgentMessage("I'm having trouble processing that. Let me try again.");
        }
        return;
      }

      await handleIntent(value);
    } catch (error) {
      console.error("Error handling user message:", error);
      appendAgentMessage("I encountered an error processing your request. Please try again.");
    }
  }, [
    stage, 
    appendAgentMessage, 
    handleIntent, 
    handleCreateTransaction, 
    quoteContext, 
    setStage, 
    toast,
    getResponse
  ]);

  return { handleUserMessage };
};
