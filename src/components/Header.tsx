
import React from 'react';
import { useToast } from "@/components/ui/use-toast";

const Header: React.FC = () => {
  const { toast } = useToast();

  const handleContactSupport = () => {
    toast({
      title: "Support Request Received",
      description: "A member of our team will contact you shortly.",
    });
  };

  return (
    <header className="w-full py-3 px-6 bg-gradient-to-r from-worldapi-blue-600 to-worldapi-blue-500 shadow-md flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/59c87c53-d492-4b80-9901-b57dffc270fb.png" 
            alt="worldAPI Logo" 
            className="h-24 w-auto" // Increased size further for better visibility
          />
          <span className="ml-2 text-xs px-2 py-0.5 bg-white text-worldapi-blue-600 rounded-full font-medium">
            by Digit9
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={handleContactSupport}
          className="text-sm text-white hover:text-worldapi-blue-100 transition-colors"
        >
          Contact Support
        </button>
        <div className="h-9 w-9 rounded-full bg-white text-worldapi-blue-600 flex items-center justify-center shadow-sm">
          <span className="font-medium text-sm">GP</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
