import { ConversationState } from "./types";
import { getFollowUpResponse } from "./conversationUtils";
import { processCurrencyMessage } from "./currencyMessageProcessor";
import { processPartnerProfileMessage } from "./partnerProfileMessageProcessor";
import { processD9NetworkMessage } from "./d9NetworkMessageProcessor";
import { processOnboardingMessage } from "./onboardingMessageProcessor";

// Process user message and determine AI response
export const processUserMessage = async (
  message: string, 
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean }> => {
  // Try specialized processors first
  
  // Currency processor
  const currencyResponse = await processCurrencyMessage(message, state);
  if (currencyResponse) return currencyResponse;
  
  // Partner profile processor
  const partnerProfileResponse = await processPartnerProfileMessage(message, state);
  if (partnerProfileResponse) return partnerProfileResponse;
  
  // D9 Network processor
  const d9NetworkResponse = await processD9NetworkMessage(message, state);
  if (d9NetworkResponse) return d9NetworkResponse;
  
  // Fallback to the default onboarding flow processor
  const onboardingResponse = await processOnboardingMessage(message, state);
  
  // If even that fails, return a default response
  if (!onboardingResponse) {
    return {
      newState: state,
      aiResponse: "I'm here to help with worldAPI. What would you like to do next?",
      isTyping: false
    };
  }
  
  return onboardingResponse;
};

// Generate a smart AI response based on conversation context
export const generateSmartResponse = async (
  userMessage: string,
  state: ConversationState
): Promise<string> => {
  // Check for follow-up response based on keywords
  const followUp = getFollowUpResponse(userMessage);
  if (followUp) return followUp;
  
  // Otherwise process based on conversation state
  try {
    const result = await processUserMessage(userMessage, state);
    return result.aiResponse;
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm here to help with worldAPI. What would you like to do next?";
  }
};
