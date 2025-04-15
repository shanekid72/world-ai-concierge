
import { BusinessPartnerProfile } from './businessPartnerTypes';

// Create empty business partner profile template
export const createEmptyBusinessPartnerProfile = (): BusinessPartnerProfile => {
  return {
    fullName: "",
    shortName: "",
    parentCompany: "",
    registeredAddress: "",
    contactDetails: {
      firstLevel: "",
      secondLevel: "",
      customerCare: ""
    },
    taxRegistrationNo: "",
    licenseNo: "",
    businessCapabilities: {
      wallet: "NA",
      paymentGateways: "NA",
      eKYC: "NA"
    },
    type: "",
    paymentServices: {
      inward: ""
    },
    mode: [],
    onboardingModel: {
      kycOnUs: false,
      kycOnPartner: false
    },
    integrationMode: {
      luluOnboardingEFR: {
        enabled: false,
        web: false,
        sdk: false,
        firstTime: false,
        renewalOnExpiry: false,
        onEveryNewDevice: false
      },
      luluOnboardingProprietary: {
        enabled: false,
        web: false,
        sdk: false,
        firstTime: false,
        renewalOnExpiry: false,
        onEveryNewDevice: false
      }
    }
  };
};

// Check if a message is related to business partner profile
export const isBusinessPartnerProfileQuery = (message: string): boolean => {
  const profileKeywords = [
    'business partner', 'profile', 'onboarding details', 'partner profile',
    'registration', 'kyc', 'partner data', 'business capabilities'
  ];
  
  const msgLower = message.toLowerCase();
  
  return profileKeywords.some(keyword => msgLower.includes(keyword.toLowerCase()));
};

// Export partner profile to CSV format
export const exportPartnerProfileToCSV = (profile: BusinessPartnerProfile): string => {
  const headers = [
    "Field", "Value"
  ];
  
  const rows = [
    ["Full Name", profile.fullName],
    ["Short Name", profile.shortName],
    ["Parent Company", profile.parentCompany],
    ["Registered Address", profile.registeredAddress],
    ["Contact Details - First Level", profile.contactDetails.firstLevel],
    ["Contact Details - Second Level", profile.contactDetails.secondLevel],
    ["Contact Details - Customer Care", profile.contactDetails.customerCare],
    ["Tax Registration No", profile.taxRegistrationNo],
    ["License No", profile.licenseNo],
    ["Business Capabilities - Wallet", profile.businessCapabilities.wallet],
    ["Business Capabilities - Payment Gateways", profile.businessCapabilities.paymentGateways],
    ["Business Capabilities - eKYC", profile.businessCapabilities.eKYC],
    ["Type", profile.type],
    ["Payment Services - Inward", profile.paymentServices.inward],
    ["Mode", profile.mode.join(", ")],
    ["Onboarding Model - KYC On Us", profile.onboardingModel.kycOnUs ? "Yes" : "No"],
    ["Onboarding Model - KYC On Partner", profile.onboardingModel.kycOnPartner ? "Yes" : "No"],
  ];
  
  // Add integration mode details
  const efr = profile.integrationMode.luluOnboardingEFR;
  if (efr.enabled) {
    rows.push(["Integration Mode - Lulu Onboarding over EFR", "Enabled"]);
    rows.push(["   - Web", efr.web ? "Yes" : "No"]);
    rows.push(["   - SDK", efr.sdk ? "Yes" : "No"]);
    rows.push(["   - First Time", efr.firstTime ? "Yes" : "No"]);
    rows.push(["   - Renewal on Expiry", efr.renewalOnExpiry ? "Yes" : "No"]);
    rows.push(["   - On Every New Device", efr.onEveryNewDevice ? "Yes" : "No"]);
  }
  
  const prop = profile.integrationMode.luluOnboardingProprietary;
  if (prop.enabled) {
    rows.push(["Integration Mode - Lulu Onboarding over Proprietary Solution", "Enabled"]);
    rows.push(["   - Web", prop.web ? "Yes" : "No"]);
    rows.push(["   - SDK", prop.sdk ? "Yes" : "No"]);
    rows.push(["   - First Time", prop.firstTime ? "Yes" : "No"]);
    rows.push(["   - Renewal on Expiry", prop.renewalOnExpiry ? "Yes" : "No"]);
    rows.push(["   - On Every New Device", prop.onEveryNewDevice ? "Yes" : "No"]);
  }
  
  // Convert to CSV format
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  
  return csvContent;
};

// Parse CSV content to extract partner profile data
export const parsePartnerProfileFromCSV = (csvContent: string): BusinessPartnerProfile | null => {
  try {
    const profile = createEmptyBusinessPartnerProfile();
    const lines = csvContent.split("\n");
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV parsing (doesn't handle all edge cases)
      const match = line.match(/"([^"]*)","([^"]*)"/);
      
      if (match && match.length >= 3) {
        const [_, field, value] = match;
        
        // Map fields to profile object
        switch (field) {
          case "Full Name": profile.fullName = value; break;
          case "Short Name": profile.shortName = value; break;
          case "Parent Company": profile.parentCompany = value; break;
          case "Registered Address": profile.registeredAddress = value; break;
          case "Contact Details - First Level": profile.contactDetails.firstLevel = value; break;
          case "Contact Details - Second Level": profile.contactDetails.secondLevel = value; break;
          case "Contact Details - Customer Care": profile.contactDetails.customerCare = value; break;
          case "Tax Registration No": profile.taxRegistrationNo = value; break;
          case "License No": profile.licenseNo = value; break;
          case "Type": profile.type = value; break;
          case "Payment Services - Inward": profile.paymentServices.inward = value; break;
          case "Onboarding Model - KYC On Us": profile.onboardingModel.kycOnUs = value === "Yes"; break;
          case "Onboarding Model - KYC On Partner": profile.onboardingModel.kycOnPartner = value === "Yes"; break;
        }
        
        // Handle modes (comma separated)
        if (field === "Mode" && value) {
          profile.mode = value.split(", ").map(m => m.trim());
        }
        
        // Handle integration mode
        if (field === "Integration Mode - Lulu Onboarding over EFR" && value === "Enabled") {
          profile.integrationMode.luluOnboardingEFR.enabled = true;
        } else if (field === "Integration Mode - Lulu Onboarding over Proprietary Solution" && value === "Enabled") {
          profile.integrationMode.luluOnboardingProprietary.enabled = true;
        }
        
        // Handle EFR options
        if (field === "   - Web" && lines[i-1].includes("Lulu Onboarding over EFR")) {
          profile.integrationMode.luluOnboardingEFR.web = value === "Yes";
        } else if (field === "   - SDK" && lines[i-2].includes("Lulu Onboarding over EFR")) {
          profile.integrationMode.luluOnboardingEFR.sdk = value === "Yes";
        }
        
        // Handle Proprietary options
        if (field === "   - Web" && lines[i-1].includes("Lulu Onboarding over Proprietary")) {
          profile.integrationMode.luluOnboardingProprietary.web = value === "Yes";
        } else if (field === "   - SDK" && lines[i-2].includes("Lulu Onboarding over Proprietary")) {
          profile.integrationMode.luluOnboardingProprietary.sdk = value === "Yes";
        }
      }
    }
    
    return profile;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return null;
  }
};
