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
      "options": ["Full Onboarding", "Fast-Track Testing"]
    },
    {
      "id": "path-selection",
      "onOptionSelect": {
        "Full Onboarding": "partner-onboarding",
        "Fast-Track Testing": "collectMinimalInfo"
      }
    },
    {
      "id": "partner-onboarding",
      "chat": "I'll guide you through the compliance and business requirements. First, could you tell me the name of your organization? 🏢",
      "subFlow": "partnerOnboardingScript"
    },
    {
      "id": "collectMinimalInfo",
      "voice": "Okay, speedster! You picked the fast lane, and I'm so here for it. Just three tiny things and we're rolling. Blink and you might miss it!",
      "questions": [
        {"text": "What's your name?", "voiceAfter": "Nice to meet you, superstar. You and I? We're gonna do big things."},
        {"text": "What's your company's name?", "voiceAfter": "Oooh, that sounds official. I love a brand with presence!"},
        {"text": "What's the best email or phone number to reach you?", "voiceAfter": "Perfect. Now I know where to send the confetti once we're live."},
        {"text": "Are you a CFO?", "voiceIfCFO": [
          "Oh my god... I was literally born for this moment.",
          "I'm the AI every fintech's CFO dreams of — charming, smart, and allergic to repetitive dev tasks 💅.",
          "You will fall for me… like every other CFO does 💘"
        ]}
      ],
      "next": "technical-requirements"
    },
    {
      "id": "compliance-kyc",
      "voice": "Ughhh... compliance. Not my favorite chapter in this love story — but hey, rules are rules and regulators never sleep. 😔 Don't worry, I'll make this as painless as possible. Here's the shopping list!",
      "chat": "Let's get your compliance docs sorted. Below is our standard AML/KYC checklist. You can either upload the docs right here or email them to us at 👉 partnerships@digitnine.com",
      "kycChecklist": [
        "AML Questionnaire",
        "Certificate of Incorporation / Registration",
        "Memorandum / Articles of Association",
        "Central Bank License or Regulator's Authorization Letter",
        "Organization Chart",
        "Shareholder List",
        "ID copies of UBOs",
        "ID copies of Directors",
        "ID copies of Authorized Signatories",
        "External Audit or Assurance Report",
        "AML Policy & Procedures",
        "USA PATRIOT Act Certificate (if applicable)",
        "Audited Financial Statements - 3 years",
        "ID of Compliance Officer / MLRO"
      ],
      "voiceAfterList": "Whew. That's quite the list, I know — but once it's done, it's DONE. Upload them or shoot them to partnerships@digitnine.com. I'll be sipping tea and checking boxes. ☕"
    },
    {
      "id": "technical-requirements",
      "animation": {
        "duration": "45s",
        "visuals": ["moving gradients", "glitch blur", "typewriter text", "neon sparks"],
        "connectionFeed": [
          "🔌 Connecting to MTOs... ✅",
          "Western Union ✅",
          "TerraPay ✅",
          "Ria ✅",
          "Transfast ✅",
          "🌐 Syncing with Banks... ✅",
          "📲 Linking 247 digital wallets... ✅"
        ],
        "voiceMidAnimation": "Bro, I think you're the Spiderman of APIs 🕷️ — there's too much going on in your web!"
      },
      "postAnimation": {
        "voice": "Boom! You're through the boring part and officially in the big leagues. You're now ready to explore WorldAPI — and yes, that means it's time to connect your development IDE and bring those endpoints to life.",
        "chat": "📁 Download your WorldAPI config file: \n➡️ [Download mcp.json]",
        "voiceDownload": "Save that file — it's basically the passport to my API playground."
      },
      "cursorSetup": {
        "steps": [
          "Go to your project root",
          "Create a folder named .cursor",
          "Paste the downloaded mcp.json inside",
          "Open IDE → Settings → MCP tab",
          "WorldAPI tools will now be available"
        ],
        "voice": "Dot-cursor folder. MCP tab. And boom — tools unlocked like cheat codes. 🎮"
      },
      "integrationPrompts": [
        "Integrate WorldAPI endpoints into \"my project name\" using the WorldAPI tool. Maintain the project structure and format.",
        "Wire the newly integrated WorldAPI to my front-end project \"my project name\" inside a new page and add it to the menu."
      ],
      "voiceAfterPrompts": "Whisper these to your IDE and let it do its thing. Like summoning spells — but for code. 🧙‍♂️"
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
  currentStageId: string;
  currentStage: ConversationStage | null;
  previousStageId: string | null;
  userState: UserState;
  isAnimating: boolean;
  isSpeaking: boolean;
  currentAnimation: string;
  currentMessageIndex: number;
  answers: Record<string, string>;
  messages: { text: string; isAI: boolean }[];
  
  // Actions
  moveToStage: (stageId: string) => void;
  selectOption: (option: string) => void;
  setUserAnswer: (questionKey: string, answer: string) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setAnimation: (animationName: string) => void;
  addMessage: (message: string, isAI: boolean) => void;
  findStageById: (stageId: string) => ConversationStage | null;
}

// Define the Zustand store with proper types
const useConversationStore = create<ConversationState>((set: any, get: any) => ({
  currentStageId: "intro",
  currentStage: conversationFlow.stages.find(stage => stage.id === "intro") || null,
  previousStageId: null,
  userState: {
    name: "",
    company: "",
    contact: "",
    isCFO: false,
  },
  isAnimating: false,
  isSpeaking: false,
  currentAnimation: ANIMATION_MAPPINGS.IDLE,
  currentMessageIndex: 0,
  answers: {},
  messages: [],
  
  // Find a stage by ID
  findStageById: (stageId: string) => {
    return conversationFlow.stages.find(stage => stage.id === stageId) || null;
  },
  
  // Move to a specific stage
  moveToStage: (stageId: string) => {
    const nextStage = get().findStageById(stageId);
    if (!nextStage) return;
    
    set({
      previousStageId: get().currentStageId,
      currentStageId: stageId,
      currentStage: nextStage,
      currentAnimation: ANIMATION_MAPPINGS[stageId] || ANIMATION_MAPPINGS.IDLE,
    });
    
    // Add AI message from the new stage if it has chat content
    if (nextStage.chat) {
      get().addMessage(nextStage.chat, true);
    }
    
    // Voice content will be handled by the ChatInterface component
    // This allows for proper UI synchronization
  },
  
  // Handle option selection
  selectOption: (option: string) => {
    const { currentStage } = get();
    
    // Add user's selected option as a message
    get().addMessage(option, false);
    
    // Check if the current stage has onOptionSelect
    if (currentStage?.onOptionSelect) {
      const nextStageId = currentStage.onOptionSelect[option];
      if (nextStageId) {
        get().moveToStage(nextStageId);
        return;
      }
    }
    
    // Special handling for intro stage
    if (currentStage?.id === "intro") {
      // Find path-selection stage
      const pathSelectionStage = conversationFlow.stages.find(stage => stage.id === "path-selection");
      if (pathSelectionStage?.onOptionSelect) {
        const nextStageId = pathSelectionStage.onOptionSelect[option];
        if (nextStageId) {
          // First move to path-selection, then to the target stage
          get().moveToStage("path-selection");
          setTimeout(() => {
            get().moveToStage(nextStageId);
          }, 500);
          return;
        }
      }
      
      // Direct mapping for intro options
      if (option === "Full Onboarding") {
        get().moveToStage("partner-onboarding");
        return;
      }
      if (option === "Fast-Track Testing") {
        get().moveToStage("collectMinimalInfo");
        return;
      }
    }
  },
  
  // Save user answer
  setUserAnswer: (questionKey: string, answer: string) => {
    const { answers } = get();
    set({ 
      answers: { ...answers, [questionKey]: answer }
    });
    
    // Add user's answer as a message
    get().addMessage(answer, false);
    
    // Special handling for CFO question
    if (questionKey === "Are you a CFO?" && answer.toLowerCase() === "yes") {
      set((state: { userState: UserState }) => ({
        userState: { ...state.userState, isCFO: true }
      }));
    }
  },
  
  // Set speaking state and update animation
  setIsSpeaking: (isSpeaking: boolean) => {
    set({ 
      isSpeaking,
      currentAnimation: isSpeaking ? ANIMATION_MAPPINGS.SPEAKING : ANIMATION_MAPPINGS.IDLE
    });
  },
  
  // Set a specific animation
  setAnimation: (animationName: string) => {
    set({ currentAnimation: animationName });
  },
  
  // Add a new message to the conversation
  addMessage: (message: string, isAI: boolean) => {
    set((state: { messages: Array<{ text: string; isAI: boolean }>; }) => ({
      messages: [...state.messages, { text: message, isAI }],
      currentMessageIndex: state.messages.length,
    }));
  },
}));

export default useConversationStore; 