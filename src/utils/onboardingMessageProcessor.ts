import { ConversationState } from "./types";
import { onboardingStages } from "../components/OnboardingStages";

export const processOnboardingMessage = async (
  message: string,
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean }> => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
  // Generic message processing based on conversation stage
  const currentStage = onboardingStages.find(s => s.id === state.currentStageId);
  if (!currentStage) {
    return { 
      newState, 
      aiResponse: "I'm sorry, something went wrong with tracking your progress. Let's start over.",
      isTyping: false
    };
  }
  
  // Store user's answer for the current question
  if (currentStage.questions && currentStage.questions[state.currentQuestionIndex]) {
    const question = currentStage.questions[state.currentQuestionIndex];
    const questionId = question.id;
    newState.answers[questionId] = message;
  }
  
  // Determine if we should move to next question or next stage
  if (state.currentQuestionIndex < (currentStage.questions?.length ?? 0) - 1) {
    // Move to next question in current stage
    newState.currentQuestionIndex++;
    const nextQuestion = currentStage.questions?.[newState.currentQuestionIndex];
    
    // If this question has a template response, use it, otherwise use the question text
    const response = nextQuestion?.responseTemplate ?? nextQuestion?.text;
    return { newState, aiResponse: response ?? '', isTyping: true };
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
      
      const introText = `Great! Let's move on to the ${nextStage.title ?? ''} phase. ${nextStage.description ?? ''}.`;
      const questionText = nextStage.questions?.[0]?.text;
      
      return { 
        newState, 
        aiResponse: `${introText}\n\n${questionText ?? ''}`,
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
