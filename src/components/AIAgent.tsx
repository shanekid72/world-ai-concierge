import React, { useEffect } from 'react';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ChatControls from './chat/ChatControls';
import { useChatState } from '../hooks/useChatState';
import { useWorldApiChat } from '../hooks/useWorldApiChat';
import { toast } from "@/hooks/use-toast";

interface AIAgentProps {
  onStageChange: (stageId: string) => void;
  currentStepId: string;
}

const AIAgent: React.FC<AIAgentProps> = ({ onStageChange, currentStepId }) => {
  const {
    inputValue,
    setInputValue,
    conversation,
    isAgentTyping,
    handleSendMessage: originalHandleSendMessage,
    handleReset
  } = useChatState({ currentStepId, onStageChange });

  const {
    stage,
    setStage,
    quoteContext,
    setQuoteContext,
    autoPoll,
    setAutoPoll,
    quoteLoading,
    handleCreateQuote,
    createTransaction,
    confirmTransaction,
    enquireTransaction
  } = useWorldApiChat();

  useEffect(() => {
    if (stage === 'intro') {
      setInputValue("👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.");
      originalHandleSendMessage();
      
      setTimeout(() => {
        setInputValue("✨ Would you like to go through the full onboarding journey, or jump straight into testing our legendary worldAPI?");
        originalHandleSendMessage();
        setStage('choosePath');
      }, 1000);
    }
  }, [stage, setInputValue, originalHandleSendMessage]);

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

          // Use setInputValue + originalHandleSendMessage to send the message
          setInputValue(statusMsg[status] || `ℹ️ Status: ${status}`);
          originalHandleSendMessage();

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
  }, [autoPoll, quoteContext.lastTxnRef, enquireTransaction, originalHandleSendMessage, setInputValue]);

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
        
        // Set the value and then call the original handler
        setInputValue(statusMsg);
        originalHandleSendMessage();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch transaction status. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    if (stage === 'init' && lower.includes("send") && lower.includes("money")) {
      setInputValue("💬 Great! How much would you like to send?");
      originalHandleSendMessage();
      setQuoteContext({});
      setStage('amount');
      return;
    }

    if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      setInputValue("📍 Got it. What is the destination country code? (e.g., PK for Pakistan)");
      originalHandleSendMessage();
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
        originalHandleSendMessage();
        setStage('confirm');
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
      try {
        const txnPayload = {
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
            nationality: quoteContext.to || 'PK',
            relation_code: '32',
            bank_details: {
              account_type_code: '1',
              account_number: '1234567890',
              iso_code: 'ALFHPKKA068'
            }
          },
          transaction: {
            quote_id: quoteContext.quoteId
          }
        };

        const txnResult = await createTransaction(txnPayload);
        const txnRef = txnResult?.data?.transaction_ref_number;

        if (txnRef) {
          await confirmTransaction(txnRef);
          setQuoteContext(prev => ({ ...prev, lastTxnRef: txnRef }));
          setInputValue(`📦 Transaction created and confirmed! Reference Number: ${txnRef}`);
          originalHandleSendMessage();
          setAutoPoll(true);
        } else {
          throw new Error('No transaction reference received');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create or confirm transaction. Please try again.",
          variant: "destructive",
        });
      }
      setStage('init');
      return;
    }

    if (stage === 'confirm' && lower === 'no') {
      setInputValue("🚫 Transaction cancelled. Let me know if you'd like to try again.");
      originalHandleSendMessage();
      setStage('init');
      return;
    }

    if (stage === 'choosePath') {
      if (lower.includes('onboarding')) {
        setInputValue("Awesome! Let's start your onboarding. First, what's your full name?");
        originalHandleSendMessage();
        setStage('standardOnboarding');
        return;
      } else if (lower.includes('test') || lower.includes('integrate')) {
        setInputValue("⚙️ Sweet! Let's get you into testing mode. Just need a few deets:");
        originalHandleSendMessage();
        setInputValue("1. Your name\n2. Company name\n3. Contact info (email/phone)\n— then we'll launch you straight into integration testing 🚀");
        originalHandleSendMessage();
        setStage('collectMinimalInfo');
        return;
      }
      setInputValue("Hmm, I didn't catch that — onboarding or testing?");
      originalHandleSendMessage();
      return;
    }

    if (stage === 'standardOnboarding') {
      setInputValue("🎓 (Pretend we’re doing KYC, compliance, and business requirements...) All done! ✅ Ready to integrate?");
      originalHandleSendMessage();
      setStage('init');
      return;
    }

    if (stage === 'collectMinimalInfo') {
      setInputValue("🙌 Got what I need! Let’s jump into worldAPI testing mode.");
      originalHandleSendMessage();
      setStage('init');
      return;
    }

    setInputValue("🤖 Sorry, I didn't understand. Try saying 'I want to send money'.");
    originalHandleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleIntent(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={conversation.messages} 
        isAgentTyping={isAgentTyping || quoteLoading} 
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
            onKeyDown={handleKeyDown}
          />
          <ChatControls onReset={handleReset} />
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
