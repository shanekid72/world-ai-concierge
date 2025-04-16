
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

  // Show intro message only once
  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      console.log("Showing intro message");
      const welcomeMessage = "Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.\n\n✨ Wanna go through onboarding or skip to testing our legendary worldAPI?";
      
      const agentMessage = {
        id: `agent-intro-${Date.now()}`,
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      conversation.messages.push(agentMessage);
      handleSendMessage();
    }
  }, [stage, conversation.messages, handleSendMessage]);

  const processUserInput = (value: string) => {
    if (!value.trim()) return;
    
    console.log("Processing user input:", value);
    
    // First add the user message to the conversation
    const userMessage = {
      id: `user-${Date.now()}`,
      content: value,
      isUser: true,
      timestamp: new Date()
    };
    
    conversation.messages.push(userMessage);
    handleSendMessage();
    
    // Clear input after adding the user message
    setInputValue('');
    
    // Process the intent
    try {
      console.log("Calling handleIntent with message:", value);
      handleIntent(value);
    } catch (err) {
      console.error("Error handling intent:", err);
      
      // Add error message from agent
      const errorMessage = {
        id: `agent-error-${Date.now()}`,
        content: "I'm sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      conversation.messages.push(errorMessage);
      handleSendMessage();
      
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    }
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
            id: `agent-stage-${Date.now()}`,
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
