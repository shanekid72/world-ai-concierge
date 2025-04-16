
import React from 'react';
import { useCreateQuote } from '@/lib/useWorldApiHooks';
import { toast } from "@/hooks/use-toast";

interface QuoteHandlerProps {
  amount: number;
  destinationCountry: string;
  onQuoteCreated: (quoteId: string) => void;
  onError: () => void;
}

export const QuoteHandler: React.FC<QuoteHandlerProps> = ({
  amount,
  destinationCountry,
  onQuoteCreated,
  onError
}) => {
  const { createQuote } = useCreateQuote();

  const handleCreateQuote = async () => {
    try {
      const payload = {
        sending_country_code: 'AE',
        sending_currency_code: 'AED',
        receiving_country_code: destinationCountry,
        receiving_currency_code: destinationCountry === 'PK' ? 'PKR' : 'INR',
        sending_amount: amount,
        receiving_mode: 'BANK',
        type: 'SEND',
        instrument: 'REMITTANCE'
      };

      const result = await createQuote(payload);
      const quoteId = result?.data?.quote_id;
      
      if (quoteId) {
        onQuoteCreated(quoteId);
      } else {
        throw new Error('No quote ID received');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
      onError();
    }
  };

  React.useEffect(() => {
    if (amount && destinationCountry) {
      handleCreateQuote();
    }
  }, [amount, destinationCountry]);

  return null;
};
