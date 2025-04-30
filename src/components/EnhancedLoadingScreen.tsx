import React from 'react';
import { motion } from 'framer-motion';
import MacbookLoader from './MacbookLoader';

export function EnhancedLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-cyber-dark flex flex-col items-center justify-center z-50">
      {/* MacBook Loader Animation */}
      <div className="relative mb-24">
        <MacbookLoader />
      </div>
      
      {/* Initializing Text with Dots */}
      <motion.div
        className="relative mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-cyber-blue text-xl font-cyber mb-2">INITIALIZING</h2>
          <div className="flex gap-1 justify-center">
            <motion.div
              className="w-2 h-2 bg-cyber-blue rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-cyber-blue rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-cyber-blue rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
