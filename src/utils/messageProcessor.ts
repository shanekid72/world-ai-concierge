
import { OnboardingStage, onboardingStages } from "../components/OnboardingStages";
import { ConversationState } from "./types";
import { 
  fetchCurrencyRate, 
  isCurrencyRateQuery, 
  isBusinessPartnerProfileQuery,
  createEmptyBusinessPartnerProfile,
  exportPartnerProfileToCSV
} from "./currencyService";
import { getFollowUpResponse } from "./conversationUtils";

// D9 Network data cache for country-service lookups
const d9NetworkData = {
  countries: {
    // Africa
    "uganda": { 
      region: "Africa", 
      services: ["Bank Credit", "Cash Payout", "Wallet"],
      currency: "UGX"
    },
    "kenya": { 
      region: "Africa", 
      services: ["Bank Credit", "Wallet", "Cash Payout"],
      currency: "KES"
    },
    "nigeria": { 
      region: "Africa", 
      services: ["Bank Credit"],
      currency: "NGN"
    },
    "ghana": { 
      region: "Africa", 
      services: ["Bank Credit", "Wallet", "Cash Payout"],
      currency: "GHS"
    },
    "egypt": { 
      region: "Africa", 
      services: ["Bank Credit", "Wallet"],
      currency: "EGP"
    },
    "south africa": { 
      region: "Africa", 
      services: ["Bank Credit"],
      currency: "ZAR"
    },
    "tanzania": { 
      region: "Africa", 
      services: ["Bank Credit", "Wallet", "Cash Payout"],
      currency: "TZS"
    },
    // Americas
    "usa": { 
      region: "Americas", 
      services: ["Bank Credit"],
      currency: "USD"
    },
    "canada": { 
      region: "Americas", 
      services: ["Bank Credit"],
      currency: "CAD"
    },
    "brazil": { 
      region: "Americas", 
      services: ["Bank Credit"],
      currency: "BRL"
    },
    "mexico": { 
      region: "Americas", 
      services: ["Bank Credit"],
      currency: "MXN"
    },
    // Asia
    "india": { 
      region: "Asia", 
      services: ["Bank Credit"],
      currency: "INR"
    },
    "philippines": { 
      region: "Asia", 
      services: ["Bank Credit", "Wallet"],
      currency: "PHP"
    },
    "china": { 
      region: "Asia", 
      services: ["Bank Credit"],
      currency: "CNY"
    },
    "bangladesh": { 
      region: "Asia", 
      services: ["Bank Credit", "Wallet"],
      currency: "BDT"
    },
    // Middle East & GCC
    "uae": { 
      region: "GCC", 
      services: ["Cash Payout (Lulu and Trust Branches)", "Bank Credit"],
      currency: "AED"
    },
    "oman": { 
      region: "GCC", 
      services: ["Cash Payout", "Bank Credit"],
      currency: "OMR"
    },
    "qatar": { 
      region: "GCC", 
      services: ["Bank Credit", "Cash Payout (Lulu and Trust Branches)"],
      currency: "QAR"
    },
    "bahrain": { 
      region: "GCC", 
      services: ["Cash Payout (Lulu Branches)"],
      currency: "BHD"
    },
    "kuwait": { 
      region: "GCC", 
      services: ["Cash Payout (Lulu Branches)"],
      currency: "KWD"
    },
    // Europe
    "uk": { 
      region: "Europe", 
      services: ["Bank Credit"],
      currency: "GBP"
    }
  }
};

// Check if a message is a country service inquiry
const isCountryServiceInquiry = (message: string): { country: string, serviceType: string | null } | null => {
  message = message.toLowerCase();
  
  // Common questions patterns
  const payoutRegex = /(do you (have|support|offer)|is there|can i) (payout|payment|remittance|transfer|send money)( service| option|)? (to|in|for) ([a-z\s]+)(\?)?/i;
  const payinRegex = /(do you (have|support|offer)|is there|can i) (payin|collection|receive)( service| option|)? (from|in|for) ([a-z\s]+)(\?)?/i;
  const serviceRegex = /(what|which) (service|option)s? (?:do you|are|is) (have|available|supported|offered) (in|for) ([a-z\s]+)(\?)?/i;
  const countryOnlyRegex = /^([a-z\s]+)$/i;
  
  let country: string | null = null;
  let serviceType: string | null = null;
  
  // Check for payout inquiry
  let match = message.match(payoutRegex);
  if (match) {
    country = match[6].trim();
    serviceType = "payout";
    return { country, serviceType };
  }
  
  // Check for payin inquiry
  match = message.match(payinRegex);
  if (match) {
    country = match[6].trim();
    serviceType = "payin";
    return { country, serviceType };
  }
  
  // Check for general service inquiry
  match = message.match(serviceRegex);
  if (match) {
    country = match[5].trim();
    return { country, serviceType: null };
  }
  
  // Check if the message is just a country name (follow-up to a previous question)
  match = message.match(countryOnlyRegex);
  if (match && Object.keys(d9NetworkData.countries).includes(match[1].trim())) {
    country = match[1].trim();
    return { country, serviceType: null };
  }
  
  // If user mentions a country with payout/payin keywords but doesn't fit the patterns above
  for (const c of Object.keys(d9NetworkData.countries)) {
    if (message.includes(c)) {
      country = c;
      if (message.includes("payout") || message.includes("send") || message.includes("transfer")) {
        serviceType = "payout";
      } else if (message.includes("payin") || message.includes("receive") || message.includes("collect")) {
        serviceType = "payin";
      }
      return { country, serviceType };
    }
  }
  
  return null;
};

// Get a response for a country service inquiry
const getCountryServiceResponse = (country: string, serviceType: string | null): string | null => {
  const countryData = d9NetworkData.countries[country.toLowerCase()];
  if (!countryData) {
    return `I currently don't have specific information about services in ${country}. Would you like me to provide details about other countries where our services are available?`;
  }
  
  if (serviceType === "payout") {
    const services = countryData.services.join(", ");
    return `Yes, we do offer payout services to ${country} in ${countryData.currency}. Available service types include: ${services}. Would you like more information about any specific service type?`;
  } else if (serviceType === "payin") {
    if (countryData.region === "GCC" || country === "uk" || country === "canada" || 
        country === "malaysia" || country === "singapore" || country === "philippines") {
      return `Yes, we support payin (fund collection) services from ${country} in ${countryData.currency}. This allows you to collect funds from customers in this region. Would you like more details about this service?`;
    } else {
      return `Currently, we don't offer payin services from ${country}. Our payin services are available in GCC regions, UK, Canada, and select APAC countries. Would you like information about countries where payin is supported?`;
    }
  } else {
    // General service inquiry or just a country name mentioned
    const services = countryData.services.join(", ");
    const payinSupport = (countryData.region === "GCC" || country === "uk" || country === "canada" || 
                          country === "malaysia" || country === "singapore" || country === "philippines") 
                          ? "We also support payin (fund collection) from this country." 
                          : "Payin services are not currently available from this country.";
    
    return `For ${country} (${countryData.region}), we offer the following services in ${countryData.currency}: ${services}. ${payinSupport} Would you like more specific information?`;
  }
};

// Process user message and determine AI response
export const processUserMessage = async (
  message: string, 
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean }> => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
  // Check if this is a currency rate query
  const currencyCode = isCurrencyRateQuery(message);
  if (currencyCode) {
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
      } else {
        return { 
          newState, 
          aiResponse: `I'm sorry, I couldn't retrieve the current rate for ${currencyCode} at the moment. Please try again later or contact our support team for assistance.`,
          isTyping: true
        };
      }
    } catch (error) {
      console.error("Error in currency rate processing:", error);
      return { 
        newState, 
        aiResponse: `I apologize, but there was an error fetching the rate information. Please try again later.`,
        isTyping: true
      };
    }
  }
  
  // Check if this is a business partner profile query
  if (isBusinessPartnerProfileQuery(message)) {
    if (message.toLowerCase().includes('export') || message.toLowerCase().includes('csv')) {
      // Create a sample profile if we don't have one
      const sampleProfile = createEmptyBusinessPartnerProfile();
      sampleProfile.fullName = "Sample Partner Ltd.";
      sampleProfile.shortName = "SPL";
      sampleProfile.taxRegistrationNo = "TX123456789";
      
      const csvData = exportPartnerProfileToCSV(sampleProfile);
      
      return {
        newState,
        aiResponse: `Here's a sample CSV export of a Business Partner Profile that you can download and fill in:\n\n\`\`\`csv\n${csvData}\n\`\`\`\n\nYou can edit this CSV file with your partner details and upload it back to import the data.`,
        isTyping: true
      };
    }
    
    return {
      newState,
      aiResponse: `I can help you with Business Partner Profile management. Here are the onboarding details we need to collect:\n
1. Basic Information:
   - Full Name
   - Short Name
   - Parent Company
   - Registered Address

2. Contact Details:
   - First Level
   - Second Level
   - Customer Care

3. Compliance Information:
   - Tax Registration No.
   - License No.

4. Business Capabilities:
   - Wallet (Open loop)
   - Payment Gateways
   - eKYC

5. Integration Details:
   - Type (White Labeled)
   - Payment Services (Inward for Local Fulfillment)
   - Mode (Direct API, Via DLTs, Embedded Remittances)
   - Onboarding Model (KYC On-Us or KYC On-Partner)
   - Integration Mode options

Would you like to start filling in these details, or would you prefer to export a template CSV file that you can fill in?`,
      isTyping: true
    };
  }
  
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
  
  // Generic message processing based on conversation stage
  const currentStage = onboardingStages.find(s => s.id === state.currentStageId);
  if (!currentStage) {
    return { 
      newState, 
      aiResponse: "I'm sorry, something went wrong with tracking your progress. Let's start over.",
      isTyping: true
    };
  }
  
  // Store user's answer for the current question
  if (currentStage.questions[state.currentQuestionIndex]) {
    const questionId = currentStage.questions[state.currentQuestionIndex].id;
    newState.answers[questionId] = message;
  }
  
  // Determine if we should move to next question or next stage
  if (state.currentQuestionIndex < currentStage.questions.length - 1) {
    // Move to next question in current stage
    newState.currentQuestionIndex++;
    const nextQuestion = currentStage.questions[newState.currentQuestionIndex];
    
    // If this question has a template response, use it, otherwise use the question text
    const response = nextQuestion.responseTemplate || nextQuestion.text;
    return { newState, aiResponse: response, isTyping: true };
  } else {
    // Current stage completed, move to next stage
    newState.completedStages.push(currentStage.id);
    
    // Find index of current stage
    const currentStageIndex = onboardingStages.findIndex(s => s.id === currentStage.id);
    
    if (currentStageIndex < onboardingStages.length - 1) {
      // Move to first question of next stage
      const nextStage = onboardingStages[currentStageIndex + 1];
      newState.currentStageId = nextStage.id;
      newState.currentQuestionIndex = 0;
      
      const introText = `Great! Let's move on to the ${nextStage.title} phase. ${nextStage.description}.`;
      const questionText = nextStage.questions[0].text;
      
      return { 
        newState, 
        aiResponse: `${introText}\n\n${questionText}`,
        isTyping: true
      };
    } else {
      // All stages completed
      return { 
        newState, 
        aiResponse: "Congratulations! You've completed all the steps for your World API integration. Your account is now ready to use. Is there anything specific you'd like me to help with next?",
        isTyping: true
      };
    }
  }
};

// Generate a smart AI response based on conversation context
export const generateSmartResponse = async (
  userMessage: string,
  state: ConversationState
): Promise<string> => {
  // Check for follow-up response based on keywords
  const followUp = getFollowUpResponse(userMessage);
  if (followUp) return followUp;
  
  // Otherwise process based on conversation state
  const result = await processUserMessage(userMessage, state);
  return result.aiResponse;
};
