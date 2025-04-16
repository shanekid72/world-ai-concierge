
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
  
  // Use this ref to ensure welcome message is only shown once
  const hasShownIntro = useRef(false);

  const { handleIntent } = useTransactionFlow(setInputValue, handleSendMessage);

  // Only send the welcome message once when component mounts
  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      // Update welcome message
      const welcomeMessage = "Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.\n\n✨ Wanna go through onboarding or skip to testing our legendary worldAPI?";
      
      // Add message directly to conversation
      const agentMessage = {
        id: Date.now().toString(),
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      conversation.messages.push(agentMessage);
      
      // Force update to trigger re-render
      setInputValue('');
      handleSendMessage();
    }
  }, [stage, setInputValue, conversation.messages, handleSendMessage]);

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

          setInputValue('');
          const message = statusMsg[status] || `ℹ️ Status: ${status}`;
          
          // Add message directly to conversation
          const agentMessage = {
            id: Date.now().toString(),
            content: message,
            isUser: false,
            timestamp: new Date()
          };
          
          conversation.messages.push(agentMessage);
          
          // Force update
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
  }, [autoPoll, quoteContext.lastTxnRef, enquireTransaction, handleSendMessage, setInputValue, setAutoPoll, conversation.messages]);

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
          setInputValue('');
          
          // Add message directly to conversation
          const agentMessage = {
            id: Date.now().toString(),
            content: message,
            isUser: false,
            timestamp: new Date()
          };
          
          conversation.messages.push(agentMessage);
          
          // Force update
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
              if (inputValue.trim()) {
                // Add user message to conversation first
                const userMessage = {
                  id: Date.now().toString(),
                  content: inputValue,
                  isUser: true,
                  timestamp: new Date()
                };
                
                conversation.messages.push(userMessage);
                
                // Force a render to update UI with user message
                handleSendMessage();
                
                // Process the intent after message is shown
                handleIntent(inputValue);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim()) {
                  // Add user message to conversation first
                  const userMessage = {
                    id: Date.now().toString(),
                    content: inputValue,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  conversation.messages.push(userMessage);
                  
                  // Force a render to update UI with user message
                  handleSendMessage();
                  
                  // Process the intent after message is shown
                  handleIntent(inputValue);
                }
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
