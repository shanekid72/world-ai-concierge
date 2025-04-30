import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Power, Wifi, Zap } from "lucide-react";

interface Props {
  onComplete: () => void;
}

const bootSequences = [
  "Initializing neural pathways...",
  "Calibrating voice synthesis...",
  "Loading personality matrix...",
  "Activating emotion engine...",
  "Establishing secure connection...",
  "Ready to assist! 🌟"
];

const DollyBootup = ({ onComplete }: Props) => {
  const [currentSequence, setCurrentSequence] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSequence(prev => {
        if (prev === bootSequences.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        className="text-center space-y-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.div 
          className="flex items-center justify-center space-x-4 mb-8"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Power className="w-6 h-6 text-cyber-accent" />
          <Wifi className="w-6 h-6 text-cyber-blue" />
          <Zap className="w-6 h-6 text-cyber-yellow" />
          <Mic className="w-6 h-6 text-cyber-green" />
        </motion.div>

        <motion.h1
          className="text-4xl font-cyber bg-gradient-to-r from-cyber-pink via-cyber-blue to-cyber-purple bg-clip-text text-transparent"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          DOLLY AI v1.0
        </motion.h1>

        <div className="space-y-2">
          {bootSequences.map((sequence, index) => (
            <motion.div
              key={sequence}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentSequence ? 1 : 0,
                x: index <= currentSequence ? 0 : -20
              }}
              className="font-mono text-sm"
            >
              <span className={
                index === currentSequence 
                  ? "text-cyber-accent" 
                  : index < currentSequence 
                    ? "text-cyber-blue" 
                    : "text-gray-600"
              }>
                {sequence}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 p-4 bg-cyber-darker/50 border border-cyber-blue/20 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: currentSequence === bootSequences.length - 1 ? 1 : 0, y: 0 }}
        >
          <p className="text-cyber-blue font-cyber text-sm">
            Voice Interface Ready • Type or Speak to Begin
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your personal AI concierge for global financial solutions
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DollyBootup;
