import { OnboardingStage, onboardingStages } from "../components/OnboardingStages";
import { ConversationState } from "./types";
import { fetchCurrencyRate, isCurrencyRateQuery } from "./currencyService";
import { getFollowUpResponse } from "./conversationUtils";

// Process user message and determine AI response
export const processUserMessage = async (
  message: string, 
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean }> => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
  // Check if this is a currency rate query
  const currencyCode = isCurrencyRateQuery(message);
  if (currencyCode) {
    try {
      const rate = await fetchCurrencyRate(currencyCode);
      if (rate !== null) {
        return { 
          newState, 
          aiResponse: `The current exchange rate for ${currencyCode} is ${rate.toFixed(4)}. Is there anything else you would like to know about our currency services?`,
          isTyping: true
        };
      } else {
        return { 
          newState, 
          aiResponse: `I'm sorry, I couldn't retrieve the current rate for ${currencyCode} at the moment. Please try again later or contact our support team for assistance.`,
          isTyping: true
        };
      }
    } catch (error) {
      return { 
        newState, 
        aiResponse: `I apologize, but there was an error fetching the rate information. Please try again later.`,
        isTyping: true
      };
    }
  }
  
  // Store user's answer
  const currentStage = onboardingStages.find(s => s.id === state.currentStageId);
  if (!currentStage) {
    return { 
      newState, 
      aiResponse: "I'm sorry, something went wrong with tracking your progress. Let's start over.",
      isTyping: true
    };
  }
  
  const currentQuestion = currentStage.questions[state.currentQuestionIndex];
  if (currentQuestion) {
    newState.answers[currentQuestion.id] = message;
  }
  
  // Determine if we should move to next question or next stage
  if (state.currentQuestionIndex < currentStage.questions.length - 1) {
    // Move to next question in current stage
    newState.currentQuestionIndex++;
    const nextQuestion = currentStage.questions[newState.currentQuestionIndex];
    
    // If this question has a template response, use it, otherwise use the question text
    const response = nextQuestion.responseTemplate || nextQuestion.text;
    return { newState, aiResponse: response, isTyping: true };
  } else {
    // Current stage completed, move to next stage
    newState.completedStages.push(currentStage.id);
    
    // Find index of current stage
    const currentStageIndex = onboardingStages.findIndex(s => s.id === currentStage.id);
    
    if (currentStageIndex < onboardingStages.length - 1) {
      // Move to first question of next stage
      const nextStage = onboardingStages[currentStageIndex + 1];
      newState.currentStageId = nextStage.id;
      newState.currentQuestionIndex = 0;
      
      const introText = `Great! Let's move on to the ${nextStage.title} phase. ${nextStage.description}.`;
      const questionText = nextStage.questions[0].text;
      
      return { 
        newState, 
        aiResponse: `${introText}\n\n${questionText}`,
        isTyping: true
      };
    } else {
      // All stages completed
      return { 
        newState, 
        aiResponse: "Congratulations! You've completed all the steps for your World API integration. Your account is now ready to use. Is there anything specific you'd like me to help with next?",
        isTyping: true
      };
    }
  }
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
  const result = await processUserMessage(userMessage, state);
  return result.aiResponse;
};
