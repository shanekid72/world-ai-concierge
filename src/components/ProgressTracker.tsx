
import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

export type StepStatus = 'upcoming' | 'current' | 'completed';

export interface Step {
  id: string;
  title: string;
  status: StepStatus;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStepId: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, currentStepId }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
      <h3 className="text-sm font-medium text-worldapi-blue-600 mb-4">Integration Progress</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isCompleted = step.status === 'completed';
          
          return (
            <div 
              key={step.id} 
              className={cn(
                "flex items-center",
                isCurrent ? "text-worldapi-blue-500 font-medium" : "",
                isCompleted ? "text-worldapi-teal-500" : "",
                !isCurrent && !isCompleted ? "text-gray-400" : ""
              )}
            >
              <div className="flex-shrink-0 mr-3">
                {isCompleted ? (
                  <CheckCircle size={18} className="text-worldapi-teal-500" />
                ) : (
                  <Circle 
                    size={18} 
                    className={cn(
                      isCurrent ? "text-worldapi-blue-500" : "text-gray-300"
                    )} 
                    fill={isCurrent ? "rgba(10, 75, 112, 0.1)" : "transparent"}
                  />
                )}
              </div>
              <span className="text-sm">{step.title}</span>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "ml-[9px] border-l h-6 my-1",
                  isCompleted ? "border-worldapi-teal-300" : "border-gray-200"
                )}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
