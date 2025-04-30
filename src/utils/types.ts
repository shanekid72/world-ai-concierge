
// Types shared across the chat functionality
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
