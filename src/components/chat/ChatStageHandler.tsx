
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
            onMessage("Coming right up! 🕶️ Running some fancy code magic just for you...\n\nDon't worry if this looks like I'm hacking the Pentagon - it's all part of the show!");
            setShowTerminal(true);
            processedStages.current.add(stage);
          }, 100);
          break;
          
        case 'standardOnboarding':
          console.log("Processing standardOnboarding stage");
          onMessage("🎭 *Puts on KYC hat*\n\nJust kidding! Let's pretend we did all that boring compliance stuff and business requirements... and... DONE! ✅\n\nSee how painless that was? Ready to start playing with worldAPI for real?");
          onStageChange('init');
          processedStages.current.add(stage);
          break;
          
        case 'collectMinimalInfo':
          console.log("Processing collectMinimalInfo stage");
          onMessage("Got it! All set up with those minimal details. Who needs paperwork when you have Dolly, right? 💁‍♀️✨ Let's dive into worldAPI testing mode!");
          onStageChange('init');
          processedStages.current.add(stage);
          break;
          
        case 'technical-requirements':
          console.log("Processing technical-requirements stage");
          onMessage("Alright superstar, you're all set! 🌟 What worldAPI magic shall we conjure up today? Send money around the globe? Check exchange rates? Explore our massive network? The digital world is your oyster!");
          processedStages.current.add(stage);
          break;
          
        // Add default case to handle any unmatched stage
        default:
          console.log("No specific handler for stage:", stage);
          onMessage("I'm here and ready to make worldAPI simple and maybe even fun! What would you like to explore today?");
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
        onMessage("And we're in! 🎉 You're now officially jacked into worldAPI - where money flows like digital champagne! Let's do something cool, shall we? 💥");
        onStageChange('technical-requirements');
      }} 
    />
  ) : null;
};
