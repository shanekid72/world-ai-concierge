
// Entry point for chat functionality - re-exports from modular files
import { OnboardingStage, Question, onboardingStages } from "../components/OnboardingStages";
import { Message, ConversationState } from "./types";
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

// Re-export everything needed by the chat interface
export {
  // Types
  Message,
  ConversationState,
  
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
