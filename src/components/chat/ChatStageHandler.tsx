
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
  // Track which stages we've already handled to prevent duplicates
  const processedStages = useRef<Set<Stage>>(new Set());
  
  React.useEffect(() => {
    // Skip if we've already processed this stage
    if (processedStages.current.has(stage)) {
      return;
    }
    
    const handleStageMessage = () => {
      switch (stage) {
        case 'intro':
          // Skip the intro message as it's handled in AIAgent
          break;
          
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
      
      // Mark this stage as processed
      processedStages.current.add(stage);
    };
    
    if (['choosePath', 'standardOnboarding', 'collectMinimalInfo'].includes(stage)) {
      handleStageMessage();
    }
  }, [stage, onMessage, onStageChange]);

  return null; // This is a logic-only component
};
