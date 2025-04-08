import { OnboardingStage, Question, onboardingStages } from "../components/OnboardingStages";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Tracking the conversation state
export interface ConversationState {
  currentStageId: string;
  currentQuestionIndex: number;
  completedStages: string[];
  answers: Record<string, string>;
  messages: Message[];
}

// Initialize conversation with welcome message
export const initializeConversation = (): ConversationState => {
  const initialStage = onboardingStages[0];
  const initialQuestion = initialStage.questions[0];
  
  return {
    currentStageId: initialStage.id,
    currentQuestionIndex: 0,
    completedStages: [],
    answers: {},
    messages: [
      {
        id: generateId(),
        content: initialQuestion.text,
        isUser: false,
        timestamp: new Date()
      }
    ]
  };
};

// Generate a unique ID for messages
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Process user message and determine AI response
export const processUserMessage = (
  message: string, 
  state: ConversationState
): { newState: ConversationState, aiResponse: string, isTyping: boolean } => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
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

// Generate a smart AI response based on conversation context
export const generateSmartResponse = (
  userMessage: string,
  state: ConversationState
): string => {
  // Check for follow-up response based on keywords
  const followUp = getFollowUpResponse(userMessage);
  if (followUp) return followUp;
  
  // Otherwise process based on conversation state
  const { aiResponse } = processUserMessage(userMessage, state);
  return aiResponse;
};

// Simulate API configuration response based on user details
export const generateAPIConfiguration = (state: ConversationState): string => {
  const organizationType = state.answers['welcome-1'] || 'financial institution';
  const regions = state.answers['business-2'] || 'global';
  const integrationPreference = state.answers['technical-1'] || 'REST API';
  
  return `Based on your requirements as a ${organizationType.toLowerCase()} operating in ${regions}, I recommend the following integration setup with ${integrationPreference}:\n\n1. Authentication: OAuth 2.0 with client credentials flow\n2. Primary endpoints:\n   - Account verification\n   - Payment initiation\n   - Transaction status\n   - FX rates\n\nWould you like to proceed with this configuration?`;
};
