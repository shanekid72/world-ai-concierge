
import { ConversationState } from "./types";
import { fetchCurrencyRate, isCurrencyRateQuery } from "./currencyRateService";

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
  
  console.log(`Processing currency query for: ${currencyCode}`);
  
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
      
      // Determine source currency from the message
      const sourceCurrency = determineSourceCurrency(message);
      
      if (sourceCurrency && sourceCurrency !== currencyCode) {
        return { 
          newState, 
          aiResponse: `The current exchange rate from ${sourceCurrency} to ${currencyName} (${currencyCode}) is ${rate.toFixed(4)}. Is there anything else you would like to know about our currency services? 💱`,
          isTyping: true
        };
      }
      
      return { 
        newState, 
        aiResponse: `The current exchange rate for ${currencyName} (${currencyCode}) is ${rate.toFixed(4)}. Is there anything else you would like to know about our currency services? 💱`,
        isTyping: true
      };
    }
    return { 
      newState, 
      aiResponse: `I apologize, but there was an error fetching the rate information for ${currencyCode}. Please try again later or try a different currency. 😕`,
      isTyping: true
    };
  } catch (error) {
    console.error("Error in currency rate processing:", error);
    return { 
      newState, 
      aiResponse: `I apologize, but there was an error fetching the rate information. Please try again later. 😕`,
      isTyping: true
    };
  }
};

// Helper function to determine source currency from message
function determineSourceCurrency(message: string): string | null {
  const currencyPairRegex = /([A-Z]{3})\s+to\s+([A-Z]{3})|([A-Z]{3})\s*\/\s*([A-Z]{3})/i;
  const match = message.toUpperCase().match(currencyPairRegex);
  
  if (match) {
    return match[1] || match[3];
  }
  
  // Check for common currency codes
  const commonCodes = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'AUD', 'CAD'];
  for (const code of commonCodes) {
    if (message.toUpperCase().includes(code)) {
      return code;
    }
  }
  
  return null;
}
