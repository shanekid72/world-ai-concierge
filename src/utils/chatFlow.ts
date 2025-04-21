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
    chat: "✨ Wanna go through onboarding or skip to testing our legendary worldAPI?",
    options: ["Full Onboarding", "Fast-Track Testing"]
  },
  {
    id: "path-selection",
    onOptionSelect: {
      "Full Onboarding": "partner-onboarding",
      "Fast-Track Testing": "collectMinimalInfo"
    }
  },
  {
    id: "partner-onboarding",
    chat: "I'll guide you through the compliance and business requirements. First, could you tell me the name of your organization? 🏢",
    subFlow: "partnerOnboardingScript"
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
    id: "compliance-kyc",
    voice: "Ughhh... compliance. Not my favorite chapter in this love story — but hey, rules are rules and regulators never sleep. 😔 Don't worry, I'll make this as painless as possible. Here's the shopping list!",
    chat: "Let's get your compliance docs sorted. Below is our standard AML/KYC checklist. You can either upload the docs right here or email them to us at 👉 partnerships@digitnine.com",
    kycChecklist: [
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
    voiceAfterList: "Whew. That's quite the list, I know — but once it's done, it's DONE. Upload them or shoot them to partnerships@digitnine.com. I'll be sipping tea and checking boxes. ☕"
  },
  {
    id: "technical-requirements",
    animation: {
      duration: "45s",
      visuals: ["moving gradients", "glitch blur", "typewriter text", "neon sparks"],
      connectionFeed: [
        "🔌 Connecting to MTOs... ✅",
        "Western Union ✅",
        "TerraPay ✅",
        "Ria ✅",
        "Transfast ✅",
        "🌐 Syncing with Banks... ✅",
        "📱 Linking 247 digital wallets... ✅"
      ],
      voiceMidAnimation: "Bro, I think you're the Spiderman of APIs 🕷️ — there's too much going on in your web!"
    },
    postAnimation: {
      voice: "Boom! You're through the boring part and officially in the big leagues. You're now ready to explore WorldAPI — and yes, that means it's time to connect your development IDE and bring those endpoints to life.",
      chat: "📁 Download your WorldAPI config file: \n➡️ [Download mcp.json]",
      voiceDownload: "Save that file — it's basically the passport to my API playground."
    },
    cursorSetup: {
      steps: [
        "Go to your project root",
        "Create a folder named .cursor",
        "Paste the downloaded mcp.json inside",
        "Open IDE → Settings → MCP tab",
        "WorldAPI tools will now be available"
      ],
      voice: "Dot-cursor folder. MCP tab. And boom — tools unlocked like cheat codes. 🎮"
    },
    integrationPrompts: [
      "Integrate WorldAPI endpoints into \"my project name\" using the WorldAPI tool. Maintain the project structure and format.",
      "Wire the newly integrated WorldAPI to my front-end project \"my project name\" inside a new page and add it to the menu."
    ],
    voiceAfterPrompts: "Whisper these to your IDE and let it do its thing. Like summoning spells — but for code. 🧙‍♂️"
  }
]; 