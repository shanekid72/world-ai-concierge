
import React, { useEffect, useRef } from 'react';
import MessageList from './chat/MessageList';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { TransactionFlow } from './chat/TransactionFlow';
import { ChatStageHandler } from './chat/ChatStageHandler';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { useTransactionFlow } from '../hooks/useTransactionFlow';
import { TransactionStatusMessages } from './chat/TransactionStatusMessages';
import { UserInputHandler } from './chat/UserInputHandler';

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
  const hasShownIntro = useRef(false);
  const { handleIntent } = useTransactionFlow(setInputValue, handleSendMessage);

  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      console.log("Showing intro message");
      const welcomeMessage = "Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.\n\n✨ Wanna go through onboarding or skip to testing our legendary worldAPI?";
      
      const agentMessage = {
        id: Date.now().toString(),
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      conversation.messages.push(agentMessage);
      setInputValue('');
      handleSendMessage();
    }
  }, [stage, setInputValue, conversation.messages, handleSendMessage]);

  const processUserInput = (value: string) => {
    if (!value.trim()) return;
    
    console.log("Processing user input:", value);
    
    // First add the user message to the conversation
    const userMessage = {
      id: Date.now().toString(),
      content: value,
      isUser: true,
      timestamp: new Date()
    };
    
    conversation.messages.push(userMessage);
    handleSendMessage();
    
    // Clear input after adding the user message
    setInputValue('');
    
    // Then immediately add a default response while processing the intent
    const defaultResponse = {
      id: Date.now().toString(),
      content: "I'm processing your request...",
      isUser: false,
      timestamp: new Date()
    };
    
    conversation.messages.push(defaultResponse);
    handleSendMessage();
    
    // Now process the intent which may add additional messages
    handleIntent(value).catch(err => {
      console.error("Error handling intent:", err);
      
      // Add error message from agent
      const errorMessage = {
        id: Date.now().toString(),
        content: "I'm sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      conversation.messages.push(errorMessage);
      handleSendMessage();
    });
  };

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
      
      <TransactionStatusMessages
        autoPoll={autoPoll}
        lastTxnRef={quoteContext.lastTxnRef}
        enquireTransaction={enquireTransaction}
        setAutoPoll={setAutoPoll}
        conversation={conversation}
        handleSendMessage={handleSendMessage}
      />
      
      <ChatStageHandler
        stage={stage}
        onStageChange={setStage}
        onMessage={(message) => {
          console.log("Adding agent message:", message);
          
          const agentMessage = {
            id: Date.now().toString(),
            content: message,
            isUser: false,
            timestamp: new Date()
          };
          
          conversation.messages.push(agentMessage);
          handleSendMessage();
        }}
      />
      
      <UserInputHandler
        inputValue={inputValue}
        isAgentTyping={isAgentTyping}
        onInputChange={setInputValue}
        onSendMessage={processUserInput}
        onReset={handleReset}
      />
    </div>
  );
};

export default AIAgent;
