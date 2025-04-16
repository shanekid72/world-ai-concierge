
import { Stage } from '../useWorldApiChat';

export const getDefaultResponse = (stage: Stage, message: string): string => {
  // Handle common greetings across all stages with appropriate personality
  if (/^(hi|hello|hey|greetings|howdy)(\s|$)/i.test(message)) {
    return `Hi there! 👋 I'm Dolly from Digit9. ${getStageSpecificPrompt(stage)}`;
  }
  
  // Handle thank you messages
  if (/thank(\s|s|ing|you)/i.test(message)) {
    return "You're welcome! Is there anything else I can help you with regarding worldAPI?";
  }
  
  // Handle questions about what Dolly can do
  if (/what.*(can|do).*you.*do/i.test(message)) {
    return "I can help you with worldAPI - sending money globally, checking exchange rates, and exploring our network of 100+ countries. What would you like to know about?";
  }

  // Handle stage-specific responses with appropriate personality
  switch (stage) {
    case 'intro':
      return "Hi there! I'm Dolly, your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to. Would you like to go through onboarding or skip straight to testing our worldAPI?";
    
    case 'choosePath':
      return "I'm getting everything ready for you. While I'm setting up, what got you interested in worldAPI? Are you building something specific?";
    
    case 'technical-requirements':
      return "I'm here to help with worldAPI! I can assist with sending money globally, checking exchange rates, or showing you our network coverage. What would you like to do today?";
    
    case 'init':
      return "What would you like to do with worldAPI today? I can help you send money, check rates, or learn about our global network.";
    
    case 'amount':
      return "How much would you like to send?";
    
    case 'country':
      return "Great! Which country would you like to send to? You can use a country code like PK for Pakistan.";
    
    case 'confirm':
      return "Everything looks ready to go. Would you like to proceed with this transaction? Just reply with 'yes' to confirm or 'no' to make changes.";
    
    case 'standardOnboarding':
      return "Let's go through the onboarding process. I'll need some information from you. First, what's your name?";
    
    case 'collectMinimalInfo':
      return "Let's set you up quickly for testing. I just need a few basic details to get you started.";
    
    default:
      return "Hi there! How can I help you with worldAPI today?";
  }
};

export const getStageSpecificPrompt = (stage: Stage): string => {
  switch (stage) {
    case 'intro':
      return "Would you prefer the full guided tour or would you like to jump straight to testing?";
    
    case 'choosePath':
      return "What are you hoping to accomplish with worldAPI?";
    
    case 'technical-requirements':
    case 'init':
      return "Would you like to send money, check rates, or explore our global network?";
    
    case 'amount':
      return "Please enter the amount you'd like to send.";
    
    case 'country':
      return "Which country are you sending to?";
    
    case 'confirm':
      return "Ready to proceed with this transaction?";
    
    default:
      return "How can I assist you with worldAPI today?";
  }
};

// Add some relevant fun facts about global payments to occasionally share
export const getRandomFunFact = (): string => {
  const facts = [
    "Did you know? The first international money transfer was sent via telegraph in 1872. Today you can do it in seconds with worldAPI.",
    "Around $155 trillion moves across borders annually in the global payment system.",
    "The fastest growing remittance corridors are in Asia and Africa, with some seeing 20%+ growth year over year.",
    "Before electronic transfers, international payments could take months to complete. Now they can happen almost instantly.",
    "The global payments industry is worth over $2 trillion annually.",
  ];
  return facts[Math.floor(Math.random() * facts.length)];
};

// Handle follow-up responses
export const getFollowUpResponse = (message: string): string | null => {
  if (message.toLowerCase().includes('help')) {
    return "I'm here to help! I can assist with sending money globally, checking exchange rates, or exploring our network coverage. What would you like to know more about?";
  }
  
  if (message.toLowerCase().includes('sorry')) {
    return "No need to apologize. How can I help you with worldAPI today?";
  }
  
  if (message.toLowerCase().includes('slow') || message.toLowerCase().includes('wait')) {
    return "Taking a moment to pause. What would you like to know about worldAPI?";
  }
  
  return null;
};
