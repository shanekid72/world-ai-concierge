
// Fetch currency rates from the API
export const fetchCurrencyRate = async (currencyCode: string): Promise<number | null> => {
  try {
    const response = await fetch(
      "https://lieservices.luluone.com:9443/liveccyrates?payload=%7B%22activityType%22%3A%22rates.get%22%2C%22aglcid%22%3A784278%2C%22instype%22%3A%22LR%22%7D"
    );
    
    const data = await response.json();
    
    if (data && data.payload && data.payload.rates) {
      const currencyData = data.payload.rates.find(
        (rate: any) => rate.toccy === currencyCode
      );
      
      if (currencyData && currencyData.rate) {
        return parseFloat(currencyData.rate);
      }
    }
    
    console.log("Currency data response:", data);
    return null;
  } catch (error) {
    console.error("Error fetching currency rate:", error);
    return null;
  }
};

// Check if message is asking about currency rates
export const isCurrencyRateQuery = (message: string): string | null => {
  // Check for currency pair patterns first (e.g., "USD to INR", "AED to INR")
  const currencyPairRegex = /([A-Z]{3})\s+to\s+([A-Z]{3})|([A-Z]{3})\s*\/\s*([A-Z]{3})/i;
  const match = message.toUpperCase().match(currencyPairRegex);
  
  if (match) {
    // Return the target currency (second in the pair)
    return match[2] || match[4];
  }
  
  // Handle single currency code queries if no pair is found
  const rateKeywords = ['rate', 'exchange', 'fx', 'currency', 'conversion'];
  const currencyCodes = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF'];
  
  const msgUpper = message.toUpperCase();
  
  // Check if the message contains rate-related keywords
  const hasRateKeyword = rateKeywords.some(keyword => 
    msgUpper.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasRateKeyword || msgUpper.includes('RATE')) {
    // Check if any currency code is mentioned
    for (const code of currencyCodes) {
      if (msgUpper.includes(code)) {
        return code;
      }
    }
    
    // If "INR" specifically mentioned in the query but not caught above
    if (msgUpper.includes('INR') || 
        msgUpper.includes('INDIAN') || 
        msgUpper.includes('RUPEE')) {
      return 'INR';
    }
  }
  
  return null;
};
