
import { useCallback } from 'react';

// Type definition for the extracted quote fields
interface ExtractedQuoteFields {
  amount: number;
  currency: string;
  to: string;
}

export const useQuoteExtraction = () => {
  const extractQuoteFields = useCallback(async (message: string): Promise<ExtractedQuoteFields | null> => {
    try {
      // Simple extraction logic - in a real app, this might use AI/NLP
      const amountMatch = message.match(/(\d+(\.\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
      
      const currencyMatch = message.match(/usd|eur|inr|aed|gbp|pkr/i);
      const currency = currencyMatch ? currencyMatch[0].toUpperCase() : 'AED';
      
      // Extract country codes or names
      const countryMatch = message.match(/india|pakistan|uk|usa|united states|united kingdom|uae|philippines/i);
      
      // Map country names to country codes
      let countryCode = 'IN'; // Default
      if (countryMatch) {
        const country = countryMatch[0].toLowerCase();
        if (country.includes('pakistan')) countryCode = 'PK';
        else if (country.includes('uk') || country.includes('united kingdom')) countryCode = 'GB';
        else if (country.includes('usa') || country.includes('united states')) countryCode = 'US';
        else if (country.includes('uae')) countryCode = 'AE';
        else if (country.includes('philippines')) countryCode = 'PH';
        else if (country.includes('india')) countryCode = 'IN';
      }
      
      if (amount <= 0) {
        return null;
      }
      
      return {
        amount,
        currency,
        to: countryCode
      };
    } catch (error) {
      console.error('Error extracting quote fields:', error);
      return null;
    }
  }, []);

  return extractQuoteFields;
};
