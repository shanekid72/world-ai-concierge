import React from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-cyber-dark flex items-center justify-center z-50">
      <div className="relative">
        <motion.div
          className="w-32 h-32 border-4 border-cyber-blue rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            rotate: 360
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
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
    </div>
  );
} 