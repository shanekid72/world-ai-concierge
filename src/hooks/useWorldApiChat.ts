
import { useState, useCallback } from 'react';
import { useCreateQuote, useCreateTransaction, useConfirmTransaction, useEnquireTransaction } from '../lib/useWorldApiHooks';
import { toast } from "@/hooks/use-toast";

type Stage = 'intro' | 'choosePath' | 'collectMinimalInfo' | 'standardOnboarding' | 'init' | 'amount' | 'country' | 'confirm';

interface QuoteContext {
  amount?: number;
  to?: string;
  quoteId?: string;
  lastTxnRef?: string;
}

export const useWorldApiChat = () => {
  const [stage, setStage] = useState<Stage>('intro');
  const [quoteContext, setQuoteContext] = useState<QuoteContext>({});
  const [autoPoll, setAutoPoll] = useState(false);

  const { createQuote, loading: quoteLoading } = useCreateQuote();
  const { createTransaction } = useCreateTransaction();
  const { confirmTransaction } = useConfirmTransaction();
  const { enquireTransaction } = useEnquireTransaction();

  const handleCreateQuote = useCallback(async (payload: any) => {
    try {
      const result = await createQuote(payload);
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [createQuote]);

  return {
    stage,
    setStage,
    quoteContext,
    setQuoteContext,
    autoPoll,
    setAutoPoll,
    quoteLoading,
    handleCreateQuote,
    createTransaction,
    confirmTransaction,
    enquireTransaction
  };
};

