
import { Stage } from '../useWorldApiChat';

export const getDefaultResponse = (stage: Stage, message: string): string => {
  // Handle common greetings across all stages with more personality
  if (/^(hi|hello|hey|greetings|howdy)(\s|$)/i.test(message)) {
    return `Hey there! 🌟 Always lovely to chat with someone new! ${getStageSpecificPrompt(stage)}`;
  }

  // Handle stage-specific responses with more personality
  switch (stage) {
    case 'intro':
      return "👋 Hi there! I'm Dolly, and I've got to say - I'm pretty excited to chat with you! Want to dive into the full onboarding experience, or should we skip straight to the good stuff with worldAPI? I'm cool either way! 😊";
    
    case 'choosePath':
      return "Alright, awesome! I'm getting everything ready for you. While I'm at it, what's got you interested in worldAPI? I'd love to hear what you're planning to build! 🚀";
    
    case 'technical-requirements':
      return "You know what's cool? I can help you with all sorts of things - sending money around the globe 🌍, checking those exchange rates 💱, or even exploring our massive network (100+ countries, just saying! 😉). What sounds interesting to you?";
    
    case 'init':
      return "Hey! I'm all ears - what can I help you explore in worldAPI today? Whether it's sending money, checking rates, or just poking around our network coverage, I'm your girl! 🌟";
    
    case 'amount':
      return "Alright, let's get this money moving! 💸 What amount are you thinking of sending?";
    
    case 'country':
      return "Cool cool! And where are we sending this to? Just drop me the 2-letter country code (like PK for Pakistan) and I'll get right on it! 🗺️";
    
    case 'confirm':
      return "Almost there! Everything look good to you? Just hit me with a 'yes' if you're ready to roll, or 'no' if we need to tweak anything! 🎯";
    
    case 'standardOnboarding':
      return "Time for the fun part! 🎉 I'll need to grab some info from you - promise to make it as painless as possible! What should I call you?";
    
    case 'collectMinimalInfo':
      return "Let's keep this quick and snappy! Just need a few details to get you started - nothing too heavy, I promise! 😊";
    
    default:
      return "Hey there! What's on your mind? I'm here to help with anything worldAPI related - just shoot! 🎯";
  }
};

export const getStageSpecificPrompt = (stage: Stage): string => {
  switch (stage) {
    case 'intro':
      return "So... wanna explore everything step by step, or should we jump straight to the fun stuff? 😎";
    
    case 'choosePath':
      return "While I'm getting everything set up, what's got you excited about worldAPI? 🚀";
    
    case 'technical-requirements':
    case 'init':
      return "I've got all sorts of cool tricks up my sleeve - want to send some money, check rates, or explore where we can help you reach? 🌍";
    
    case 'amount':
      return "How much are we working with here? 💰";
    
    case 'country':
      return "And where's this headed? Drop me a country code! 🗺️";
    
    case 'confirm':
      return "Ready to make this happen? 🎯";
    
    default:
      return "What can I help you explore today? 🌟";
  }
};
