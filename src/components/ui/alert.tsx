import * as React from "react";
import { Info } from 'lucide-react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export function Alert({ variant = 'default', children }: AlertProps) {
  return (
    <div className={`p-4 rounded-lg flex items-start gap-2 ${
      variant === 'destructive' 
        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
        : 'bg-cyberpunk-blue/10 text-cyberpunk-blue border border-cyberpunk-blue/20'
    }`}>
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="text-sm">{children}</div>
    </div>
  );
}

export const AlertDescription = ({ children, ...props }: any) => (
  <p {...props}>{children}</p>
);
