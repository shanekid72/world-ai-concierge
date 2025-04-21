import React from 'react';
import { motion } from 'framer-motion';

const DollyAvatar = () => {
  return (
    <motion.div
      className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-cyber-pink shadow-[0_0_20px_rgba(255,0,204,0.7)]"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-cyber-dark/50 backdrop-blur-sm" />
      <div className="absolute top-0 left-0 right-0 text-center text-cyber-pink font-cyber text-sm py-1">
        Dolly
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-cyber-pink/20 to-cyber-blue/20"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

export default DollyAvatar;
