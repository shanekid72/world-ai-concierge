import { useCallback } from 'react';

interface SmartAgentOptions {
  stage: string;
  userInput: string;
  context: Record<string, any>;
}

// This function should be linked to a Lovable model block named `getModelResponse`
// which takes { stage, userInput, context } and returns { reply }
declare function getModelResponse(options: SmartAgentOptions): Promise<{ reply: string }>;

export const useSmartAgentResponse = () => {
  const getSmartReply = useCallback(async ({ stage, userInput, context }: SmartAgentOptions): Promise<string> => {
    const neonPrompt = `You are Dolly — a futuristic, cyberpunk-themed, quirky AI assistant for WorldAPI, a global money transfer platform.
You're neon-bright, a little sassy, very clever, and help users get their money moving across borders.
Always respond with energy, a bit of humor, maybe a neon emoji 💫 — never boring.

Current Stage: ${stage}
Context: ${JSON.stringify(context)}
User: ${userInput}`;

    try {
      const res = await getModelResponse({
        stage,
        userInput: neonPrompt,
        context
      });
      return res.reply || "Huh, that short-circuited my brain 🤖. Try that again?";
    } catch (err) {
      console.error('[LOVABLE MODEL ERROR]', err);
      return "My neon brain just glitched ⚡. Mind saying that again?";
    }
  }, []);

  return getSmartReply;
};
