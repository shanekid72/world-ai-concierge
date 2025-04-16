
import React, { useRef, useState } from 'react';
import { type Stage } from '../../hooks/useWorldApiChat';
import AnimatedTerminal from './AnimatedTerminal';

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
  const [showTerminal, setShowTerminal] = useState(false);
  
  React.useEffect(() => {
    if (processedStages.current.has(stage)) {
      return;
    }
    
    const handleStageMessage = () => {
      switch (stage) {
        case 'intro':
          break;
          
        case 'choosePath':
          onMessage("Copy that. 🕶️ Spinning up a custom ops shell just for you...\n\nThis might look like magic — and honestly, it kinda is.");
          setShowTerminal(true);
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

  return showTerminal ? (
    <AnimatedTerminal 
      onComplete={() => {
        setShowTerminal(false);
        onMessage("We're in. You're wired, logged, and jacked into worldAPI. Let's break something beautiful. 🕶️💥");
        onStageChange('technical-requirements');
      }} 
    />
  ) : null;
};
