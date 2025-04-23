import { create, StateCreator } from 'zustand';
import { FlowService, FlowStage } from '../services/flowService';

// Import voice service (optional - can also be called directly from components)
import { speakText } from '../services/voiceService';

// The conversation flow from your JSON
const conversationFlow = {
  "stages": [
    {
      "id": "intro",
      "voice": "👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.",
      "chat": "✨ Wanna go through onboarding or skip to testing our legendary worldAPI?",
      "options": ["Full Onboarding", "Fast-Track Testing"],
      "onOptionSelect": {
        "Full Onboarding": "partner-onboarding",
        "Fast-Track Testing": "collectMinimalInfo"
      }
    },
    {
      "id": "partner-onboarding",
      "voice": "Great! Let's get you set up as a partner. First, what's your organization's name?",
      "chat": "I'll guide you through the compliance and business requirements. First, could you tell me the name of your organization? 🏢",
      "questions": [
        {
          "text": "What is your organization's name?",
          "voiceAfter": "Thank you! Now, let's verify your identity.",
          "expectedAnswers": ["company", "organization", "business", "firm", "enterprise"]
        }
      ],
      "kycChecklist": [
        "Government-issued ID",
        "Proof of address",
        "Business registration documents",
        "Tax identification number"
      ],
      "next": "technical-requirements"
    },
    {
      "id": "collectMinimalInfo",
      "voice": "Okay, speedster! You picked the fast lane, and I'm so here for it. Just three tiny things and we're rolling. Blink and you might miss it!",
      "questions": [
        {
          "text": "What's your name?",
          "voiceAfter": "Nice to meet you, superstar. You and I? We're gonna do big things."
        },
        {
          "text": "What's your company's name?",
          "voiceAfter": "Oooh, that sounds official. I love a brand with presence!"
        },
        {
          "text": "What's the best email or phone number to reach you?",
          "voiceAfter": "Perfect. Now I know where to send the confetti once we're live."
        },
        {
          "text": "Are you a CFO?",
          "voiceIfCFO": [
            "Oh my god... I was literally born for this moment.",
            "I'm the AI every fintech's CFO dreams of — charming, smart, and allergic to repetitive dev tasks 💅.",
            "You will fall for me… like every other CFO does 💘"
          ]
        }
      ],
      "next": "technical-requirements"
    },
    {
      "id": "technical-requirements",
      "voice": "Now, let's talk about your technical needs. What kind of integration are you looking for?",
      "chat": "Let's discuss your technical requirements. What kind of integration are you planning to build?",
      "options": ["API Integration", "Webhook Setup", "SDK Implementation"],
      "next": "integration-details"
    }
  ]
};

export const ANIMATION_MAPPINGS = {
  IDLE: 'idle',
  SPEAKING: 'speaking',
  THINKING: 'thinking',
  HAPPY: 'happy',
  EXCITED: 'excited',
  EXPLAINING: 'explaining'
} as const;

type AnimationType = typeof ANIMATION_MAPPINGS[keyof typeof ANIMATION_MAPPINGS];

interface Message {
  text: string;
  isAI: boolean;
}

interface ConversationState {
  messages: Message[];
  currentStageId: string;
  currentAnimation: AnimationType;
  isSpeaking: boolean;
  userAnswers: Record<string, string>;
  addMessage: (text: string, isUser: boolean) => void;
  moveToStage: (stageId: string) => void;
  selectOption: (option: string) => void;
  setUserAnswer: (question: string, answer: string) => void;
  setAnimation: (animation: AnimationType) => void;
  setIsSpeaking: (speaking: boolean) => void;
}

const useConversationStore = create<ConversationState>((
  set: Parameters<StateCreator<ConversationState>>[0],
  get: () => ConversationState
) => ({
  messages: [],
  currentStageId: 'intro',
  currentAnimation: ANIMATION_MAPPINGS.IDLE,
  isSpeaking: false,
  userAnswers: {},

  addMessage: (text: string, isUser: boolean) => 
    set((state: ConversationState) => ({
      messages: [...state.messages, { text, isAI: !isUser }]
    })),

  moveToStage: (stageId: string) => {
    const flowService = FlowService.getInstance();
    const nextStage = flowService.getStageById(stageId);
    
    if (nextStage) {
      set({ currentStageId: stageId });
    }
  },

  selectOption: (option: string) => {
    const flowService = FlowService.getInstance();
    const currentStage = flowService.getStageById(get().currentStageId);
    
    if (currentStage?.onOptionSelect?.[option]) {
      const nextStageId = currentStage.onOptionSelect[option];
      get().moveToStage(nextStageId);
    }
  },

  setUserAnswer: (question: string, answer: string) =>
    set((state: ConversationState) => ({
    userAnswers: { ...state.userAnswers, [question]: answer }
  })),

  setAnimation: (animation: AnimationType) =>
    set({ currentAnimation: animation }),

  setIsSpeaking: (speaking: boolean) =>
    set({ isSpeaking: speaking })
}));

export default useConversationStore; 