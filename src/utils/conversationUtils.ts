
import { OnboardingStage, onboardingStages } from "../components/OnboardingStages";
import { ConversationState, Message } from "./types";

// Generate a unique ID for messages
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize conversation with empty messages
export const initializeConversation = (): ConversationState => {
  const initialStage = onboardingStages[0];
  
  return {
    currentStageId: initialStage.id,
    currentQuestionIndex: 0,
    completedStages: [],
    answers: {},
    messages: []
  };
};

// Get a follow-up question or suggestion based on user's answer
export const getFollowUpResponse = (message: string): string | null => {
  // Simple keyword-based follow-ups
  if (message.toLowerCase().includes('bank')) {
    return "As a bank, you'll have access to our high-value payment networks. Would you be processing retail customer payments, corporate payments, or both?";
  } else if (message.toLowerCase().includes('wallet') || message.toLowerCase().includes('fintech')) {
    return "Digital wallets and fintechs often need faster integration. Would you prefer our pre-built components or a fully custom API integration?";
  } else if (message.toLowerCase().includes('test') || message.toLowerCase().includes('sandbox')) {
    return "I can help you set up a sandbox environment right away. Would you like me to generate test credentials now?";
  }
  
  // No specific follow-up detected
  return null;
};

// Simulate API configuration response based on user details
export const generateAPIConfiguration = (state: ConversationState): string => {
  const organizationType = state.answers['welcome-1'] || 'financial institution';
  const regions = state.answers['business-2'] || 'global';
  const integrationPreference = state.answers['technical-1'] || 'REST API';
  
  return `Based on your requirements as a ${organizationType.toLowerCase()} operating in ${regions}, I recommend the following integration setup with ${integrationPreference}:\n\n1. Authentication: OAuth 2.0 with client credentials flow\n2. Primary endpoints:\n   - Account verification\n   - Payment initiation\n   - Transaction status\n   - FX rates\n\nWould you like to proceed with this configuration?`;
};
