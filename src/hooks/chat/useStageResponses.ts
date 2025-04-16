
import { Stage } from '../useWorldApiChat';

export const getDefaultResponse = (stage: Stage, message: string): string => {
  // Handle common greetings across all stages with more personality
  if (/^(hi|hello|hey|greetings|howdy)(\s|$)/i.test(message)) {
    return `Heya! 🌟 Dolly here - super pumped you dropped by! ${getStageSpecificPrompt(stage)}`;
  }
  
  // Handle thank you messages
  if (/thank(\s|s|ing|you)/i.test(message)) {
    return "You're absolutely welcome! 💫 That's what I'm here for - making this whole worldAPI thing actually fun! Anything else you're curious about?";
  }
  
  // Handle questions about what Dolly can do
  if (/what.*(can|do).*you.*do/i.test(message)) {
    return "Oh honey, what CAN'T I do? 💅 I'm your all-access pass to worldAPI - sending money globally, checking rates, exploring our massive network... all with a bit more personality than your average chatbot. Just tell me what you need!";
  }

  // Handle stage-specific responses with sass and personality
  switch (stage) {
    case 'intro':
      return "👋 Hey there! I'm Dolly, and between us? I'm *ridiculously* excited to chat with you! Want the full VIP onboarding experience, or should we skip the formalities and dive straight into the worldAPI goodness? I'm flexible! 😎";
    
    case 'choosePath':
      return "Gotcha! Just getting everything prepped for you behind the scenes. While my digital gears are turning - what's got you interested in worldAPI? Building something cool? I love hearing about the creative stuff people do with our API! 🚀";
    
    case 'technical-requirements':
      return "Alright, you've got me at your service! 💃 I can hook you up with all sorts of worldAPI magic - zapping money across the globe 🌍, checking those exchange rates 💱, or showing off our network (100+ countries and counting, not that I'm bragging... okay, I'm totally bragging! 😉). What sounds good?";
    
    case 'init':
      return "I'm all yours! What worldAPI adventure are we going on today? Sending money somewhere exotic? Checking rates? Or just curious about where our network reaches? Hit me with it! 🌟";
    
    case 'amount':
      return "Let's get that money moving! 💸 How much are we playing with today? Small fortune? Life-changing amount? Just enough for lunch? I don't judge!";
    
    case 'country':
      return "Sweet! And where's this cash headed? Drop me a country code (like PK for Pakistan) and I'll work my magic! 🗺️ The world's your oyster... well, at least the 100+ countries in our network are!";
    
    case 'confirm':
      return "Last check before liftoff! 🚀 Everything look good to you? Just hit me with a 'yes' if we're golden, or 'no' if something needs tweaking!";
    
    case 'standardOnboarding':
      return "Time for the VIP treatment! 🎭 I need to grab some info from you - don't worry, I'll make this painless and maybe even fun! First things first - what should I call you? Besides 'tech genius' obviously!";
    
    case 'collectMinimalInfo':
      return "Let's keep this quick and snappy - I know you've got cool stuff to build! Just need a few tiny details to get you rolling. Nothing too invasive, pinky promise! 🤙";
    
    default:
      return "Hey there! What's the plan today? I'm here for all your worldAPI needs - with a side of sass and exceptional service! 💁‍♀️ Just tell me what you're thinking!";
  }
};

export const getStageSpecificPrompt = (stage: Stage): string => {
  switch (stage) {
    case 'intro':
      return "So what'll it be? Full guided tour or the express lane? Your call! 😎";
    
    case 'choosePath':
      return "While I'm setting things up, tell me what's got you excited about worldAPI! Building something revolutionary? 🚀";
    
    case 'technical-requirements':
    case 'init':
      return "So what can I help with today? Send money, check rates, or explore our global reach? The world is literally at your fingertips! 🌍";
    
    case 'amount':
      return "So what kind of numbers are we talking here? 💰";
    
    case 'country':
      return "Where are we sending this? Drop me a country code, and let's make some magic happen! 🗺️";
    
    case 'confirm':
      return "Ready to pull the trigger on this? Let's gooo! 🎯";
    
    default:
      return "What's next on the agenda? I'm all ears and ready to impress! 🌟";
  }
};

// Add some random fun facts about global payments to spice up conversations
export const getRandomFunFact = (): string => {
  const facts = [
    "Did you know? The first international money transfer was sent via telegraph in 1872! Now you can do it with just a few clicks. We've come a loooong way! 📱✨",
    "Fun fact: Roughly $155 trillion moves across borders annually. That's enough to buy everyone on Earth a small tropical island... if only they were for sale! 🏝️",
    "Random info drop: The fastest growing remittance corridors are in Asia and Africa. We're talking explosive growth - like 20%+ year over year in some places! 📈",
    "Nerdy payment fact: Before electronic transfers, international payments sometimes took MONTHS. Now we're annoyed if it takes more than a few minutes! 😂",
    "Did you know? The global payments industry is worth over $2 trillion! That's a lot of zeros... like, A LOT a lot. 💰",
  ];
  return facts[Math.floor(Math.random() * facts.length)];
};

// Handle follow-up responses with personality
export const getFollowUpResponse = (message: string): string | null => {
  if (message.toLowerCase().includes('help')) {
    return "Need a hand? That's literally why I exist! 💁‍♀️ I can help you send money globally, check exchange rates, or explore our network coverage. Just tell me what you're trying to do, and I'll make it happen!";
  }
  
  if (message.toLowerCase().includes('sorry')) {
    return "Oh please, no need to apologize! We're just chatting here. If anything breaks, it's probably on our end anyway! 😉 What else can I help with?";
  }
  
  if (message.toLowerCase().includes('slow') || message.toLowerCase().includes('wait')) {
    return "Taking a breath! I know I can talk a mile a minute sometimes. Let's slow it down - what exactly are you looking for today? 🐢";
  }
  
  return null;
};
