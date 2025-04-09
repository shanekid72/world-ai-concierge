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

// Fetch currency rates from the API
export const fetchCurrencyRate = async (currencyCode: string): Promise<number | null> => {
  try {
    const response = await fetch(
      "https://lieservices.luluone.com:9443/liveccyrates?payload=%7B%22activityType%22%3A%22rates.get%22%2C%22aglcid%22%3A784278%2C%22instype%22%3A%22LR%22%7D"
    );
    const data = await response.json();
    
    if (data && data.rate) {
      return parseFloat(data.rate);
    }
    return null;
  } catch (error) {
    console.error("Error fetching currency rate:", error);
    return null;
  }
};

// Check if message is asking about currency rates
export const isCurrencyRateQuery = (message: string): string | null => {
  const rateKeywords = ['rate', 'exchange', 'fx', 'currency', 'conversion'];
  const currencyCodes = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF'];
  
  const msgLower = message.toUpperCase();
  
  // Check if the message contains rate-related keywords
  const hasRateKeyword = rateKeywords.some(keyword => 
    msgLower.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasRateKeyword) {
    // Check if any currency code is mentioned
    for (const code of currencyCodes) {
      if (msgLower.includes(code)) {
        return code;
      }
    }
  }
  
  return null;
};

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

// Simulate API configuration response based on user details
export const generateAPIConfiguration = (state: ConversationState): string => {
  const organizationType = state.answers['welcome-1'] || 'financial institution';
  const regions = state.answers['business-2'] || 'global';
  const integrationPreference = state.answers['technical-1'] || 'REST API';
  
  return `Based on your requirements as a ${organizationType.toLowerCase()} operating in ${regions}, I recommend the following integration setup with ${integrationPreference}:\n\n1. Authentication: OAuth 2.0 with client credentials flow\n2. Primary endpoints:\n   - Account verification\n   - Payment initiation\n   - Transaction status\n   - FX rates\n\nWould you like to proceed with this configuration?`;
};
