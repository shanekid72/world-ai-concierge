import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface SidebarNavigationProps {
  currentStep: string;
  onStepClick: (stepId: string) => void;
}

const steps: Step[] = [
  { id: 'welcome', label: 'Welcome', isCompleted: false, isActive: true },
  { id: 'business', label: 'Business Requirements', isCompleted: false, isActive: false },
  { id: 'compliance', label: 'Compliance & KYC', isCompleted: false, isActive: false },
  { id: 'technical', label: 'Technical Requirements', isCompleted: false, isActive: false },
  { id: 'golive', label: 'Go Live', isCompleted: false, isActive: false }
];

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ currentStep, onStepClick }) => {
  return (
    <motion.div 
      className="bg-cyber-darker/80 p-6 rounded-lg border border-cyber-blue/10"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-lg font-cyber text-cyber-blue mb-6 px-2 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="mr-2">Integration Progress</span>
        <div className="h-px flex-1 bg-gradient-to-r from-cyber-blue/50 to-transparent" />
      </motion.h2>

      <div className="space-y-4">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`w-full text-left px-4 py-3 rounded-md transition-all duration-300 relative group ${
                currentStep === step.id
                  ? 'bg-cyber-blue/10 text-white'
                  : 'text-gray-500 hover:bg-cyber-blue/5 hover:text-gray-300'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <motion.div 
                  className={`w-3 h-3 rounded-full mr-4 transition-all duration-300 relative ${
                    currentStep === step.id 
                      ? 'bg-cyber-blue shadow-[0_0_10px_rgba(0,255,255,0.5)]' 
                      : 'border-2 border-gray-600'
                  }`}
                  whileHover={{ scale: 1.2 }}
                >
                  {currentStep === step.id && (
                    <motion.div
                      className="absolute inset-0 w-full h-full rounded-full bg-cyber-blue/30"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className="font-cyber text-sm tracking-wide flex-1">{step.label}</span>
                <motion.div
                  className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    currentStep === step.id ? 'text-cyber-blue' : 'text-gray-500'
                  }`}
                  animate={currentStep === step.id ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight size={16} />
                </motion.div>
              </div>
              {currentStep === step.id && (
                <motion.div
                  className="absolute inset-y-0 left-0 w-1 bg-cyber-blue rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      
      <motion.div 
        className="mt-10 p-4 bg-cyber-dark/50 rounded-lg border border-cyber-blue/20 overflow-hidden relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyber-blue/5 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="relative">
          <div className="flex items-center mb-3">
            <span className="text-sm text-cyber-blue font-cyber">worldAPI</span>
            <span className="text-xs text-cyber-blue/50 ml-2 font-cyber">v1.0.0</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your gateway to seamless global transactions and real-time financial data.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SidebarNavigation;
