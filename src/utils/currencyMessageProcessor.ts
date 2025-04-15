
import { ConversationState } from "./types";
import { fetchCurrencyRate, isCurrencyRateQuery } from "./currencyService";

export const processCurrencyMessage = async (
  message: string,
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean } | null> => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
  // Check if this is a currency rate query
  const currencyCode = isCurrencyRateQuery(message);
  if (!currencyCode) {
    return null; // Not a currency message
  }
  
  try {
    const rate = await fetchCurrencyRate(currencyCode);
    if (rate !== null) {
      const currencyNames: Record<string, string> = {
        'USD': 'US Dollar',
        'EUR': 'Euro', 
        'GBP': 'British Pound',
        'AED': 'UAE Dirham',
        'INR': 'Indian Rupee',
        'AUD': 'Australian Dollar',
        'CAD': 'Canadian Dollar',
        'SGD': 'Singapore Dollar',
        'JPY': 'Japanese Yen',
        'CHF': 'Swiss Franc'
      };
      
      const currencyName = currencyNames[currencyCode] || currencyCode;
      
      return { 
        newState, 
        aiResponse: `The current exchange rate for ${currencyName} (${currencyCode}) is ${rate.toFixed(4)}. Is there anything else you would like to know about our currency services?`,
        isTyping: true
      };
    }
    return { 
      newState, 
      aiResponse: `I apologize, but there was an error fetching the rate information. Please try again later.`,
      isTyping: true
    };
  } catch (error) {
    console.error("Error in currency rate processing:", error);
    return { 
      newState, 
      aiResponse: `I apologize, but there was an error fetching the rate information. Please try again later.`,
      isTyping: true
    };
  }
};
