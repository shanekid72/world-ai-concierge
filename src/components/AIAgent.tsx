
import React, { useEffect } from 'react';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatControls from './chat/ChatControls';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { TransactionFlow } from './chat/TransactionFlow';
import { ChatStageHandler } from './chat/ChatStageHandler';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
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
    handleCreateQuote,
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

  useEffect(() => {
    if (stage === 'intro') {
      setInputValue("👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.");
      handleSendMessage();
      setTimeout(() => {
        setInputValue("✨ Would you like to go through the full onboarding journey, or jump straight into testing our legendary worldAPI?");
        handleSendMessage();
        setStage('choosePath');
      }, 1000);
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

          // Use setInputValue + handleSendMessage to send the message
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

  const handleIntent = async (message: string) => {
    if (!message.trim()) return;

    const lower = message.toLowerCase();

    if (lower.includes('status') && quoteContext.lastTxnRef) {
      try {
        const result = await enquireTransaction(quoteContext.lastTxnRef);
        const status = result?.data?.status;
        const statusMsg = {
          IN_PROGRESS: "🕒 Your transaction is currently *IN PROGRESS*.",
          DELIVERED: "✅ Delivered! 🎉 Your money has arrived.",
          FAILED: "❌ Unfortunately, your transaction *FAILED*.",
          CANCELLED: "🚫 This transaction was *CANCELLED*.",
        }[status] || `ℹ️ Status: ${status}`;
        
        // Set the value and then call the handler
        setInputValue(statusMsg);
        handleSendMessage();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch transaction status. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Transaction flow handling
    if (stage === 'init' && lower.includes("send") && lower.includes("money")) {
      setInputValue("💬 Great! How much would you like to send?");
      handleSendMessage();
      setQuoteContext({});
      setStage('amount');
      return;
    }

    if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      setInputValue("📍 Got it. What is the destination country code? (e.g., PK for Pakistan)");
      handleSendMessage();
      setStage('country');
      return;
    }

    if (stage === 'country' && lower.match(/^[A-Z]{2}$/i) && quoteContext.amount) {
      const to = lower.toUpperCase();
      try {
        const payload = {
          sending_country_code: 'AE',
          sending_currency_code: 'AED',
          receiving_country_code: to,
          receiving_currency_code: to === 'PK' ? 'PKR' : 'INR',
          sending_amount: quoteContext.amount,
          receiving_mode: 'BANK',
          type: 'SEND',
          instrument: 'REMITTANCE'
        };
        
        const quoteResult = await handleCreateQuote(payload);
        const quoteId = quoteResult?.data?.quote_id;
        setQuoteContext(prev => ({ ...prev, to, quoteId }));
        
        setInputValue(
          `📄 Here's your quote: Send ${quoteContext.amount} AED to ${to} → ` +
          `receive ${quoteResult?.data?.receiving_amount} ${quoteResult?.data?.receiving_currency_code}. ` +
          `💱 Rate: ${quoteResult?.data?.fx_rates?.[0]?.rate}\n\n` +
          "✅ Would you like to proceed with this transaction? (yes/no)"
        );
        handleSendMessage();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create quote. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    if (stage === 'confirm' && lower === 'yes' && quoteContext.quoteId) {
      
      setStage('init');
      return;
    }

    if (stage === 'confirm' && lower === 'no') {
      setInputValue("🚫 Transaction cancelled. Let me know if you'd like to try again.");
      handleSendMessage();
      setStage('init');
      return;
    }

    setInputValue('');
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
      
      <ChatStageHandler
        stage={stage}
        onStageChange={(newStage) => setStage(newStage as any)}
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
