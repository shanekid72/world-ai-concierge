import React, { useEffect, useRef } from 'react';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatControls from './chat/ChatControls';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat, type Stage } from '../hooks/useWorldApiChat';
import { TransactionFlow } from './chat/TransactionFlow';
import { ChatStageHandler } from './chat/ChatStageHandler';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { useTransactionFlow } from '../hooks/useTransactionFlow';

interface AIAgentProps {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

const AIAgent: React.FC<AIAgentProps> = ({ onStageChange, currentStepId }) => {
  const {
    stage,
    setStage,
    quoteContext,
    setQuoteContext,
    autoPoll,
    setAutoPoll,
    enquireTransaction
  } = useWorldApiChat();

  const {
    inputValue,
    setInputValue,
    conversation,
    isAgentTyping,
    handleReset,
    handleSendMessage
  } = useChatState({ currentStepId, onStageChange });

  const { isPolling } = useTransactionPolling(quoteContext.lastTxnRef, autoPoll);
  
  const hasInitialized = useRef(false);

  const { handleIntent } = useTransactionFlow(setInputValue, handleSendMessage);

  useEffect(() => {
    if (stage === 'intro' && !hasInitialized.current) {
      hasInitialized.current = true;
      setInputValue("Hello! I'm your World API integration assistant. I'll help you connect your financial institution to our global payment networks. What type of organization are you connecting today?");
      handleSendMessage();
      
      // No automatic second message - wait for user input to trigger next stage
    }
  }, [stage, setInputValue, handleSendMessage, setStage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPoll && quoteContext.lastTxnRef) {
      interval = setInterval(async () => {
        try {
          const result = await enquireTransaction(quoteContext.lastTxnRef!);
          const status = result?.data?.status;

          const statusMsg: Record<string, string> = {
            IN_PROGRESS: "🕒 Live update: Your transaction is currently *IN PROGRESS*.",
            DELIVERED: "✅ Success! Your transaction has been *DELIVERED*. 🎉",
            FAILED: "❌ Heads up: Your transaction *FAILED*. Please try again.",
            CANCELLED: "🚫 Update: Your transaction was *CANCELLED*.",
          };

          setInputValue(statusMsg[status] || `ℹ️ Status: ${status}`);
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
  }, [autoPoll, quoteContext.lastTxnRef, enquireTransaction, handleSendMessage, setInputValue, setAutoPoll]);

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={conversation.messages} 
        isAgentTyping={isAgentTyping || isPolling} 
      />
      
      <TransactionFlow
        amount={quoteContext.amount || 0}
        destinationCountry={quoteContext.to || ''}
        onQuoteCreated={(quoteId) => {
          setQuoteContext(prev => ({ ...prev, quoteId }));
          setStage('confirm');
        }}
        onTransactionCreated={(txnRef) => {
          setQuoteContext(prev => ({ ...prev, lastTxnRef: txnRef }));
          setAutoPoll(true);
          setStage('init');
        }}
        onError={() => setStage('init')}
      />
      
      <ChatStageHandler
        stage={stage as Stage}
        onStageChange={setStage}
        onMessage={(message) => {
          setInputValue(message);
          handleSendMessage();
        }}
      />
      
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <MessageInput
            inputValue={inputValue}
            isAgentTyping={isAgentTyping}
            onInputChange={setInputValue}
            onSendMessage={() => {
              handleIntent(inputValue);
              setInputValue('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleIntent(inputValue);
                setInputValue('');
              }
            }}
          />
          <ChatControls onReset={handleReset} />
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
