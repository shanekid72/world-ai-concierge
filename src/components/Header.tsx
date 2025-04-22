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
    <header className="h-16 bg-cyber-dark border-b border-cyber-deep-teal">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-cyber text-cyber-deep-teal">
            Dolly
          </h1>
          <span className="text-sm text-cyber-deep-teal">
            Your AI Concierge
          </span>
        </div>
        
        <nav className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-cyber-deep-teal hover:bg-cyber-secondary rounded-lg text-cyber-dark transition-colors">
            Settings
          </button>
          <button className="px-4 py-2 bg-cyber-deep-teal hover:bg-cyber-secondary rounded-lg text-cyber-dark transition-colors">
            Help
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
