
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
      const result = await createTransaction({ quoteId });
      return result;
    } catch (error) {
      console.error("Error creating transaction:", error);
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
