import React from 'react';
import { onboardingStages } from './OnboardingStages';
import { Stage } from '../hooks/useWorldApiChat';
import clsx from 'clsx';

type SidebarNavigationProps = {
  currentStage: Stage;
  completedStages: Stage[];
  onNavigate: (stageId: Stage) => void;
};

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentStage,
  completedStages,
  onNavigate
}) => {
  const isUnlocked = (stageId: Stage) =>
    completedStages.includes(stageId) || stageId === currentStage;

  return (
    <aside className="w-64 bg-gradient-to-br from-[#1b1b2f] via-[#1e1e40] to-[#141414] text-white shadow-xl p-6 space-y-4 rounded-r-xl">
      <h2 className="text-xl font-bold mb-4 text-fuchsia-400 tracking-wide">
        🌐 Onboarding Flow
      </h2>
      <nav className="space-y-3">
        {onboardingStages.map((stage) => {
          const isActive = currentStage === stage.id;
          const unlocked = isUnlocked(stage.id as Stage);

          return (
            <button
              key={stage.id}
              disabled={!unlocked}
              onClick={() => onNavigate(stage.id as Stage)}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-lg transition duration-300',
                {
                  'bg-fuchsia-600 text-white font-semibold': isActive,
                  'hover:bg-fuchsia-800 text-fuchsia-200': unlocked && !isActive,
                  'opacity-40 cursor-not-allowed': !unlocked
                }
              )}
            >
              {stage.title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
