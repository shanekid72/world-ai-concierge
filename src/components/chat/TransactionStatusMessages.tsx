
import React, { useEffect } from 'react';
import { Message } from '@/utils/types';

interface TransactionStatusMessagesProps {
  autoPoll: boolean;
  lastTxnRef?: string;
  enquireTransaction: (txnRef: string) => Promise<any>;
  setAutoPoll: (value: boolean) => void;
  conversation: { messages: Message[] };
  handleSendMessage: () => void;
}

export const TransactionStatusMessages: React.FC<TransactionStatusMessagesProps> = ({
  autoPoll,
  lastTxnRef,
  enquireTransaction,
  setAutoPoll,
  conversation,
  handleSendMessage,
}) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPoll && lastTxnRef) {
      interval = setInterval(async () => {
        try {
          const result = await enquireTransaction(lastTxnRef);
          const status = result?.data?.status;

          const statusMsg: Record<string, string> = {
            IN_PROGRESS: "🕒 Live update: Your transaction is currently *IN PROGRESS*.",
            DELIVERED: "✅ Success! Your transaction has been *DELIVERED*. 🎉",
            FAILED: "❌ Heads up: Your transaction *FAILED*. Please try again.",
            CANCELLED: "🚫 Update: Your transaction was *CANCELLED*.",
          };

          const message = statusMsg[status] || `ℹ️ Status: ${status}`;
          
          const agentMessage = {
            id: Date.now().toString(),
            content: message,
            isUser: false,
            timestamp: new Date()
          };
          
          conversation.messages.push(agentMessage);
          handleSendMessage();

          if (['DELIVERED', 'FAILED', 'CANCELLED'].includes(status)) {
            clearInterval(interval);
            setAutoPoll(false);
          }
        } catch (error) {
          console.error('Error polling transaction status:', error);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoPoll, lastTxnRef, enquireTransaction, handleSendMessage, setAutoPoll, conversation.messages]);

  return null;
};
