import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Shield, CircuitBoard, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { toast } = useToast();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isNetStatusHovered, setIsNetStatusHovered] = useState(false);

  const handleContactSupport = () => {
    toast("Support Request Received: A neural technician will contact you shortly.", {
      type: 'success'
    });
  };

  return (
    <header className="h-16 bg-cyber-dark">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          <motion.h1 
            className="text-2xl font-cyber text-cyber-deep-teal relative"
            animate={isLogoHovered ? {
              textShadow: ["0 0 8px rgba(9, 211, 172, 0)", "0 0 15px rgba(9, 211, 172, 0.6)", "0 0 8px rgba(9, 211, 172, 0)"],
              y: [0, -2, 0]
            } : { 
              textShadow: "0 0 0px rgba(9, 211, 172, 0)", 
              y: 0 
            }}
            transition={{ 
              duration: isLogoHovered ? 1.2 : 0.3,
              ease: "easeInOut"
            }}
          >
            Dolly
            {isLogoHovered && (
              <motion.span 
                className="absolute -bottom-1 left-0 h-[2px] bg-cyber-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.h1>
          
          <AnimatePresence>
            {isLogoHovered && (
              <motion.div
                className="ml-2 text-cyber-secondary text-xs"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <CircuitBoard size={14} className="inline-block mr-1" />
                v1.0
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <nav className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-cyber-deep-teal hover:bg-cyber-secondary rounded-lg text-cyber-dark transition-colors">
            Help
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
