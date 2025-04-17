import React from 'react';
import { Step } from './ProgressTracker';

// Define onboarding stages and related questions
export interface OnboardingStage {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  responseTemplate?: string;
  followUp?: string[];
}

export const onboardingStages: OnboardingStage[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Introduction to World API',
    questions: [
      {
        id: 'welcome-1',
        text: "Hello! I'm your World API integration assistant. I'll help you connect your financial institution to our global payment networks. What type of organization are you connecting today?",
        followUp: [
          "Great! Could you tell me a bit more about your organization and the specific payment services you're looking to integrate?"
        ]
      }
    ]
  },
  {
    id: 'business-requirements',
    title: 'Business Requirements',
    description: 'Understanding your business needs',
    questions: [
      {
        id: 'business-1',
        text: "Let's discuss your business requirements. What are the primary payment flows you need to support? (e.g., cross-border payments, domestic transfers, bill payments)",
      },
      {
        id: 'business-2',
        text: "Which regions or countries do you need to serve?",
      },
      {
        id: 'business-3',
        text: "What's your expected transaction volume and average transaction size?",
      }
    ]
  },
  {
    id: 'compliance-kyc',
    title: 'Compliance & KYC',
    description: 'Gathering compliance information',
    questions: [
      {
        id: 'compliance-1',
        text: "What's your organization's legal name and registration number?",
      },
      {
        id: 'compliance-2',
        text: "In which countries are you licensed to operate financial services?",
      },
      {
        id: 'compliance-3',
        text: "Do you have an existing AML policy?",
      },
      {
        id: 'compliance-4',
        text: "Who's the primary compliance contact at your organization?",
      }
    ]
  },
  {
    id: 'technical-requirements',
    title: 'Technical Requirements',
    description: 'Understanding your technical setup',
    questions: [
      {
        id: 'technical-1',
        text: "Do you have a preference for how you'd like to integrate? (REST API, webhooks, SFTP, etc.)",
      },
      {
        id: 'technical-2',
        text: "Will you need real-time transaction updates or is batch processing sufficient?",
      },
      {
        id: 'technical-3',
        text: "Are there any specific security requirements we should be aware of?",
      }
    ]
  },
  {
    id: 'api-configuration',
    title: 'API Configuration',
    description: 'Setting up your API access',
    questions: [
      {
        id: 'api-1',
        text: "Based on what you've shared, I recommend the following API endpoints for your integration. Does this look right?",
        responseTemplate: "Here are the recommended endpoints for your integration:\n\n- Cross-Border Payments API\n- FX Rates API\n- Payment Status Webhook\n\nThese will support your core requirements for international payments with real-time status updates."
      },
      {
        id: 'api-2',
        text: "Would you like me to generate sandbox credentials now so you can start testing?",
      }
    ]
  },
  {
    id: 'testing',
    title: 'Testing & Sandbox',
    description: 'Testing your integration',
    questions: [
      {
        id: 'testing-1',
        text: "I've set up your sandbox environment. Here are your credentials and test endpoints:",
        responseTemplate: "🔐 API Key: wapi_sand_aD8gK2bZx7PcLnF9\n\n🌐 Base URL: https://sandbox-api.worldapi.dev/v1\n\nYou can use these test cards for simulating different scenarios:\n- 4111 1111 1111 1111 (Success)\n- 4242 4242 4242 4242 (Requires verification)\n- 4000 0000 0000 0002 (Declined)"
      },
      {
        id: 'testing-2',
        text: "Would you like me to walk you through a sample API request?",
      }
    ]
  },
  {
    id: 'go-live',
    title: 'Go Live',
    description: 'Moving to production',
    questions: [
      {
        id: 'go-live-1',
        text: "Now that you've tested successfully, let's prepare for going live. When would you like to schedule the production deployment?",
      },
      {
        id: 'go-live-2',
        text: "Who should receive the production API credentials?",
      }
    ]
  }
];

// Convert onboarding stages to progress tracker steps
export const getProgressSteps = (): Step[] => {
  return onboardingStages.map(stage => ({
    id: stage.id,
    title: stage.title,
    status: 'upcoming'
  }));
};

// Get initial question to start conversation
export const getInitialQuestion = (): string => {
  return onboardingStages[0].questions[0].text;
};

export default onboardingStages;
