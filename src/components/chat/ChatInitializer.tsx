
import React, { useEffect, useRef } from 'react';
import { Stage } from '../../hooks/useWorldApiChat';

interface ChatInitializerProps {
  stage: Stage;
  appendAgentMessage: (message: string) => void;
}

export const ChatInitializer: React.FC<ChatInitializerProps> = ({
  stage,
  appendAgentMessage
}) => {
  const hasShownIntro = useRef(false);
  const techStageInitialized = useRef(false);

  useEffect(() => {
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      appendAgentMessage("👋 Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.");
      setTimeout(() => {
        appendAgentMessage("✨ Wanna go through onboarding or skip to testing our legendary worldAPI?");
      }, 1000);
    }
    
    if (stage === 'technical-requirements' && !techStageInitialized.current) {
      techStageInitialized.current = true;
      appendAgentMessage("You're all set to use worldAPI! I can help you send money globally, check exchange rates, or explore our network coverage. What would you like to do today?");
    }
  }, [stage, appendAgentMessage]);

  return null;
};
