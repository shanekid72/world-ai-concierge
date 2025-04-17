
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Shield, Zap, CircuitBoard } from 'lucide-react';

const Header: React.FC = () => {
  const { toast } = useToast();

  const handleContactSupport = () => {
    toast({
      title: "Support Request Received",
      description: "A neural technician will contact you shortly.",
    });
  };

  return (
    <header className="w-full py-3 px-6 bg-cyberpunk-darker border-b border-fuchsia-900 shadow-neon flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" 
            alt="worldAPI Logo" 
            className="h-16 w-auto"
          />
          <div className="ml-3">
            <h1 className="text-xl font-cyber text-cyberpunk-pink neon-text tracking-wider">worldAPI</h1>
            <span className="text-xs px-2 py-0.5 bg-cyberpunk-dark text-cyan-400 rounded-full font-mono">
              by <span className="text-cyberpunk-green">Digit9</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center mr-2 text-xs font-mono">
          <CircuitBoard size={14} className="text-cyberpunk-green mr-1" />
          <span className="text-cyan-400">NET_STATUS:</span>
          <span className="text-cyberpunk-green ml-1">CONNECTED</span>
        </div>
        <button 
          onClick={handleContactSupport}
          className="text-sm text-cyan-400 hover:text-cyberpunk-pink transition-colors flex items-center font-mono"
        >
          <Shield size={14} className="mr-1" />
          SUPPORT
        </button>
        <div className="h-9 w-9 rounded-full border border-cyberpunk-blue bg-cyberpunk-dark text-cyberpunk-blue flex items-center justify-center shadow-neon-cyan">
          <span className="font-mono text-sm">GP</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
