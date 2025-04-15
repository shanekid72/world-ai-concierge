
import { ConversationState } from "./types";
import { isCountryServiceInquiry, getCountryServiceResponse } from "./d9NetworkService";

export const processD9NetworkMessage = async (
  message: string,
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean } | null> => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
  // Check for country-specific inquiries
  const countryInquiry = isCountryServiceInquiry(message);
  if (countryInquiry) {
    const response = getCountryServiceResponse(countryInquiry.country, countryInquiry.serviceType);
    if (response) {
      return {
        newState,
        aiResponse: response,
        isTyping: true
      };
    }
  }
  
  // General D9 Network capabilities inquiry
  if (message.toLowerCase().includes('payout') || 
      message.toLowerCase().includes('payin') || 
      message.toLowerCase().includes('countries') || 
      message.toLowerCase().includes('services')) {
    return {
      newState,
      aiResponse: `I can provide information about our D9 Network capabilities. We offer various payment services across different regions:\n
1. Payout Services - Available in multiple countries across:
   - Africa (e.g., Kenya, Nigeria, Ghana)
   - Americas (e.g., USA, Canada, Brazil)
   - Asia (e.g., India, Philippines, China)
   - Europe (including SEPA countries)
   - Middle East and GCC regions

2. Payin Services - Available in:
   - GCC Region (UAE, Oman, Bahrain, Kuwait, Qatar)
   - APAC (Malaysia, Hong Kong, Philippines, Singapore)
   - Americas (Canada)
   - Europe (UK)

Would you like specific information about services in a particular country or region?`,
      isTyping: true
    };
  }
  
  return null; // Not a D9 Network message
};
