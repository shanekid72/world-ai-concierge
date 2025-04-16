
import { useCallback } from 'react';
import { useWorldApiChat, type Stage } from './useWorldApiChat';
import { getDefaultResponse, getRandomFunFact, getFollowUpResponse } from './chat/useStageResponses';
import { appendMessageToChat } from './chat/useChatDomUtils';
import { handleQuoteCreation } from './chat/useQuoteHandling';

interface UseTransactionFlowReturn {
  handleIntent: (message: string) => Promise<void>;
}

export const useTransactionFlow = (
  setInputValue: (value: string) => void,
  appendAgentMessage: (message: string) => void
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
    
    // Check for follow-up response first
    const followUp = getFollowUpResponse(lower);
    if (followUp) {
      appendAgentMessage(followUp);
      return;
    }
    
    // Get default response based on stage
    let responseText = getDefaultResponse(stage, lower);
    let shouldChangeStage: Stage | null = null;
    
    // Occasionally add a fun fact (about 15% chance)
    const shouldAddFunFact = Math.random() < 0.15;
    
    if (stage === 'intro') {
      console.log("Processing input in intro stage");
      if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legendary") || lower.includes("good stuff")) {
        responseText = "Oh, you're the 'skip the tutorial' type! I respect that hustle! 🚀 Let me spin up the test environment for you real quick...";
        shouldChangeStage = 'choosePath';
      } else if (lower.includes("onboard") || lower.includes("start") || lower.includes("full") || lower.includes("experience")) {
        responseText = "Love that enthusiasm! Let's walk through this whole thing together - I promise to keep it entertaining! Maybe even throw in some dad jokes if you're lucky. 🎭";
        shouldChangeStage = 'standardOnboarding';
      }
    }
    else if (stage === 'choosePath') {
      // This stage is handled by AnimatedTerminal component
      responseText = "Working my magic behind the scenes... give me just a sec to get everything perfect for you! ✨";
    }
    else if (stage === 'technical-requirements') {
      if ((lower.includes("send") && lower.includes("money")) || lower.includes("transfer")) {
        responseText = "Time to move some cash around! 💸 How much are we working with here? Just drop me a number and we'll get this party started!";
        shouldChangeStage = 'amount';
        setQuoteContext({});
      } else if (lower.includes("rate") || lower.includes("exchange") || lower.includes("currency")) {
        responseText = "Exchange rates? I've got you covered! Which currencies are you curious about? I know all the juicy details! 💱";
      } else if (lower.includes("network") || lower.includes("coverage") || lower.includes("countries") || lower.includes("where")) {
        responseText = "Oh honey, we're EVERYWHERE! 100+ countries across Africa, Americas, Asia, Europe, and GCC! 🌍 I'd list them all but we'd be here all day. Any specific region you're curious about?";
      } else if (lower.includes("help") || lower.includes("what") || lower.includes("can you do")) {
        responseText = "I'm basically your worldAPI fairy godmother! 🧚‍♀️ I can help you send money globally, check current exchange rates, or explore our massive network coverage. What sounds good?";
      }
    }
    else if (stage === 'amount' && lower.match(/\d+/)) {
      const amount = parseFloat(lower.match(/\d+/)![0]);
      setQuoteContext(prev => ({ ...prev, amount }));
      responseText = "Got it! $" + amount + " ready to travel! 🧳 Now, where are we sending this to? Drop me a country code (like PK for Pakistan) and I'll work my magic!";
      shouldChangeStage = 'country';
    }
    else if (stage === 'country' && /^[A-Z]{2}$/i.test(lower) && quoteContext.amount) {
      const result = await handleQuoteCreation(
        lower.toUpperCase(),
        quoteContext.amount,
        handleCreateQuote,
        setQuoteContext
      );
      responseText = result.responseText;
      shouldChangeStage = result.nextStage;
    }
    else if (stage === 'confirm') {
      if (lower === 'yes' && quoteContext.quoteId) {
        responseText = "Woohoo! Money's on the move! 🚀 Processing your transaction now... I'll keep you posted on its journey!";
        shouldChangeStage = 'init';
      } else if (lower === 'no') {
        responseText = "No problemo! Transaction cancelled faster than you can say 'worldAPI'! Let me know if you want to try again with different details. 🛑";
        shouldChangeStage = 'init';
      }
    }
    else if (stage === 'standardOnboarding' || stage === 'collectMinimalInfo') {
      // These stages are handled directly by ChatStageHandler
      responseText = "Processing that info now... bear with me while I work some digital magic! ✨";
    }
    else if (stage === 'init') {
      // Handle any input in init stage
      if (lower.includes("send") && (lower.includes("money") || lower.includes("cash"))) {
        responseText = "Let's get that money moving! 💸 How much are we sending today?";
        shouldChangeStage = 'amount';
      } else if (lower.includes("help") || lower.includes("what") || lower.includes("can you")) {
        responseText = "I'm your worldAPI genie! 🧞‍♀️ I can help you send money across our global network, check current exchange rates, or show you all the amazing places we can reach. What's your wish?";
      } else if (lower.includes("rate") || lower.includes("exchange")) {
        responseText = "Exchange rates, coming right up! 📊 Which currencies are you interested in today?";
      } else if (lower.includes("thank")) {
        responseText = "You're so welcome! It's literally my job to make your worldAPI experience awesome - and between us, it's pretty fun too! 😊 Anything else I can help with?";
      } else {
        // Add some variety to default responses
        const defaultResponses = [
          "I'm here for all your worldAPI needs! Want to send money, check rates, or explore our global network? Just say the word! 🌎",
          "Hmm, not quite sure what you're looking for, but I'm eager to help! Need to send money, check exchange rates, or learn more about our coverage? 🤔",
          "Let's focus on what worldAPI does best - sending money globally, providing great exchange rates, and connecting you to 100+ countries! What can I help with? 💫"
        ];
        responseText = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      }
    }
    
    // Occasionally add a fun fact if we're not changing stages
    if (shouldAddFunFact && !shouldChangeStage) {
      responseText += "\n\n" + getRandomFunFact();
    }
    
    console.log("Sending response:", responseText);
    appendAgentMessage(responseText);
    
    if (shouldChangeStage) {
      console.log(`Changing stage from ${stage} to ${shouldChangeStage}`);
      setStage(shouldChangeStage);
    }
  }, [stage, quoteContext, setQuoteContext, setStage, handleCreateQuote, appendAgentMessage]);

  return { handleIntent };
};
