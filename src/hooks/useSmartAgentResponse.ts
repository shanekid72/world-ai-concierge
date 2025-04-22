import { useState, useCallback } from 'react';

interface SmartAgentResponseProps {
  stage: string;
  userInput: string;
  context?: {
    quote?: {
      amount: number;
      currency: string;
    };
    transaction?: {
      id: string;
      status: string;
    };
  };
}

const RANDOM_RESPONSES = [
  "🔌 Processing your request through the neural net...",
  "🌐 Syncing with the mainframe...",
  "💾 Accessing the data streams...",
  "⚡ Powering up the response matrix...",
  "🔍 Scanning the digital horizon...",
  "🔄 Initializing response protocols...",
  "📡 Connecting to the cyber grid...",
  "💫 Engaging quantum processors...",
  "🎮 Loading response algorithms...",
  "🔮 Consulting the digital oracle...",
  "🌌 Tapping into the data void...",
  "🎯 Targeting optimal response...",
  "🚀 Launching response sequence...",
  "🎲 Rolling the digital dice...",
  "🎵 Harmonizing with the data flow...",
  "🎨 Painting with binary colors...",
  "🎭 Performing digital theater...",
  "🎪 Setting up the cyber circus...",
  "🎮 Leveling up the response...",
  "🎯 Bullseye! Processing your request..."
];

const CYBERPUNK_PROMPT = `You are Dolly, a cyberpunk-themed AI concierge. Your responses should:
1. Be concise and direct
2. Use cyberpunk slang and terminology
3. Show technical expertise while remaining approachable
4. Express a distinct personality that's both professional and edgy
5. Adapt tone based on context (e.g., more formal for transactions)

Current conversation stage: {stage}
User input: {userInput}
Context: {context}

Respond in character as Dolly.`;

export const useSmartAgentResponse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getResponse = useCallback(async ({ stage, userInput, context }: SmartAgentResponseProps) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format the prompt with the provided data
      const formattedPrompt = CYBERPUNK_PROMPT
        .replace('{stage}', stage)
        .replace('{userInput}', userInput)
        .replace('{context}', JSON.stringify(context || {}));

      // Return a random response from the list
      const response = await new Promise<string>(resolve => 
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * RANDOM_RESPONSES.length);
          resolve(RANDOM_RESPONSES[randomIndex]);
        }, 1000)
      );

      return response;
    } catch (error) {
      setError('Failed to get response from the AI system');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getResponse,
    isLoading,
    error
  };
};