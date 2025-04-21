import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Shield, CircuitBoard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { toast } = useToast();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isNetStatusHovered, setIsNetStatusHovered] = useState(false);

  const handleContactSupport = () => {
    toast({
      title: "Support Request Received",
      description: "A neural technician will contact you shortly.",
    });
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative py-4 px-8 flex items-center justify-between border-b border-cyber-blue/30 bg-cyber-darker/80 backdrop-blur-sm"
    >
      <div className="flex items-center space-x-4">
        <motion.div 
          className="relative"
          onHoverStart={() => setIsLogoHovered(true)}
          onHoverEnd={() => setIsLogoHovered(false)}
          whileHover={{ scale: 1.05 }}
        >
          <img src="/logo.png" alt="worldAPI" className="h-10 w-auto" />
          {isLogoHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 power-glow rounded-full"
            />
          )}
        </motion.div>
        
        <div className="flex flex-col">
          <motion.h1 
            className="text-2xl font-cyber glitch-text"
            data-text="worldAPI"
          >
            worldAPI
          </motion.h1>
          <motion.span 
            className="text-xs text-cyber-pink border border-cyber-pink/50 px-2 py-0.5"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,0,204,0.5)' }}
          >
            by Digit9
          </motion.span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <motion.div 
          className="flex items-center space-x-2"
          onHoverStart={() => setIsNetStatusHovered(true)}
          onHoverEnd={() => setIsNetStatusHovered(false)}
        >
          <div className={`h-2 w-2 rounded-full ${isNetStatusHovered ? 'power-glow' : ''} bg-green-500`} />
          <span className="text-sm text-cyber-blue">NET_STATUS: ONLINE</span>
          {isNetStatusHovered && (
            <Zap className="w-4 h-4 text-cyber-pink" />
          )}
        </motion.div>

        <motion.button 
          onClick={handleContactSupport}
          className="cyber-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact Support
        </motion.button>

        <div className="flex items-center space-x-3">
          <motion.div 
            className="h-10 w-10 rounded-full bg-cyber-blue/20 border-2 border-cyber-blue flex items-center justify-center power-glow"
            whileHover={{ scale: 1.1 }}
          >
            GP
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
