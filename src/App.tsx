import React, { useState, useEffect, useCallback } from 'react'
import { DollyAvatar } from './components/avatar/DollyAvatar'
import DollyBootup from './components/DollyBootup'
import { ChatInterface } from './components/ChatInterface'
import Header from './components/Header'
import SidebarNavigation from './components/SidebarNavigation'
import { LoadingScreen } from './components/LoadingScreen'
import { FlowService, FlowStage } from './services/flowService'
import { useSmartAgentResponse } from './hooks/useSmartAgentResponse'
import useConversationStore, { ANIMATION_MAPPINGS } from './store/conversationStore'

// Define a more specific message type
interface DisplayMessage {
  text: string;
  isAI: boolean;
  shouldSpeak?: boolean; // Flag to indicate if the message should be spoken
}

function App() {
  const [isBooted, setIsBooted] = useState(false)
  const [currentStageId, setCurrentStageId] = useState('intro')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  // Add state to track technical requirements animation
  const [isTechReqAnimating, setIsTechReqAnimating] = useState(false);
  const flowService = FlowService.getInstance();
  const currentStage = flowService.getStageById(currentStageId);
  const { getResponse: getSmartResponse } = useSmartAgentResponse();
  // Use the new message type for state
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  // State for voice-only messages
  const [directSpeechText, setDirectSpeechText] = useState<string | null>(null);
  // State for integration prompts
  const [currentIntegrationPrompts, setCurrentIntegrationPrompts] = useState<string[] | null>(null);
  const { setAnimation } = useConversationStore(); // Get setAnimation from store

  useEffect(() => {
    // Remove the initial loader
    const initialLoader = document.querySelector('.initial-loader');
    if (initialLoader) {
      initialLoader.remove();
    }

    // Initialize app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Callback to handle completion of the tech-req animation
  const handleTechReqAnimationComplete = useCallback(() => {
    console.log("Tech requirements animation complete. Adding post-animation content.");
    const techStage = flowService.getStageById('technical-requirements');
    if (!techStage) return; // Guard clause

    let postAnimDelay = 500; 

    if (techStage.postAnimation) {
      const postAnimData = techStage.postAnimation;
      if (postAnimData.voice) {
        setMessages(prev => [...prev, { text: postAnimData.voice!, isAI: true, shouldSpeak: true }]);
        postAnimDelay += 1500; 
      }
      if (postAnimData.chat) {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: postAnimData.chat!, isAI: true, shouldSpeak: false }]);
        }, postAnimDelay);
        postAnimDelay += 1500; 
      }
      if (postAnimData.voiceDownload) {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: postAnimData.voiceDownload!, isAI: true, shouldSpeak: true }]);
        }, postAnimDelay);
        postAnimDelay += 1500; 
      }
    }
       // Handle Cursor Setup
       if (techStage.cursorSetup) {
          const setupData = techStage.cursorSetup;
          setTimeout(() => {
             if (setupData.steps) {
                const stepsText = "Cursor Setup:\n" + setupData.steps.map(step => `• ${step}`).join('\n');
                setMessages(prev => [...prev, { text: stepsText, isAI: true, shouldSpeak: false }]);
             }
             if (setupData.voice) {
                setTimeout(() => {
                   setMessages(prev => [...prev, { text: setupData.voice!, isAI: true, shouldSpeak: true }]);
                }, 500);
             }
          }, postAnimDelay);
          postAnimDelay += 2000;
       }
       // Handle Integration Prompts - Set state instead of adding to messages
       if (techStage.integrationPrompts) {
          setTimeout(() => {
             console.log("Setting integration prompts state.");
             setCurrentIntegrationPrompts(techStage.integrationPrompts || null);
             // Add the accompanying voice after setting the prompts state
             if (techStage.voiceAfterPrompts) {
                setTimeout(() => {
                   setMessages(prev => [...prev, { text: techStage.voiceAfterPrompts!, isAI: true, shouldSpeak: true }]);
                }, 500); // Voice slightly after prompts appear
             }
          }, postAnimDelay);
       }
    
  }, [flowService]); 

  // Initialize messages/prompts when stage changes or on initial load
  useEffect(() => {
    console.log(`Stage changed to: ${currentStageId}, isLoading: ${isLoading}`); 
    setIsTechReqAnimating(false);
    setCurrentIntegrationPrompts(null); // Clear prompts on any stage change
    let animationTimer: NodeJS.Timeout | null = null;

    if (currentStage && !isLoading) {
      setMessages([]); 
      console.log("Cleared messages for new stage.");
      
      // === Special handling for technical-requirements stage ===
      if (currentStage.id === 'technical-requirements' && currentStage.animation) {
        console.log("Initializing technical-requirements stage - Animation handled by ChatInterface");
        // App.tsx only handles the mid-animation voice
        const animationData = currentStage.animation;
        if (animationData.voiceMidAnimation) {
          const feedLength = animationData.connectionFeed?.length || 0;
          const midPointTime = (feedLength / 2) * 750; 
          setTimeout(() => {
            console.log("Adding mid-animation voice.");
            setMessages(prev => [...prev, { text: animationData.voiceMidAnimation!, isAI: true, shouldSpeak: true }]);
          }, midPointTime);
        }
        setIsTechReqAnimating(true);
        animationTimer = setTimeout(() => setIsTechReqAnimating(false), 5000); 
      } 
      // === Fallback to default stage handling ===
      else {
         console.log("Handling default stage type.");
         let delay = 0;
         if (currentStage.voice) {
            setMessages(prev => [...prev, { text: currentStage.voice!, isAI: true, shouldSpeak: true }]);
            delay += 1500; 
            console.log("Added voice message (marked for speaking).");
         }
         if (currentStage.chat) {
            setTimeout(() => {
               setMessages(prev => [...prev, { text: currentStage.chat!, isAI: true, shouldSpeak: false }]);
               console.log("Added chat message after delay (not speaking):", delay);
            }, delay);
            delay += 1500; 
         }
         if (currentStage.kycChecklist && currentStage.kycChecklist.length > 0) {
            setTimeout(() => {
               const kycText = "Here's what we need from you:\n" + 
                              currentStage.kycChecklist!.map(item => `• ${item}`).join('\n');
               setMessages(prev => [...prev, { text: kycText, isAI: true, shouldSpeak: false }]);
               console.log("Added KYC checklist after delay (not speaking):", delay);
               if (currentStage.voiceAfterList) {
                  setMessages(prev => [...prev, { text: currentStage.voiceAfterList!, isAI: true, shouldSpeak: true }]);
                  console.log("Added voiceAfterList (marked for speaking).");
               }
            }, delay);
            delay += 1500; 
         }
         if (currentStage.questions && currentStage.questions.length > 0) {
            const firstQuestion = currentStage.questions[0];
            if (firstQuestion) {
               setTimeout(() => {
                  setMessages(prev => [...prev, { text: firstQuestion.text, isAI: true, shouldSpeak: true }]);
                  console.log("Added first question after delay (marked for speaking):", delay);
               }, delay);
            }
         }
      }
    }
    return () => {
      if (animationTimer) clearTimeout(animationTimer);
    };
  }, [currentStageId, isLoading]);

  // Wrap handleSendMessage in useCallback
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message immediately - not spoken
    setMessages(prev => [...prev, { text: message, isAI: false, shouldSpeak: false }]);
    console.log("User message added:", message); // Debug log
    
    // Re-fetch current stage data inside the callback using function form of setState or currentStageId
    const currentStageData = flowService.getStageById(currentStageId); 
    
    // Handle stage transitions based on user input (button clicks or text match)
    const nextStageId = currentStageData?.onOptionSelect?.[message];
    
    if (nextStageId) {
      console.log("Option selected:", message, "-> Transitioning to stage:", nextStageId); // Debug log
      setCurrentStageId(nextStageId);
      setCurrentQuestionIndex(0);
      return; // Stop further processing in this handler
    }

    // Handle questions if present in current stage
    if (currentStageData?.questions && currentStageData.questions.length > 0) {
      const currentQuestion = currentStageData.questions[currentQuestionIndex];
      console.log("Handling question:", currentQuestionIndex, currentQuestion.text);

      // --- Determine Next Step --- 
      const isLastQuestion = !(currentQuestionIndex < currentStageData.questions!.length - 1);
      let nextStepAction: (() => void) | null = null;
      let progressionDelay = 1500; // Default delay before showing next question/stage

      if (!isLastQuestion) {
        // Not the last question -> prepare to move to the next question
        const nextQuestionIndex = currentQuestionIndex + 1;
        console.log("Next step determined: Next question index", nextQuestionIndex);
        nextStepAction = () => {
          const latestStageData = flowService.getStageById(currentStageId); // Re-fetch latest stage data
          const nextQuestion = latestStageData?.questions?.[nextQuestionIndex];
          if (nextQuestion) {
            setCurrentQuestionIndex(nextQuestionIndex);
            setMessages(prev => [...prev, { text: nextQuestion.text, isAI: true, shouldSpeak: true }]);
            console.log("Progression: Displaying next question", nextQuestionIndex);
          }
        };
      } else if (currentStageData.next) {
        // Last question and has a next stage -> prepare to move to the next stage
        const nextStageId = currentStageData.next;
        console.log("Next step determined: Next stage", nextStageId);
        progressionDelay = 1500; // Keep a delay before stage transition
        nextStepAction = () => {
          console.log("Progression: Moving to next stage", nextStageId);
          setCurrentStageId(nextStageId);
          setCurrentQuestionIndex(0);
        };
      }

      // --- Schedule Actions --- 

      // 1. Schedule Voice After display/speech (Quickly)
      if (currentQuestion.voiceAfter) {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: currentQuestion.voiceAfter!, isAI: true, shouldSpeak: true }]);
          console.log("Scheduled: voiceAfter display/speech.");
        }, 500); 
      }

      // 2. Schedule Special CFO direct speech (If applicable, slightly later)
      if (currentQuestion.text === "Are you a CFO?" && message.toLowerCase().includes('yes') && currentQuestion.voiceIfCFO) {
         const randomCFOMessage = currentQuestion.voiceIfCFO![
           Math.floor(Math.random() * currentQuestion.voiceIfCFO!.length)
         ];
         setTimeout(() => {
            console.log("Scheduled: directSpeech for CFO.");
            setDirectSpeechText(randomCFOMessage);
         }, 1000); // Schedule after potential voiceAfter starts
      }

      // 3. Schedule the determined Next Step (Flow Progression)
      if (nextStepAction) {
        setTimeout(nextStepAction, progressionDelay); 
      }

      return; // Stop further processing in this handler
    }

    // Use smart response as fallback - assume it should be spoken
    console.log("No option/question match, using smart response."); // Debug log
    try {
      const smartResponse = await getSmartResponse({
        stage: currentStageId,
        userInput: message,
        context: {}
      });

      if (smartResponse) {
        setMessages(prev => [...prev, { text: smartResponse, isAI: true, shouldSpeak: true }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "I'm having trouble processing that request. Could you try rephrasing it?", 
          isAI: true, shouldSpeak: true 
        }]);
      }
    } catch (error) {
      console.error('Error getting smart response:', error);
      setMessages(prev => [...prev, { 
        text: "I'm experiencing a technical glitch. Please try again in a moment.", 
        isAI: true, shouldSpeak: true 
      }]);
    }
  // Add dependencies for useCallback
  }, [currentStageId, currentQuestionIndex, flowService, getSmartResponse]); 

  const handleMessage = (message: string) => {
    // Generic message handler, assume should be spoken if from AI? Or needs context.
    // Let's assume for now this isn't used for core flow messages.
    if (!message.trim()) return;
    // setMessages(prev => [...prev, { text: message, isAI: true, shouldSpeak: ??? }]);
    console.warn("handleMessage called, unsure if message should be spoken:", message);
  };

  // Callback to clear direct speech text after it's been handled
  const handleDirectSpeechComplete = useCallback(() => {
    console.log("Clearing direct speech text.");
    setDirectSpeechText(null);
  }, []); // Empty dependency array means this function reference is stable

  // --- Callbacks passed to ChatInterface to control animation --- 
  const handleStartSpeaking = useCallback(() => {
    console.log("App: handleStartSpeaking");
    setIsSpeaking(true);
    setAnimation(ANIMATION_MAPPINGS.SPEAKING);
  }, [setAnimation]);

  const handleStopSpeaking = useCallback(() => {
    console.log("App: handleStopSpeaking");
    setIsSpeaking(false);
    setAnimation(ANIMATION_MAPPINGS.IDLE);
  }, [setAnimation]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-screen bg-cyber-dark text-white overflow-hidden">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 p-4 border-r border-cyber-blue/20">
          <SidebarNavigation 
            currentStep={currentStageId}
            onStepClick={(stageId) => {
              // When clicking navigation, ensure proper state reset
              setCurrentStageId(stageId);
              setCurrentQuestionIndex(0);
            }}
          />
        </div>
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full container mx-auto px-4 py-8 relative">
            <div className="h-full max-w-4xl mx-auto">
              <div className="relative mb-8">
                <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-20">
                  <DollyAvatar 
                     position={{ x: 50, y: 0 }}
                  />
                </div>
              </div>
              
              <div className="mt-12 h-[calc(100%-6rem)]">
                {!isBooted ? (
                  <DollyBootup onComplete={() => setIsBooted(true)} />
                ) : (
                  <ChatInterface 
                    onStartListening={() => setIsListening(true)}
                    onStopListening={() => setIsListening(false)}
                    onStartSpeaking={handleStartSpeaking}
                    onStopSpeaking={handleStopSpeaking}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onMessage={handleMessage}
                    isLoading={isLoading}
                    isTechReqAnimating={isTechReqAnimating}
                    directSpeechText={directSpeechText}
                    onDirectSpeechComplete={handleDirectSpeechComplete}
                    animationData={currentStageId === 'technical-requirements' ? currentStage?.animation : null}
                    onAnimationComplete={handleTechReqAnimationComplete}
                    currentIntegrationPrompts={currentIntegrationPrompts}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App
