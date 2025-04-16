
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
          onMessage("I'll guide you through the compliance and business requirements. First, could you tell me the name of your organization?");
          // Don't auto-progress - wait for user to provide input
          processedStages.current.add(stage);
          break;
          
        case 'collectMinimalInfo':
          console.log("Processing collectMinimalInfo stage");
          onMessage("To set up your account for testing worldAPI, I'll need some basic information. Could you provide your name and what you're planning to build?");
          // Don't auto-progress - wait for user to provide input
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
