import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type Stage = 'intro' | 'choosePath' | 'collectMinimalInfo' | 'standardOnboarding' | 'init' | 'amount' | 'country' | 'confirm' | 'technical-requirements' | 'completed' | 'go-live';

interface QuoteContext {
  amount?: number;
  to?: string;
  quoteId?: string;
  lastTxnRef?: string;
  currency?: string;
}

export const useWorldApiChat = () => {
  const [stage, setStage] = useState<Stage>('intro');
  const [quoteContext, setQuoteContext] = useState<QuoteContext>({});
  const [autoPoll, setAutoPoll] = useState(false);
  const { toast } = useToast();

  const handleCreateQuote = useCallback(async (payload: any) => {
    try {
      console.log("Creating quote with:", payload);
      return {
        quoteId: "mock-quote-id",
        amount: payload.amount,
        to: payload.to,
        currency: payload.currency || "USD"
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const setStageWithLogging = useCallback((newStage: Stage) => {
    console.log(`Stage changing from ${stage} to ${newStage}`);
    setStage(newStage);
  }, [stage]);

  return {
    stage,
    setStage: setStageWithLogging,
    quoteContext,
    setQuoteContext,
    autoPoll,
    setAutoPoll,
    handleCreateQuote
  };
};
