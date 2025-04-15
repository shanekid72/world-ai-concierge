
import React from 'react';
import { useCreateQuote, useCreateTransaction, useConfirmTransaction } from '@/lib/useWorldApiHooks';
import { toast } from "@/hooks/use-toast";

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
  const { createQuote } = useCreateQuote();
  const { createTransaction } = useCreateTransaction();
  const { confirmTransaction } = useConfirmTransaction();

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

  const handleCreateTransaction = async (quoteId: string) => {
    try {
      const result = await createTransaction({
        type: 'SEND',
        source_of_income: 'SLRY',
        purpose_of_txn: 'SAVG',
        instrument: 'REMITTANCE',
        message: 'Chat-based transaction',
        sender: {
          agent_customer_number: '1234567890',
          mobile_number: '+971500000000',
          first_name: 'John',
          last_name: 'Doe',
          sender_id: [{ id_code: '15', id: 'ID123456789' }],
          date_of_birth: '1990-01-01',
          country_of_birth: 'IN',
          sender_address: [{
            address_type: 'PRESENT',
            address_line: 'Main St',
            town_name: 'Dubai',
            country_code: 'AE'
          }],
          nationality: 'IN'
        },
        receiver: {
          mobile_number: '+919000000000',
          first_name: 'Ali',
          last_name: 'Khan',
          nationality: destinationCountry,
          relation_code: '32',
          bank_details: {
            account_type_code: '1',
            account_number: '1234567890',
            iso_code: 'ALFHPKKA068'
          }
        },
        transaction: {
          quote_id: quoteId
        }
      });

      const txnRef = result?.data?.transaction_ref_number;
      if (txnRef) {
        await confirmTransaction(txnRef);
        onTransactionCreated(txnRef);
      } else {
        throw new Error('No transaction reference received');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create or confirm transaction",
        variant: "destructive",
      });
      onError();
    }
  };

  return null; // This is a logic-only component
};
