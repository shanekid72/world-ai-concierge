import { create } from 'zustand';
import { ConversationFlow, ConversationStage, UserState } from '../types/global';

// Import voice service (optional - can also be called directly from components)
import { speakText } from '../services/voiceService';

// The conversation flow from your JSON
const conversationFlow: ConversationFlow = {
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

// Animation mappings for different conversation states
export const ANIMATION_MAPPINGS: Record<string, string> = {
  // General mood states
  SPEAKING: "Talking On Phone",
  HAPPY: "Hip Hop Dancing",
  THINKING: "Golf Pre-Putt",
  IDLE: "dolly-avatar",
  EXCITED: "Jog In Circle",
  EXPLAINING: "Punching",
  SHOCKED: "Zombie Stand Up",
  GREETING: "Body Block",
  WAITING: "Freehang Climb",
  
  // Stage specific states
  "intro": "Talking On Phone",
  "collectMinimalInfo": "Hip Hop Dancing",
  "compliance-kyc": "Golf Pre-Putt",
  "technical-requirements": "Punching",
};

interface ConversationState {
  currentStage: string;
  currentAnimation: string;
  isSpeaking: boolean;
  messages: { text: string; isAI: boolean }[];
  userAnswers: Record<string, string>;
  moveToStage: (stageId: string) => void;
  selectOption: (option: string) => void;
  setUserAnswer: (question: string, answer: string) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setAnimation: (animation: string) => void;
  addMessage: (text: string, isAI: boolean) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  currentStage: "intro",
  currentAnimation: "idle",
  isSpeaking: false,
  messages: [],
  userAnswers: {},
  moveToStage: (stageId) => set({ currentStage: stageId }),
  selectOption: (option) => {
    const stage = conversationFlow.stages.find(s => s.id === "intro");
    if (stage?.onOptionSelect?.[option]) {
      set({ currentStage: stage.onOptionSelect[option] });
    }
  },
  setUserAnswer: (question, answer) => set((state) => ({
    userAnswers: { ...state.userAnswers, [question]: answer }
  })),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setAnimation: (animation) => set({ currentAnimation: animation }),
  addMessage: (text, isAI) => set((state) => ({
    messages: [...state.messages, { text, isAI }]
  }))
}));

export default useConversationStore; 