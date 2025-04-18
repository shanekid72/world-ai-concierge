import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Info, Zap } from 'lucide-react';
import { AIAgent } from './AIAgent';
import { Alert } from './ui/alert';
import ProgressTracker, { Step } from './ProgressTracker';
import { getProgressSteps } from './OnboardingStages';
import DollyAvatar from '@/assets/dolly-avatar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function ChatInterface() {
  const [stage, setStage] = useState('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<Step[]>(() => {
    const initialSteps = getProgressSteps();
    initialSteps[0].status = 'current';
    return initialSteps;
  });

  const [currentStepId, setCurrentStepId] = useState<string>(steps[0].id);
  const [isAvatarActive, setIsAvatarActive] = useState(false);

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
    <motion.div 
      className="flex flex-col md:flex-row h-[calc(100vh-76px)] gap-4 p-4 text-cyan-400 bg-cyberpunk-bg tech-pattern scanlines"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.aside 
        className="md:w-1/4 w-full p-4 border-r border-fuchsia-900 bg-cyberpunk-dark/80 backdrop-blur-md rounded-xl"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className="mb-6 flex items-center"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Info className="h-6 w-6 text-cyberpunk-pink power-glow mr-2" />
          <h2 className="text-xl font-cyber text-cyberpunk-pink neon-text">worldAPI_NEXUS</h2>
        </motion.div>
        
        <ProgressTracker steps={steps} currentStepId={currentStepId} onStepClick={handleStageChange} />
        
        <motion.div 
          className="mt-6 p-4 cyber-panel border-cyan-800 rounded-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center mb-2">
            <Info className="text-cyberpunk-blue mr-2 h-4 w-4" />
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
        </motion.div>
      </motion.aside>

      <motion.main 
        className="md:w-3/4 w-full flex flex-col cyber-grid border-cyan-800 rounded-xl p-4 shadow-lg"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div 
          className="mb-4 border-b border-fuchsia-900 pb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center">
            <div className="h-16 w-16 mr-4">
              <DollyAvatar className="shadow-neon" isActive={isAvatarActive} />
            </div>
            <div>
              <motion.h2 
                className="text-2xl font-cyber text-cyberpunk-pink glitch mb-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                DOLLY
              </motion.h2>
              <motion.p 
                className="text-sm text-cyan-400 font-mono flex items-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse" />
                Neural Assistant :: Digit9 // v2.5.0
              </motion.p>
            </div>
          </div>
        </motion.div>
        <div className="flex-1">
          <AIAgent 
            onStageChange={handleStageChange} 
            currentStepId={currentStepId}
            onTypingStateChange={setIsAvatarActive}
          />
        </div>
      </motion.main>
    </motion.div>
  );
}
