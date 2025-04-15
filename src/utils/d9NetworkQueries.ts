
import { d9NetworkData } from './d9NetworkData';

export interface CountryServiceInquiry {
  country: string;
  serviceType: string | null;
}

// Check if a message is a country service inquiry
export const isCountryServiceInquiry = (message: string): CountryServiceInquiry | null => {
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
  
  // Check if the message is just a country name
  match = message.match(countryOnlyRegex);
  if (match && Object.keys(d9NetworkData.countries).includes(match[1].trim())) {
    country = match[1].trim();
    return { country, serviceType: null };
  }
  
  // Check for country mentions with service keywords
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
