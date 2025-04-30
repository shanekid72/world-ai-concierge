
import { ConversationState } from "./types";
import {
  isBusinessPartnerProfileQuery,
  createEmptyBusinessPartnerProfile,
  exportPartnerProfileToCSV
} from "./currencyService";

export const processPartnerProfileMessage = async (
  message: string,
  state: ConversationState
): Promise<{ newState: ConversationState, aiResponse: string, isTyping: boolean } | null> => {
  // Clone state to avoid mutations
  const newState = JSON.parse(JSON.stringify(state)) as ConversationState;
  
  // Check if this is a business partner profile query
  if (!isBusinessPartnerProfileQuery(message)) {
    return null; // Not a partner profile message
  }
  
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
};
