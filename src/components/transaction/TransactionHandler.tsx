import React from 'react';
import { useCreateTransaction, useConfirmTransaction } from '@/lib/useWorldApiHooks';
import { toast } from "@/hooks/use-toast";

interface TransactionHandlerProps {
  quoteId: string;
  destinationCountry: string;
  onTransactionCreated: (txnRef: string) => void;
  onError: () => void;
}

export const TransactionHandler: React.FC<TransactionHandlerProps> = ({
  quoteId,
  destinationCountry,
  onTransactionCreated,
  onError
}) => {
  const { createTransaction } = useCreateTransaction();
  const { confirmTransaction } = useConfirmTransaction();

  const handleCreateTransaction = async () => {
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
      toast("Failed to create or confirm transaction", { type: 'error' });
      onError();
    }
  };

  React.useEffect(() => {
    if (quoteId) {
      handleCreateTransaction();
    }
  }, [quoteId]);

  return null;
};
