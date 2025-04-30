
import React from 'react';
import { QuoteHandler } from '../transaction/QuoteHandler';
import { TransactionHandler } from '../transaction/TransactionHandler';

interface TransactionFlowProps {
  amount: number;
  destinationCountry: string;
  onQuoteCreated: (quoteId: string) => void;
  onTransactionCreated: (txnRef: string) => void;
  onError: () => void;
}

export const TransactionFlow: React.FC<TransactionFlowProps> = ({
  amount,
  destinationCountry,
  onQuoteCreated,
  onTransactionCreated,
  onError
}) => {
  const [quoteId, setQuoteId] = React.useState<string>("");

  return (
    <>
      {!quoteId && (
        <QuoteHandler
          amount={amount}
          destinationCountry={destinationCountry}
          onQuoteCreated={(newQuoteId) => {
            setQuoteId(newQuoteId);
            onQuoteCreated(newQuoteId);
          }}
          onError={onError}
        />
      )}
      {quoteId && (
        <TransactionHandler
          quoteId={quoteId}
          destinationCountry={destinationCountry}
          onTransactionCreated={onTransactionCreated}
          onError={onError}
        />
      )}
    </>
  );
};
