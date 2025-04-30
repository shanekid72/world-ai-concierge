import React from "react";

export interface Step {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

const ProgressTracker = ({
  steps,
  currentStepId,
  onStepClick,
}: {
  steps: Step[];
  currentStepId: string;
  onStepClick: (id: string) => void;
}) => {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div
          key={step.id}
          onClick={() => onStepClick(step.id)}
          className={`cursor-pointer p-2 rounded transition-all
            ${step.status === 'current' ? 'bg-fuchsia-600 text-white' : ''}
            ${step.status === 'completed' ? 'bg-green-600 text-white' : ''}
            ${step.status === 'upcoming' ? 'bg-gray-700 text-gray-400' : ''}`}
        >
          {step.label}
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;