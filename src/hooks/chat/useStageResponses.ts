
import { Stage } from '../useWorldApiChat';

export const getDefaultResponse = (stage: Stage, message: string): string => {
  // Handle common greetings across all stages
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
    case 'amount':
      return "Please provide a number for the amount you'd like to send.";
    case 'country':
      return "Please provide a 2-letter country code for the destination (e.g., PK for Pakistan).";
    case 'confirm':
      return "Would you like to proceed with this transaction? Please reply with 'yes' or 'no'.";
    default:
      return "I'm here to help with worldAPI. What would you like to know about our payment services?";
  }
};

export const getStageSpecificPrompt = (stage: Stage): string => {
  switch (stage) {
    case 'intro':
      return "Would you like to go through onboarding or skip to testing worldAPI?";
    case 'choosePath':
      return "I'm preparing your environment. What would you like to explore first?";
    case 'technical-requirements':
    case 'init':
      return "You can ask about sending money, checking rates, or exploring our network coverage.";
    case 'amount':
      return "How much would you like to send?";
    case 'country':
      return "What is the destination country?";
    case 'confirm':
      return "Would you like to proceed with this transaction?";
    default:
      return "How can I assist you with worldAPI today?";
  }
};
