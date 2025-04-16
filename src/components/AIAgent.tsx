
import React, { useState, useRef } from 'react';
import MessageList from './chat/MessageList';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { useTransactionFlow } from '../hooks/useTransactionFlow';
import { UserInputHandler } from './chat/UserInputHandler';
import AnimatedTerminal from './chat/AnimatedTerminal';
import { ChatStageHandler } from './chat/ChatStageHandler';
import { ChatInitializer } from './chat/ChatInitializer';
import { useConversationLogic } from '../hooks/useConversationLogic';
import { toast } from "@/hooks/use-toast";

interface AIAgentProps {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

const AIAgent: React.FC<AIAgentProps> = ({ onStageChange, currentStepId }) => {
  const {
    stage,
    setStage,
    quoteContext,
    autoPoll,
    setQuoteContext,
    handleCreateQuote,
    createTransaction,
    confirmTransaction,
    enquireTransaction
  } = useWorldApiChat();

  const {
    inputValue,
    setInputValue,
    conversation,
    isAgentTyping,
    appendAgentMessage,
    appendUserMessage
  } = useChatState({ currentStepId, onStageChange });

  const { isPolling } = useTransactionPolling(quoteContext.lastTxnRef, autoPoll);
  const [showBootup, setShowBootup] = useState(false);
  const conversationStarted = useRef(false);
  const { handleIntent } = useTransactionFlow(setInputValue, appendAgentMessage);

  const handleCreateTransaction = async (quoteId: string) => {
    try {
      const payload = {
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
          nationality: quoteContext.to || 'IN',
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
      };
      
      const result = await createTransaction(payload);
      if (!result || !result.data) {
        throw new Error("Failed to create transaction: No data returned");
      }
      
      const txnRef = result.data.transaction_ref_number;
      if (txnRef) {
        await confirmTransaction(txnRef);
        setQuoteContext(prev => ({ ...prev, lastTxnRef: txnRef }));
        return result;
      } else {
        throw new Error("No transaction reference number received");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Transaction Error",
        description: "Failed to create or confirm the transaction",
        variant: "destructive"
      });
      throw error;
    }
  };

  const { processUserInput } = useConversationLogic(
    stage,
    setStage,
    appendAgentMessage,
    setShowBootup,
    setQuoteContext,
    handleIntent,
    handleCreateQuote,
    handleCreateTransaction,
    quoteContext
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserInput(inputValue);
      appendUserMessage(inputValue);
      conversationStarted.current = true;
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={conversation.messages} isAgentTyping={isAgentTyping} />
      
      <ChatInitializer stage={stage} appendAgentMessage={appendAgentMessage} />
      
      {stage !== 'intro' && (
        <ChatStageHandler 
          stage={stage} 
          onStageChange={setStage} 
          onMessage={appendAgentMessage}
          conversationStarted={conversationStarted.current}
        />
      )}
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        {showBootup ? (
          <AnimatedTerminal
            onComplete={() => {
              appendAgentMessage("Your worldAPI assistant is now ready to use. How can I help you today? 🌍");
              setShowBootup(false);
              setStage('technical-requirements');
            }}
          />
        ) : (
          <div className="flex items-center">
            <UserInputHandler
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onSend={() => {
                processUserInput(inputValue);
                appendUserMessage(inputValue);
                conversationStarted.current = true;
                setInputValue('');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgent;
