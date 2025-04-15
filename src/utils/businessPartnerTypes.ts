
// Business Partner Profile data structure
export interface BusinessPartnerProfile {
  fullName: string;
  shortName: string;
  parentCompany: string;
  registeredAddress: string;
  contactDetails: {
    firstLevel: string;
    secondLevel: string;
    customerCare: string;
  };
  taxRegistrationNo: string;
  licenseNo: string;
  businessCapabilities: {
    wallet: string;
    paymentGateways: string;
    eKYC: string;
  };
  type: string;
  paymentServices: {
    inward: string;
  };
  mode: string[];
  onboardingModel: {
    kycOnUs: boolean;
    kycOnPartner: boolean;
  };
  integrationMode: {
    luluOnboardingEFR: {
      enabled: boolean;
      web: boolean;
      sdk: boolean;
      firstTime: boolean;
      renewalOnExpiry: boolean;
      onEveryNewDevice: boolean;
    };
    luluOnboardingProprietary: {
      enabled: boolean;
      web: boolean;
      sdk: boolean;
      firstTime: boolean;
      renewalOnExpiry: boolean;
      onEveryNewDevice: boolean;
    };
  };
}
