import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useQuoteExtraction } from './useQuoteExtraction';

interface TransactionFlowProps {
  message: string;
  stage: string;
  setStage: (stage: string) => void;
  setQuoteContext: (context: any) => void;
  handleCreateQuote: (payload: any) => Promise<any>;
}

export const useTransactionFlow = (props: TransactionFlowProps) => {
  const { message, stage, setStage, setQuoteContext, handleCreateQuote } = props;
  const extract = useQuoteExtraction();
  const { toast } = useToast();

  useEffect(() => {
    if (stage !== 'intro' && stage !== 'technical-requirements') return;
    if (!message) return;

    const extracted = extract(message);
    if (!extracted.amount || !extracted.to) return;

    const handleConfirm = async () => {
      try {
        const result = await handleCreateQuote({
          amount: extracted.amount,
          to: extracted.to,
          currency: extracted.currency || "USD"
        });

        setQuoteContext({
          ...extracted,
          quoteId: result.id,
          currency: extracted.currency || "USD"
        });

        setStage('confirm');
      } catch (error) {
        console.error("Error creating quote:", error);
      }
    };

    // Using a simpler approach for toast
    toast(`Send ${extracted.amount} ${extracted.currency || "USD"} to ${extracted.to}?`, {
      type: 'info'
    });
    
    handleConfirm();
    
  }, [message, stage, extract, toast, handleCreateQuote, setQuoteContext, setStage]);

  return null;
};
