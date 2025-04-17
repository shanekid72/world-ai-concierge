import React from 'react';
import { motion } from 'framer-motion';

const DollyAvatar: React.FC<{ className?: string; isActive?: boolean }> = ({ 
  className = '',
  isActive = false 
}) => {
  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          rotate: isActive ? [0, -2, 2, 0] : 0
        }}
        transition={{
          duration: 0.5,
          repeat: isActive ? Infinity : 0,
          repeatType: "reverse"
        }}
      >
        <img 
          src="/dolly-cyberpunk.png" 
          alt="Dolly - Cyberpunk AI Assistant"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>
      
      {/* Gradient Overlay */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-fuchsia-500/20 mix-blend-overlay"
        animate={{
          opacity: isActive ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Neon Glow */}
      <motion.div 
        className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 opacity-30 blur-sm"
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isActive ? [0.3, 0.5, 0.3] : 0.3
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Circuit Lines */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
        style={{ 
          backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(0, 255, 255, 0.1) 50%)',
          backgroundSize: '4px 4px'
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

export default DollyAvatar; 