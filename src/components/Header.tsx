
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
    <header className="w-full py-4 px-6 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/d6e7930f-08be-4f3b-b43b-8a9b176bb2d1.png" 
            alt="worldAPI Logo" 
            className="h-10 w-auto"
          />
          <span className="ml-2 text-xl font-semibold text-worldapi-blue-500">worldAPI</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-worldapi-blue-50 text-worldapi-blue-500 rounded-full">
          by Digit9
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={handleContactSupport}
          className="text-sm text-worldapi-blue-400 hover:text-worldapi-blue-500 transition-colors"
        >
          Contact Support
        </button>
        <div className="h-8 w-8 rounded-full bg-worldapi-teal-100 text-worldapi-teal-600 flex items-center justify-center">
          <span className="font-medium text-sm">GP</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
