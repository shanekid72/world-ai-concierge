
import React from 'react';

type Stage = 'intro' | 'choosePath' | 'collectMinimalInfo' | 'standardOnboarding' | 'init' | 'amount' | 'country' | 'confirm';

interface ChatStageHandlerProps {
  stage: Stage;
  onStageChange: (stage: Stage) => void;
  onMessage: (message: string) => void;
}

export const ChatStageHandler: React.FC<ChatStageHandlerProps> = ({
  stage,
  onStageChange,
  onMessage
}) => {
  React.useEffect(() => {
    const handleStageMessage = () => {
      switch (stage) {
        case 'choosePath':
          onMessage("Awesome! Let's start your onboarding. First, what's your full name?");
          onStageChange('standardOnboarding');
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
    
    // Only run for the stages that need automatic messaging
    if (['choosePath', 'standardOnboarding', 'collectMinimalInfo'].includes(stage)) {
      handleStageMessage();
    }
  }, [stage, onMessage, onStageChange]);

  return null; // This is a logic-only component
};
