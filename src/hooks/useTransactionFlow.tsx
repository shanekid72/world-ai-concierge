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
  const { toast } = useToast();
  const extract = useQuoteExtraction();

  useEffect(() => {
    if (!message || stage !== 'technical-requirements') return;

    const extracted = extract(message);
    if (!extracted.amount || !extracted.to || !extracted.currency) return;

    const handleConfirm = async () => {
      const result = await handleCreateQuote({
        amount: extracted.amount,
        currency: extracted.currency,
        to: extracted.to,
      });
      setQuoteContext((prev: any) => ({ ...prev, ...extracted, quoteId: result.id }));
      setStage('confirm');
    };

    const action = (
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    );

    toast({
      title: 'Quote extracted 🚀',
      description: `Send ${extracted.amount} ${extracted.currency} to ${extracted.to}?`,
      action,
    });
  }, [message, stage, extract, toast, handleCreateQuote, setQuoteContext, setStage]);

  return null;
};
