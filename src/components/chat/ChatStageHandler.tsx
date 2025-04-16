
import React, { useRef, useState, useEffect } from 'react';
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
  
  useEffect(() => {
    console.log("ChatStageHandler: Current stage is", stage);
    
    if (processedStages.current.has(stage)) {
      return;
    }
    
    const handleStageMessage = () => {
      console.log("ChatStageHandler: Handling stage message for", stage);
      
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
          
        case 'technical-requirements':
          onMessage("Now that we're set up, what would you like to do with worldAPI? You can send money, check rates, or ask about our network coverage.");
          break;
      }
      
      processedStages.current.add(stage);
    };
    
    // Process all stages that need handling
    handleStageMessage();
  }, [stage, onMessage, onStageChange]);

  return showTerminal ? (
    <AnimatedTerminal 
      onComplete={() => {
        console.log("Terminal animation completed, moving to technical-requirements");
        setShowTerminal(false);
        onMessage("We're in. You're wired, logged, and jacked into worldAPI. Let's break something beautiful. 🕶️💥");
        onStageChange('technical-requirements');
      }} 
    />
  ) : null;
};
