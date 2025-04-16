
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
      console.log("Stage already processed:", stage);
      return;
    }
    
    const handleStageMessage = () => {
      console.log("ChatStageHandler: Handling stage message for", stage);
      
      switch (stage) {
        case 'intro':
          console.log("Processing intro stage");
          // Intro message is handled in AIAgent component
          break;
          
        case 'choosePath':
          console.log("Processing choosePath stage, showing terminal and message");
          // Clear previous messages first to avoid duplication
          setShowTerminal(false);
          setTimeout(() => {
            onMessage("Copy that. 🕶️ Spinning up a custom ops shell just for you...\n\nThis might look like magic — and honestly, it kinda is.");
            setShowTerminal(true);
          }, 100);
          break;
          
        case 'standardOnboarding':
          console.log("Processing standardOnboarding stage");
          onMessage("🎓 (Pretend we're doing KYC, compliance, and business requirements...) All done! ✅ Ready to integrate?");
          onStageChange('init');
          break;
          
        case 'collectMinimalInfo':
          console.log("Processing collectMinimalInfo stage");
          onMessage("🙌 Got what I need! Let's jump into worldAPI testing mode.");
          onStageChange('init');
          break;
          
        case 'technical-requirements':
          console.log("Processing technical-requirements stage");
          onMessage("Now that we're set up, what would you like to do with worldAPI? You can send money, check rates, or ask about our network coverage.");
          break;
          
        // Add default case to handle any unmatched stage
        default:
          console.log("No specific handler for stage:", stage);
          onMessage("I'm here to help with worldAPI. What would you like to do next?");
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
