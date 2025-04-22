import React, { useState, useEffect, useCallback } from 'react'
import { DollyAvatar } from './components/avatar/DollyAvatar'
import DollyBootup from './components/DollyBootup'
import { ChatInterface } from './components/ChatInterface'
import Header from './components/Header'
import SidebarNavigation from './components/SidebarNavigation'
import { LoadingScreen } from './components/LoadingScreen'
import { FlowService, FlowStage } from './services/flowService'
import { useSmartAgentResponse } from './hooks/useSmartAgentResponse'

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
    if (techStage?.postAnimation) {
      const postAnimData = techStage.postAnimation;
      let postAnimDelay = 500; // Start slightly after animation completes

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
       // Handle Cursor Setup and Integration Prompts after post-animation
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
       if (techStage.integrationPrompts) {
          setTimeout(() => {
             const promptsText = "Try these prompts:\n" + techStage.integrationPrompts!.map(prompt => `• ${prompt}`).join('\n');
             setMessages(prev => [...prev, { text: promptsText, isAI: true, shouldSpeak: false }]);
             if (techStage.voiceAfterPrompts) {
                setTimeout(() => {
                   setMessages(prev => [...prev, { text: techStage.voiceAfterPrompts!, isAI: true, shouldSpeak: true }]);
                }, 500);
             }
          }, postAnimDelay);
       }
    }
  }, [flowService]);

  // Initialize messages when stage changes or on initial load
  useEffect(() => {
    console.log(`Stage changed to: ${currentStageId}, isLoading: ${isLoading}`); 
    setIsTechReqAnimating(false);
    let animationTimer: NodeJS.Timeout | null = null;

    if (currentStage && !isLoading) {
      setMessages([]); 
      console.log("Cleared messages for new stage.");
      
      // === Special handling for technical-requirements stage ===
      if (currentStage.id === 'technical-requirements' && currentStage.animation) {
        console.log("Initializing technical-requirements stage - Animation handled by ChatInterface");
        // DO NOT add connectionFeed or postAnimation messages here.
        // ChatInterface will handle the animation display and call handleTechReqAnimationComplete.
        
        // Still schedule the mid-animation voice from here
        const animationData = currentStage.animation;
        if (animationData.voiceMidAnimation) {
          const feedLength = animationData.connectionFeed?.length || 0;
          const midPointTime = (feedLength / 2) * 750; // Estimate based on 750ms per item
          setTimeout(() => {
            console.log("Adding mid-animation voice.");
            setMessages(prev => [...prev, { text: animationData.voiceMidAnimation!, isAI: true, shouldSpeak: true }]);
          }, midPointTime);
        }
        // Set the visual effect timer (optional, could be tied to animation prop in ChatInterface instead)
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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message immediately - not spoken
    setMessages(prev => [...prev, { text: message, isAI: false, shouldSpeak: false }]);
    console.log("User message added:", message); // Debug log
    
    // Handle stage transitions based on user input (button clicks or text match)
    const currentStageData = flowService.getStageById(currentStageId); // Get current stage data
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
      console.log("Handling question:", currentQuestionIndex, currentQuestion.text); // Debug log

      // Add voice after message if available - mark for speaking
      if (currentQuestion.voiceAfter) {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: currentQuestion.voiceAfter!, isAI: true, shouldSpeak: true }]);
          console.log("Added voiceAfter (marked for speaking)."); // Debug log
          
          // Move to next question/stage AFTER showing voiceAfter
          if (currentQuestionIndex < currentStageData.questions!.length - 1) {
            const nextQuestionIndex = currentQuestionIndex + 1;
            const nextQuestion = currentStageData.questions![nextQuestionIndex];
            setTimeout(() => {
              setCurrentQuestionIndex(nextQuestionIndex);
              if (nextQuestion) {
                // Add next question - mark for speaking
                setMessages(prev => [...prev, { text: nextQuestion.text, isAI: true, shouldSpeak: true }]);
                console.log("Added next question (marked for speaking):", nextQuestionIndex, nextQuestion.text); // Debug log
              }
            }, 1500); // Delay before showing next question
          } else if (currentStageData.next) {
            const nextStageIdFromQuestions = currentStageData.next;
            setTimeout(() => {
              console.log("Finished questions, moving to next stage:", nextStageIdFromQuestions); // Debug log
              setCurrentStageId(nextStageIdFromQuestions);
              setCurrentQuestionIndex(0);
            }, 1500); // Delay before moving to next stage
          }
        }, 1000); // Delay before showing voiceAfter
      } else {
        // If no voiceAfter, move to next question/stage immediately (with a small delay)
        if (currentQuestionIndex < currentStageData.questions!.length - 1) {
          const nextQuestionIndex = currentQuestionIndex + 1;
          const nextQuestion = currentStageData.questions![nextQuestionIndex];
          setTimeout(() => {
            setCurrentQuestionIndex(nextQuestionIndex);
            if (nextQuestion) {
              // Add next question - mark for speaking
              setMessages(prev => [...prev, { text: nextQuestion.text, isAI: true, shouldSpeak: true }]);
              console.log("Added next question (no voiceAfter, marked for speaking):", nextQuestionIndex, nextQuestion.text); // Debug log
            }
          }, 1000); // Delay before showing next question
        } else if (currentStageData.next) {
          const nextStageIdFromQuestions = currentStageData.next;
          setTimeout(() => {
            console.log("Finished questions (no voiceAfter), moving to next stage:", nextStageIdFromQuestions); // Debug log
            setCurrentStageId(nextStageIdFromQuestions);
            setCurrentQuestionIndex(0);
          }, 1000); // Delay before moving to next stage
        }
      }

      // Special handling for CFO question - AFTER voiceAfter/next question logic is scheduled
      if (currentQuestion.voiceIfCFO && message.toLowerCase().includes('yes')) {
         // Set direct speech text instead of adding to messages array
         const randomCFOMessage = currentQuestion.voiceIfCFO![
           Math.floor(Math.random() * currentQuestion.voiceIfCFO!.length)
         ];
         // Schedule setting this state, ensuring it happens after potential state updates from voiceAfter
         setTimeout(() => {
            console.log("Setting direct speech for CFO message:", randomCFOMessage);
            setDirectSpeechText(randomCFOMessage);
         }, 1500); // Delay should roughly align with when voiceAfter finishes or shortly after
      }

      return; // Stop further processing
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
        // Error message - mark for speaking
        setMessages(prev => [...prev, { 
          text: "I'm having trouble processing that request. Could you try rephrasing it?", 
          isAI: true, shouldSpeak: true 
        }]);
      }
    } catch (error) {
      console.error('Error getting smart response:', error);
      // Error message - mark for speaking
      setMessages(prev => [...prev, { 
        text: "I'm experiencing a technical glitch. Please try again in a moment.", 
        isAI: true, shouldSpeak: true 
      }]);
    }
  };

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
                    isSpeaking={isSpeaking}
                    expression={isListening ? 'happy' : 'neutral'}
                    gesture={isSpeaking ? 'explaining' : 'idle'}
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
                    onStartSpeaking={() => setIsSpeaking(true)}
                    onStopSpeaking={() => setIsSpeaking(false)}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onMessage={handleMessage}
                    isLoading={isLoading}
                    // Pass the animation state down
                    isTechReqAnimating={isTechReqAnimating}
                    // Pass down direct speech state and callback
                    directSpeechText={directSpeechText}
                    onDirectSpeechComplete={handleDirectSpeechComplete}
                    animationData={currentStageId === 'technical-requirements' ? currentStage?.animation : null}
                    onAnimationComplete={handleTechReqAnimationComplete}
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
