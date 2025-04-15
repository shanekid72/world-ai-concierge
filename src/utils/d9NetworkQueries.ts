
import { d9NetworkData } from './d9NetworkData';
import { D9_NETWORK_PATTERNS } from './d9NetworkConstants';

export interface CountryServiceInquiry {
  country: string;
  serviceType: string | null;
}

// Check if a message is a country service inquiry
export const isCountryServiceInquiry = (message: string): CountryServiceInquiry | null => {
  message = message.toLowerCase();
  
  let country: string | null = null;
  let serviceType: string | null = null;
  
  // Check for payout inquiry
  let match = message.match(D9_NETWORK_PATTERNS.PAYOUT);
  if (match) {
    country = match[6].trim();
    serviceType = "payout";
    return { country, serviceType };
  }
  
  // Check for payin inquiry
  match = message.match(D9_NETWORK_PATTERNS.PAYIN);
  if (match) {
    country = match[6].trim();
    serviceType = "payin";
    return { country, serviceType };
  }
  
  // Check for general service inquiry
  match = message.match(D9_NETWORK_PATTERNS.SERVICE);
  if (match) {
    country = match[5].trim();
    return { country, serviceType: null };
  }
  
  // Check if the message is just a country name
  match = message.match(D9_NETWORK_PATTERNS.COUNTRY_ONLY);
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

