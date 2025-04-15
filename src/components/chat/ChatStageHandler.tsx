
import React from 'react';

interface ChatStageHandlerProps {
  stage: string;
  onStageChange: (stage: string) => void;
  onMessage: (message: string) => void;
}

export const ChatStageHandler: React.FC<ChatStageHandlerProps> = ({
  stage,
  onStageChange,
  onMessage
}) => {
  const handleStageMessage = (message: string) => {
    const lower = message.toLowerCase();

    switch (stage) {
      case 'choosePath':
        if (lower.includes('onboarding')) {
          onMessage("Awesome! Let's start your onboarding. First, what's your full name?");
          onStageChange('standardOnboarding');
        } else if (lower.includes('test') || lower.includes('integrate')) {
          onMessage("⚙️ Sweet! Let's get you into testing mode. Just need a few deets:");
          onMessage("1. Your name\n2. Company name\n3. Contact info (email/phone)\n— then we'll launch you straight into integration testing 🚀");
          onStageChange('collectMinimalInfo');
        } else {
          onMessage("Hmm, I didn't catch that — onboarding or testing?");
        }
        break;

      case 'standardOnboarding':
        onMessage("🎓 (Pretend we're doing KYC, compliance, and business requirements...) All done! ✅ Ready to integrate?");
        onStageChange('init');
        break;

      case 'collectMinimalInfo':
        onMessage("🙌 Got what I need! Let's jump into worldAPI testing mode.");
        onStageChange('init');
        break;
    }
  };

  return null; // This is a logic-only component
};
