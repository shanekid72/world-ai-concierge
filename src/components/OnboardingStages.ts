export interface Question {
  id: string;
  text: string;
  responseTemplate?: string;
}

export interface Step {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  title?: string;
  description?: string;
  questions?: Question[];
}

// Add the missing OnboardingStage type that's being imported elsewhere
export type OnboardingStage = Step;

export function getProgressSteps(): Step[] {
  return [
    { id: 'intro', label: 'Welcome', status: 'upcoming', title: 'Welcome', description: 'Welcome to onboarding', questions: [{ id: 'q1', text: 'What is your name?', responseTemplate: 'My name is {answer}.' }] },
    { id: 'collectMinimalInfo', label: 'User Info', status: 'upcoming', title: 'User Info', description: 'Collecting minimal information', questions: [{ id: 'q2', text: 'What is your email?', responseTemplate: 'My email is {answer}.' }] },
    { id: 'standardOnboarding', label: 'Onboarding', status: 'upcoming', title: 'Onboarding', description: 'Standard onboarding process', questions: [{ id: 'q3', text: 'What is your company?', responseTemplate: 'My company is {answer}.' }] },
    { id: 'technical-requirements', label: 'Tech Setup', status: 'upcoming', title: 'Technical Requirements', description: 'Setting up technical requirements', questions: [{ id: 'q4', text: 'Do you have API access?', responseTemplate: 'API access: {answer}.' }] },
    { id: 'go-live', label: 'Go Live', status: 'upcoming', title: 'Go Live', description: 'Ready to go live', questions: [{ id: 'q5', text: 'Are you ready to go live?', responseTemplate: 'Ready: {answer}.' }] },
  ];
}

export const onboardingStages = getProgressSteps();