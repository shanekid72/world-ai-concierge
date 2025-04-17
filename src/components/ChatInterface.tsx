
import React, { useState } from 'react';
import AIAgent from './AIAgent';
import ProgressTracker, { Step } from './ProgressTracker';
import { getProgressSteps } from './OnboardingStages';
import { MessageSquare, Info, Cpu, Zap, Shield, Globe } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="flex flex-col md:flex-row h-[calc(100vh-76px)] gap-4 p-4 text-cyan-400 bg-cyberpunk-bg tech-pattern scanlines">
      <aside className="md:w-1/4 w-full p-4 border-r border-fuchsia-900 bg-cyberpunk-dark/80 backdrop-blur-md rounded-xl">
        <div className="mb-6 flex items-center">
          <Cpu className="h-6 w-6 text-cyberpunk-pink power-glow mr-2" />
          <h2 className="text-xl font-cyber text-cyberpunk-pink neon-text">worldAPI_NEXUS</h2>
        </div>
        
        <ProgressTracker steps={steps} currentStepId={currentStepId} onStepClick={handleStageChange} />
        
        <div className="mt-6 p-4 cyber-panel border-cyan-800 rounded-md">
          <div className="flex items-center mb-2">
            <Globe className="text-cyberpunk-blue mr-2 h-4 w-4" />
            <strong className="text-cyberpunk-blue font-cyber text-sm">ABOUT_WORLDAPI</strong>
          </div>
          <p className="text-xs leading-relaxed text-cyan-300 font-mono">
            worldAPI connects fintechs, banks, wallets & MTOs via a single conversational neural interface.
          </p>
          <Alert className="bg-cyberpunk-darker border border-fuchsia-900 mt-4 text-cyberpunk-green">
            <AlertDescription className="text-xs flex items-center font-mono">
              <Shield size={14} className="mr-1 text-cyberpunk-green" />
              Data secured with quantum-grade encryption 🔒
            </AlertDescription>
          </Alert>
        </div>
      </aside>

      <main className="md:w-3/4 w-full flex flex-col cyber-grid border-cyan-800 rounded-xl p-4 shadow-lg">
        <div className="mb-4 border-b border-fuchsia-900 pb-2">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full border-2 border-fuchsia-500 mr-3 overflow-hidden shadow-neon flex items-center justify-center bg-cyberpunk-darker">
              <Zap className="h-6 w-6 text-cyberpunk-pink" />
            </div>
            <div>
              <h2 className="text-xl font-cyber text-cyberpunk-pink glitch">DOLLY</h2>
              <p className="text-sm text-cyan-400 font-mono">Neural Assistant :: Digit9 // v2.5.0</p>
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
