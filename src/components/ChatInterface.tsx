
import React, { useState } from 'react';
import AIAgent from './AIAgent';
import ProgressTracker, { Step } from './ProgressTracker';
import { getProgressSteps } from './OnboardingStages';
import { MessageSquare, Info } from "lucide-react";
import { Alert, AlertDescription } from '../ui/alert';

const ChatInterface: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>(() => {
    const initialSteps = getProgressSteps();
    initialSteps[0].status = 'current';
    return initialSteps;
  });

  const [currentStepId, setCurrentStepId] = useState<string>(steps[0].id);

  const handleStageChange = (stageId: string) => {
    if (stageId === currentStepId) return;
    setSteps(prev =>
      prev.map(step =>
        step.id === currentStepId
          ? { ...step, status: 'completed' }
          : step.id === stageId
          ? { ...step, status: 'current' }
          : step
      )
    );
    setCurrentStepId(stageId);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-76px)] gap-4 p-4 text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <aside className="md:w-1/4 w-full p-4 border-r border-fuchsia-500 bg-[#1b1b2f]/60 rounded-xl">
        <ProgressTracker steps={steps} currentStepId={currentStepId} onStepClick={handleStageChange} />
        <div className="mt-4 p-4 bg-worldapi-blue-50 text-sm text-white border border-fuchsia-700 rounded-md">
          <div className="flex items-center mb-2">
            <MessageSquare className="text-fuchsia-400 mr-2" />
            <strong className="text-fuchsia-300">About worldAPI</strong>
          </div>
          <p className="text-xs leading-relaxed text-fuchsia-100">
            worldAPI connects fintechs, banks, wallets & MTOs via a single conversational API interface.
          </p>
          <Alert className="bg-black border border-fuchsia-700 mt-4 text-fuchsia-300">
            <AlertDescription className="text-xs flex items-center">
              <Info size={14} className="mr-1" />
              Your data is secure with bank-grade encryption 🔒
            </AlertDescription>
          </Alert>
        </div>
      </aside>

      <main className="md:w-3/4 w-full flex flex-col bg-black/30 backdrop-blur-xl border border-fuchsia-700 rounded-xl p-4 shadow-lg">
        <div className="mb-4 border-b border-fuchsia-800 pb-2">
          <div className="flex items-center">
            <img src="/dolly-avatar.png" alt="Dolly Avatar" className="h-12 w-12 rounded-full border-2 border-fuchsia-400 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-fuchsia-300">Dolly</h2>
              <p className="text-sm text-fuchsia-100">Hi, I'm Dolly — your AI assistant from Digit9</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <AIAgent onStageChange={handleStageChange} currentStepId={currentStepId} />
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
