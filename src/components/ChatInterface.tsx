
import React, { useState } from 'react';
import AIAgent from './AIAgent';
import ProgressTracker, { Step } from './ProgressTracker';
import { getProgressSteps } from './OnboardingStages';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ChatInterface: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>(() => {
    const initialSteps = getProgressSteps();
    initialSteps[0].status = 'current'; // Set first step as current
    return initialSteps;
  });
  const [currentStepId, setCurrentStepId] = useState<string>(steps[0].id);
  
  const handleStageChange = (stageId: string) => {
    if (stageId === currentStepId) return;
    
    // Update steps statuses
    setSteps(prevSteps => {
      return prevSteps.map(step => {
        if (step.id === currentStepId) {
          return { ...step, status: 'completed' };
        } else if (step.id === stageId) {
          return { ...step, status: 'current' };
        } else {
          return step;
        }
      });
    });
    
    setCurrentStepId(stageId);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-72px)] gap-4 p-4">
      <div className="md:w-1/4 w-full md:h-full overflow-y-auto">
        <ProgressTracker steps={steps} currentStepId={currentStepId} />
        
        <div className="bg-worldapi-blue-50 border border-worldapi-blue-100 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <img 
              src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" 
              alt="worldAPI Logo" 
              className="h-10 w-auto mr-2" // Increased size for better visibility
            />
            <h3 className="text-sm font-medium text-worldapi-blue-800">About worldAPI</h3>
          </div>
          <p className="text-xs text-worldapi-blue-700 mb-3">
            worldAPI provides a unified platform for financial institutions to access global payment networks through a single integration.
          </p>
          <Alert className="bg-worldapi-teal-50 border-worldapi-teal-100 text-worldapi-teal-800">
            <AlertDescription className="text-xs">
              Your information is secured with bank-level encryption and never shared without your permission.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      
      <div className="md:w-3/4 w-full bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-worldapi-blue-800">Dolly</h2>
            <p className="text-sm text-gray-500">I'll guide you through connecting to worldAPI</p>
          </div>
          <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Online
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AIAgent onStageChange={handleStageChange} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
