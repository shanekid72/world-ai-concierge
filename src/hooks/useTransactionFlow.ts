
import { useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useWorldApiChat, type Stage } from './useWorldApiChat';

interface UseTransactionFlowReturn {
  handleIntent: (message: string) => Promise<void>;
}

export const useTransactionFlow = (
  setInputValue: (value: string) => void,
  handleSendMessage: () => void
): UseTransactionFlowReturn => {
  const {
    stage,
    setStage,
    quoteContext,
    setQuoteContext,
    handleCreateQuote,
  } = useWorldApiChat();

  const handleIntent = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    console.log(`Processing intent in stage "${stage}" with message: "${message}"`);
    const lower = message.toLowerCase();
    
    // Handle initial stage for choosing paths
    if (stage === 'intro') {
      console.log("Processing input in intro stage");
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legendary")) {
        console.log("Detected test/skip/worldapi command in intro stage");
        // Set stage to choosePath to trigger animation
        setStage('choosePath');
        return;
      }
      
      if (lower.includes("onboard") || lower.includes("start")) {
        console.log("Detected onboarding command in intro stage");
        setStage('standardOnboarding');
        return;
      }
      
      // If we're in intro but command wasn't recognized, send general response
      const introResponse = "I'm Dolly! Would you like to go through onboarding or skip straight to testing worldAPI?";
      console.log("Adding default intro response:", introResponse);
      
      const agentMessage = {
        id: `agent-default-${Date.now()}`,
        content: introResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setInputValue("");
      setTimeout(() => {
        // Add response directly to make sure it appears
        const messageContainer = document.querySelector('.chat-container');
        if (messageContainer) {
          const div = document.createElement('div');
          div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
            <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
              <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
            </div>
            <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
              <div class="whitespace-pre-wrap">${introResponse}</div>
              <div class="text-xs mt-1 text-right text-gray-500">
                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>`;
          messageContainer.appendChild(div);
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 500);
      
      return;
    }

    // Handle technical requirements stage
    if (stage === 'technical-requirements') {
      if ((lower.includes("send") && lower.includes("money"))) {
        const responseText = "💬 Great! How much would you like to send?";
        console.log("Adding money transfer response:", responseText);
        
        const agentMessage = {
          id: `agent-amount-${Date.now()}`,
          content: responseText,
          isUser: false,
          timestamp: new Date()
        };
        
        // Add the message to conversation
        setInputValue("");
        setTimeout(() => {
          // Force add message to DOM
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${responseText}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        setQuoteContext({});
        setStage('amount');
        return;
      }
      
      if (lower.includes("rate") || lower.includes("exchange")) {
        const responseText = "I can check current exchange rates for you. Which currencies are you interested in?";
        
        // Add the message to DOM directly
        setTimeout(() => {
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${responseText}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        return;
      }
      
      if (lower.includes("network") || lower.includes("coverage") || lower.includes("countries")) {
        const responseText = "Our D9 Network covers over 100 countries across Africa, Americas, Asia, Europe, and GCC regions. Any specific region you're interested in?";
        
        // Add the message to DOM directly
        setTimeout(() => {
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${responseText}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        return;
      }
    }

    // Handle amount stage
    if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      
      const responseText = "📍 Got it. What is the destination country code? (e.g., PK for Pakistan)";
      console.log("Adding amount response:", responseText);
      
      // Add the message to DOM directly
      setTimeout(() => {
        const messageContainer = document.querySelector('.chat-container');
        if (messageContainer) {
          const div = document.createElement('div');
          div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
            <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
              <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
            </div>
            <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
              <div class="whitespace-pre-wrap">${responseText}</div>
              <div class="text-xs mt-1 text-right text-gray-500">
                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>`;
          messageContainer.appendChild(div);
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 500);
      
      setStage('country');
      return;
    }

    // Handle country stage
    if (stage === 'country' && /^[A-Z]{2}$/i.test(lower) && quoteContext.amount) {
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
        
        const responseText = 
          `📄 Here's your quote: Send ${quoteContext.amount} AED to ${to} → ` +
          `receive ${quoteResult?.data?.receiving_amount} ${quoteResult?.data?.receiving_currency_code}. ` +
          `💱 Rate: ${quoteResult?.data?.fx_rates?.[0]?.rate}\n\n` +
          "✅ Would you like to proceed with this transaction? (yes/no)";
        
        console.log("Adding quote response:", responseText);
        
        // Add the message to DOM directly
        setTimeout(() => {
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${responseText}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        setStage('confirm');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create quote. Please try again.",
          variant: "destructive",
        });
        
        // Add a default response when error occurs
        const errorResponse = "I'm having trouble creating that quote. Let's try something else. What would you like to do with worldAPI?";
        
        // Add the message to DOM directly
        setTimeout(() => {
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${errorResponse}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        setStage('init');
      }
      return;
    }

    // Handle confirm stage
    if (stage === 'confirm') {
      if (lower === 'yes' && quoteContext.quoteId) {
        const confirmResponse = "Great! Processing your transaction now...";
        
        // Add the message to DOM directly
        setTimeout(() => {
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${confirmResponse}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        setStage('init');
        return;
      }
      
      if (lower === 'no') {
        const cancelResponse = "🚫 Transaction cancelled. Let me know if you'd like to try again.";
        
        // Add the message to DOM directly
        setTimeout(() => {
          const messageContainer = document.querySelector('.chat-container');
          if (messageContainer) {
            const div = document.createElement('div');
            div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
              <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
                <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
              </div>
              <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
                <div class="whitespace-pre-wrap">${cancelResponse}</div>
                <div class="text-xs mt-1 text-right text-gray-500">
                  ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>`;
            messageContainer.appendChild(div);
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        }, 500);
        
        setStage('init');
        return;
      }
    }
    
    // Default fallback for any stage
    console.log("Sending default response for stage:", stage);
    const defaultResponse = getResponseForStageAndMessage(stage, lower);
    
    // Add the message to DOM directly
    setTimeout(() => {
      const messageContainer = document.querySelector('.chat-container');
      if (messageContainer) {
        const div = document.createElement('div');
        div.innerHTML = `<div class="flex mb-4 max-w-[85%] mr-auto justify-start">
          <div class="w-8 h-8 rounded-full bg-worldapi-teal-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden mt-1">
            <img src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" alt="AI" class="w-5 h-5 object-contain">
          </div>
          <div class="rounded-2xl py-3 px-4 shadow-sm animate-fade-in bg-gray-100 text-gray-800 rounded-tl-none">
            <div class="whitespace-pre-wrap">${defaultResponse}</div>
            <div class="text-xs mt-1 text-right text-gray-500">
              ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>`;
        messageContainer.appendChild(div);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 500);
  }, [stage, quoteContext, setQuoteContext, setStage, handleCreateQuote]);

  // Helper function to generate responses based on stage and message
  const getResponseForStageAndMessage = (stage: Stage, message: string): string => {
    // Check for greetings in any stage
    if (/^(hi|hello|hey|greetings|howdy)(\s|$)/i.test(message)) {
      return `👋 Hey there! I'm Dolly, your AI assistant. ${getStageSpecificPrompt(stage)}`;
    }
    
    // Handle stage-specific responses
    switch (stage) {
      case 'intro':
        return "I'm Dolly! Would you like to go through onboarding or skip straight to testing worldAPI?";
        
      case 'choosePath':
        return "I'm setting up the environment for you. What would you like to do with worldAPI once we're ready?";
        
      case 'technical-requirements':
        return "You can ask me about sending money, checking rates, or exploring our network coverage across different countries.";
        
      case 'init':
        return "I'm ready to help with worldAPI! You can ask about sending money, checking exchange rates, or exploring our network coverage.";
        
      default:
        return "I'm here to help with worldAPI. What would you like to know about our payment services?";
    }
  };
  
  // Helper function to get stage-specific prompts
  const getStageSpecificPrompt = (stage: Stage): string => {
    switch (stage) {
      case 'intro':
        return "Would you like to go through onboarding or skip to testing worldAPI?";
      case 'choosePath':
        return "I'm preparing your environment. What would you like to explore first?";
      case 'technical-requirements':
      case 'init':
        return "You can ask about sending money, checking rates, or exploring our network coverage.";
      default:
        return "How can I assist you with worldAPI today?";
    }
  };

  return { handleIntent };
};
