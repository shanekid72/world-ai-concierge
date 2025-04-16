
import React, { useRef } from 'react';
import { type Stage } from '../../hooks/useWorldApiChat';

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
  const processedStages = useRef<Set<Stage>>(new Set());
  
  React.useEffect(() => {
    if (processedStages.current.has(stage)) {
      return;
    }
    
    const handleStageMessage = () => {
      switch (stage) {
        case 'intro':
          break;
          
        case 'choosePath':
          if (stage === 'choosePath') {
            const message = "Normally, you'd need to complete all the official onboarding rituals — KYC scrolls, compliance gateways, and all the sacred fintech scrolls 📜.\n\nBut hey — since you're here to test our legendary chat-based integration, we're unlocking the backdoor. Consider this a VIP pass to the core. Just don't forget — the real magic happens once full onboarding is complete. 😉";
            onMessage(message);
            onStageChange('technical-requirements');
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
      
      processedStages.current.add(stage);
    };
    
    if (['choosePath', 'standardOnboarding', 'collectMinimalInfo'].includes(stage)) {
      handleStageMessage();
    }
  }, [stage, onMessage, onStageChange]);

  return null;
});
