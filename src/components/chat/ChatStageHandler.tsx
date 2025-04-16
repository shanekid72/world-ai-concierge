
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
          processedStages.current.add(stage);
          break;
          
        case 'choosePath':
          console.log("Processing choosePath stage, showing terminal and message");
          // Clear previous messages first to avoid duplication
          setShowTerminal(false);
          setTimeout(() => {
            onMessage("Setting up the API testing environment for you. This will just take a moment.");
            setShowTerminal(true);
            processedStages.current.add(stage);
          }, 100);
          break;
          
        case 'standardOnboarding':
          console.log("Processing standardOnboarding stage");
          onMessage("I've completed the compliance and business requirements for you. You're now ready to start using worldAPI. What would you like to do first?");
          onStageChange('init');
          processedStages.current.add(stage);
          break;
          
        case 'collectMinimalInfo':
          console.log("Processing collectMinimalInfo stage");
          onMessage("Thanks for providing your information. Your account is now set up for testing worldAPI.");
          onStageChange('init');
          processedStages.current.add(stage);
          break;
          
        case 'technical-requirements':
          console.log("Processing technical-requirements stage");
          onMessage("You're all set! What would you like to do with worldAPI today? You can send money globally, check exchange rates, or explore our network coverage.");
          processedStages.current.add(stage);
          break;
          
        // Add default case to handle any unmatched stage
        default:
          console.log("No specific handler for stage:", stage);
          onMessage("I'm here to help with worldAPI. What would you like to do today?");
          processedStages.current.add(stage);
          break;
      }
    };
    
    // Process all stages that need handling
    handleStageMessage();
  }, [stage, onMessage, onStageChange]);

  return showTerminal ? (
    <AnimatedTerminal 
      onComplete={() => {
        console.log("Terminal animation completed, moving to technical-requirements");
        setShowTerminal(false);
        onMessage("Setup complete! You're now connected to worldAPI. What would you like to do first?");
        onStageChange('technical-requirements');
      }} 
    />
  ) : null;
};
