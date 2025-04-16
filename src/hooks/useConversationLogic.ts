
import { useCallback } from 'react';
import { Stage } from './useWorldApiChat';
import { fetchCurrencyRate } from '../utils/currencyRateService';

export const useConversationLogic = (
  stage: Stage,
  setStage: (stage: Stage) => void,
  appendAgentMessage: (message: string) => void,
  setShowBootup: (show: boolean) => void,
  setQuoteContext: (context: any) => void,
  handleIntent: (message: string) => Promise<void>,
  handleCreateQuote: (payload: any) => Promise<any>
) => {
  const processUserInput = useCallback(async (value: string) => {
    if (!value.trim()) return;
    
    console.log("Processing user input in stage:", stage);
    
    try {
      const lower = value.toLowerCase();
      
      if (stage === 'intro') {
        if (lower.includes("test") || lower.includes("skip") || lower.includes("worldapi") || lower.includes("legend")) {
          appendAgentMessage("Great! Let me set up the test environment for you. 🚀");
          setStage('choosePath');
          return;
        } else if (lower.includes("onboard") || lower.includes("start") || lower.includes("full") || lower.includes("experience")) {
          appendAgentMessage("Perfect! Let's walk through the onboarding process together. 📝");
          setStage('standardOnboarding');
          return;
        }
      }
      
      if (stage === 'choosePath') {
        const isTestIntent = ['test', 'test worldapi', 'i want to test', 'skip onboarding', 'proceed to integration', 'jump to technical', 'skip', 'legendary']
          .some(phrase => lower.includes(phrase));

        if (isTestIntent) {
          appendAgentMessage("Setting up the worldAPI test environment for you now. 🛠️");
          setTimeout(() => {
            appendAgentMessage("I just need a few quick details to get started:\n1. Your name\n2. Company name (or 'personal project')\n3. Contact information");
            setStage('collectMinimalInfo');
          }, 1000);
          return;
        }
      }

      if (stage === 'collectMinimalInfo' || stage === 'standardOnboarding') {
        appendAgentMessage(stage === 'collectMinimalInfo' 
          ? "Thanks for the information! Processing your details now... ⚙️"
          : "Thank you for that information! Just a few more questions about your business requirements... 📊"
        );
        setTimeout(() => {
          appendAgentMessage("Initializing your worldAPI assistant...");
          setShowBootup(true);
        }, stage === 'collectMinimalInfo' ? 1200 : 1500);
        return;
      }

      // For technical-requirements or any other stage, use the intent handler
      if (stage === 'technical-requirements' || stage !== 'intro') {
        await handleIntent(value);
        return;
      }

      // Default case - use the general intent handler
      await handleIntent(value);
    } catch (err) {
      console.error("Error handling intent:", err);
      appendAgentMessage("I'm sorry, I encountered an error processing your request. Could you try again? 😕");
    }
  }, [stage, setStage, appendAgentMessage, setShowBootup, handleIntent]);

  return { processUserInput };
};
