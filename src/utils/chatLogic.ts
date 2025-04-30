
// Entry point for chat functionality - re-exports from modular files
import { OnboardingStage, Question, onboardingStages } from "../components/OnboardingStages";
import { 
  generateId, 
  initializeConversation, 
  getFollowUpResponse, 
  generateAPIConfiguration 
} from "./conversationUtils";
import { 
  fetchCurrencyRate, 
  isCurrencyRateQuery 
} from "./currencyService";
import { 
  processUserMessage, 
  generateSmartResponse 
} from "./messageProcessor";

// Re-export types with the 'export type' syntax
export type { Message, ConversationState } from "./types";
  
// Re-export everything needed by the chat interface
export {
  // Core functionality
  generateId,
  initializeConversation,
  processUserMessage,
  generateSmartResponse,
  
  // Currency features
  fetchCurrencyRate,
  isCurrencyRateQuery,
  
  // Conversation helpers
  getFollowUpResponse,
  generateAPIConfiguration
};
