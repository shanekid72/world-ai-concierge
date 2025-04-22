export interface UserState {
  name: string;
  company: string;
  contact: string;
  isCFO: boolean;
}

export interface ConversationOption {
  text: string;
  nextStageId: string;
}

export interface ConversationQuestion {
  text: string;
  voiceAfter?: string;
  voiceIfCFO?: string[];
}

export interface ConversationStage {
  id: string;
  voice?: string;
  chat?: string;
  options?: string[];
  onOptionSelect?: Record<string, string>;
  next?: string;
  subFlow?: string;
  questions?: ConversationQuestion[];
  kycChecklist?: string[];
  voiceAfterList?: string;
  animation?: {
    duration: string;
    visuals: string[];
    connectionFeed: string[];
    voiceMidAnimation?: string;
  };
  postAnimation?: {
    voice: string;
    chat: string;
    voiceDownload?: string;
  };
  cursorSetup?: {
    steps: string[];
    voice: string;
  };
  integrationPrompts?: string[];
  voiceAfterPrompts?: string;
}

export interface ConversationFlow {
  stages: ConversationStage[];
} 