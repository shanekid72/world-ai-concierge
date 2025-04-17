export const useSmartAgentResponse = () => {
  return async ({ stage, userInput, context }: any): Promise<string> => {
    return `🤖 (Smart Reply) You said: "${userInput}" at stage: "${stage}"`;
  };
};