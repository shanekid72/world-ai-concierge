export interface Step {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

export function getProgressSteps(): Step[] {
  return [
    { id: 'intro', label: 'Welcome', status: 'upcoming' },
    { id: 'collectMinimalInfo', label: 'User Info', status: 'upcoming' },
    { id: 'standardOnboarding', label: 'Onboarding', status: 'upcoming' },
    { id: 'technical-requirements', label: 'Tech Setup', status: 'upcoming' },
    { id: 'go-live', label: 'Go Live', status: 'upcoming' },
  ];
}

export const onboardingStages = getProgressSteps();