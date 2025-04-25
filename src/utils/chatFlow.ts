export interface ChatFlowStage {
  id: string;
  voice?: string;
  chat?: string;
  options?: string[];
  onOptionSelect?: Record<string, string>;
  subFlow?: string;
  questions?: Array<{
    text: string;
    voiceAfter?: string;
    voiceIfCFO?: string[];
    expectedAnswers?: string[];
  }>;
  next?: string;
  kycChecklist?: string[];
  voiceAfterList?: string;
  animation?: {
    duration: string;
    visuals: string[];
    connectionFeed: string[];
    voiceMidAnimation: string;
  };
  postAnimation?: {
    voice: string;
    chat: string;
    voiceDownload: string;
  };
  cursorSetup?: {
    steps: string[];
    voice: string;
  };
  integrationPrompts?: string[];
  voiceAfterPrompts?: string;
}

export const chatFlow: ChatFlowStage[] = [
  {
    id: "intro",
    voice: "👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.",
    chat: "✨ Wanna go through onboarding (Legacy Mode) or skip to testing our legendary worldAPI (Boss Mode)?",
    options: ["Legacy Mode", "Boss Mode"],
    onOptionSelect: {
      "Legacy Mode": "partner-onboarding",
      "Boss Mode": "collectMinimalInfo"
    }
  },
  {
    id: "partner-onboarding",
    voice: "Great! Let's get you set up as a partner. First, what's your organization's name?",
    chat: "I'll guide you through the compliance and business requirements. First, could you tell me the name of your organization? 🏢",
    questions: [
      {
        text: "What is your organization's name?",
        voiceAfter: "Thank you! Now, let's verify your identity.",
        expectedAnswers: ["company", "organization", "business", "firm", "enterprise"]
      }
    ],
    kycChecklist: [
      "Government-issued ID",
      "Proof of address",
      "Business registration documents",
      "Tax identification number"
    ],
    next: "technical-requirements"
  },
  {
    id: "collectMinimalInfo",
    voice: "Okay, speedster! You picked the fast lane, and I'm so here for it. Just three tiny things and we're rolling. Blink and you might miss it!",
    questions: [
      {
        text: "What's your name?",
        voiceAfter: "Nice to meet you, superstar. You and I? We're gonna do big things."
      },
      {
        text: "What's your company's name?",
        voiceAfter: "Oooh, that sounds official. I love a brand with presence!"
      },
      {
        text: "What's the best email or phone number to reach you?",
        voiceAfter: "Perfect. Now I know where to send the confetti once we're live."
      },
      {
        text: "Are you a CFO?",
        voiceIfCFO: [
          "Oh my god... I was literally born for this moment.",
          "I'm the AI every fintech's CFO dreams of — charming, smart, and allergic to repetitive dev tasks 💅.",
          "You will fall for me… like every other CFO does 💘"
        ]
      }
    ],
    next: "technical-requirements"
  },
  {
    id: "technical-requirements",
    voice: "Now, let's talk about your technical needs. What kind of integration are you looking for?",
    chat: "Let's discuss your technical requirements. What kind of integration are you planning to build?",
    options: ["API Integration", "Webhook Setup", "SDK Implementation"],
    next: "integration-details"
  }
]; 