
import React, { useState } from 'react';
import AIAgent from './AIAgent';
import ProgressTracker, { Step } from './ProgressTracker';
import { getProgressSteps } from './OnboardingStages';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="flex flex-col md:flex-row h-[calc(100vh-76px)] gap-4 p-4">
      <div className="md:w-1/4 w-full md:h-full overflow-y-auto">
        <ProgressTracker steps={steps} currentStepId={currentStepId} onStepClick={handleStageChange} />
        
        <div className="bg-worldapi-blue-50 border border-worldapi-blue-100 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <img 
              src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" 
              alt="worldAPI Logo" 
              className="h-16 w-auto mr-2" 
            />
            <h3 className="text-sm font-medium text-worldapi-blue-800">About worldAPI</h3>
          </div>
          <p className="text-xs text-worldapi-blue-700 mb-3 leading-relaxed">
            worldAPI provides a unified platform for financial institutions to access global payment networks through a single integration, enabling secure international transfers across Africa, Americas, Asia, Europe, and GCC regions.
          </p>
          <Alert className="bg-worldapi-teal-50 border-worldapi-teal-100 text-worldapi-teal-800">
            <AlertDescription className="text-xs flex items-center">
              <Info size={14} className="mr-1 flex-shrink-0" />
              Your information is secured with bank-level encryption and never shared without your permission.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      
      <div className="md:w-3/4 w-full bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-worldapi-teal-100 flex items-center justify-center mr-3">
                <MessageSquare size={20} className="text-worldapi-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-worldapi-blue-800">Dolly</h2>
                <p className="text-sm text-gray-500">Hi, I'm Dolly — your AI assistant from Digit9. Welcome to worldAPI, the API you can talk to.</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Online
            </div>
          </div>
          
          <Tabs value={currentStepId} onValueChange={handleStageChange} className="w-full">
            <TabsList className="w-full justify-start mb-2 bg-gray-50 p-1 overflow-x-auto flex-nowrap whitespace-nowrap">
              {steps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className={`${step.id === currentStepId ? 'bg-white shadow-sm text-worldapi-blue-700' : 'text-gray-600'} whitespace-nowrap`}
                >
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AIAgent 
            onStageChange={handleStageChange}
            currentStepId={currentStepId}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
