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

// Types for D9 Network data
export interface CountryService {
  region: string;
  services: string[];
  currency: string;
}

export interface D9NetworkDataType {
  countries: {
    [key: string]: CountryService;
  };
}
