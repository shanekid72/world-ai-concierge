import { useEffect, useRef } from 'react';
import { chatFlow } from '@/utils/chatFlow';

interface ChatInitializerProps {
  stage: string;
  appendAgentMessage: (message: string) => void;
}

export const ChatInitializer: React.FC<ChatInitializerProps> = ({
  stage,
  appendAgentMessage
}) => {
  const hasShownIntro = useRef(false);
  const techStageInitialized = useRef(false);

  useEffect(() => {
    const currentStage = chatFlow.find(s => s.id === stage);
    if (!currentStage) return;

    // Handle intro stage
    if (stage === 'intro' && !hasShownIntro.current) {
      hasShownIntro.current = true;
      if (currentStage.voice) {
        appendAgentMessage(currentStage.voice);
      }
      if (currentStage.chat) {
        setTimeout(() => {
          appendAgentMessage(currentStage.chat!);
        }, 1000);
      }
    }

    // Handle technical requirements stage
    if (stage === 'technical-requirements' && !techStageInitialized.current) {
      techStageInitialized.current = true;
      if (currentStage.postAnimation?.voice) {
        appendAgentMessage(currentStage.postAnimation.voice);
      }
      if (currentStage.postAnimation?.chat) {
        setTimeout(() => {
          appendAgentMessage(currentStage.postAnimation!.chat);
        }, 1000);
      }
    }

    // Handle other stages
    if (currentStage.chat && ![stage === 'intro', stage === 'technical-requirements'].includes(true)) {
      appendAgentMessage(currentStage.chat);
    }
  }, [stage, appendAgentMessage]);

  return null;
};
