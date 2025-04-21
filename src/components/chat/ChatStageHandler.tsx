import React, { useRef, useState, useEffect } from 'react';
import { chatFlow } from '@/utils/chatFlow';
import AnimatedTerminal from './AnimatedTerminal';

interface ChatStageHandlerProps {
  stage: string;
  onStageChange: (stageId: string) => void;
  onMessage: (message: string) => void;
  onVoiceMessage: (message: string) => void;
  conversationStarted?: boolean;
}

export const ChatStageHandler: React.FC<ChatStageHandlerProps> = ({
  stage,
  onStageChange,
  onMessage,
  onVoiceMessage,
  conversationStarted = false
}) => {
  const processedStages = useRef<Set<string>>(new Set());
  const [showTerminal, setShowTerminal] = useState(false);
  
  useEffect(() => {
    if (processedStages.current.has(stage)) {
      return;
    }
    
    const currentStage = chatFlow.find(s => s.id === stage);
    if (!currentStage) return;

    const handleStageMessage = () => {
      switch (stage) {
        case 'path-selection':
          processedStages.current.add(stage);
          break;
          
        case 'partner-onboarding':
          if (currentStage.chat) {
            onMessage(currentStage.chat);
          }
          processedStages.current.add(stage);
          break;
          
        case 'collectMinimalInfo':
          if (currentStage.voice) {
            onVoiceMessage(currentStage.voice);
          }
          if (currentStage.questions?.[0]) {
            setTimeout(() => {
              onMessage(currentStage.questions![0].text);
            }, 1000);
          }
          processedStages.current.add(stage);
          break;

        case 'compliance-kyc':
          if (currentStage.voice) {
            onVoiceMessage(currentStage.voice);
          }
          if (currentStage.chat) {
            setTimeout(() => {
              onMessage(currentStage.chat!);
            }, 1000);
          }
          if (currentStage.kycChecklist) {
            setTimeout(() => {
              onMessage(currentStage.kycChecklist!.join('\n'));
            }, 2000);
          }
          if (currentStage.voiceAfterList) {
            setTimeout(() => {
              onVoiceMessage(currentStage.voiceAfterList!);
            }, 3000);
          }
          processedStages.current.add(stage);
          break;

        case 'technical-requirements':
          if (currentStage.animation) {
            // Handle animation sequence
            currentStage.animation.connectionFeed.forEach((feed, index) => {
              setTimeout(() => {
                onMessage(feed);
              }, index * 2000);
            });
            setTimeout(() => {
              onVoiceMessage(currentStage.animation!.voiceMidAnimation);
            }, currentStage.animation.connectionFeed.length * 2000);
          }
          
          // Handle post-animation messages
          if (currentStage.postAnimation) {
            if (currentStage.postAnimation.voice) {
              setTimeout(() => {
                onVoiceMessage(currentStage.postAnimation!.voice);
              }, 5000);
            }
            if (currentStage.postAnimation.chat) {
              setTimeout(() => {
                onMessage(currentStage.postAnimation!.chat);
              }, 6000);
            }
          }

          // Handle cursor setup
          if (currentStage.cursorSetup) {
            if (currentStage.cursorSetup.voice) {
              setTimeout(() => {
                onVoiceMessage(currentStage.cursorSetup!.voice);
              }, 7000);
            }
          }

          // Handle final prompts
          if (currentStage.voiceAfterPrompts) {
            setTimeout(() => {
              onVoiceMessage(currentStage.voiceAfterPrompts!);
            }, 8000);
          }
          
          processedStages.current.add(stage);
          break;
          
        default:
          processedStages.current.add(stage);
          break;
      }
    };
    
    handleStageMessage();
  }, [stage, onMessage, onVoiceMessage, onStageChange, conversationStarted]);

  return showTerminal ? (
    <AnimatedTerminal 
      onComplete={() => {
        setShowTerminal(false);
        onMessage("Setup complete! You're now connected to worldAPI. What would you like to do first? 🚀");
        onStageChange('technical-requirements');
      }} 
    />
  ) : null;
};
