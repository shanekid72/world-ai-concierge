// D9 Network data cache for country-service lookups
export const d9NetworkData = {
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
export const isCountryServiceInquiry = (message: string): { country: string, serviceType: string | null } | null => {
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
export const getCountryServiceResponse = (country: string, serviceType: string | null): string | null => {
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
