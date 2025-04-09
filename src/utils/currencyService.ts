
// Fetch currency rates from the API
export const fetchCurrencyRate = async (currencyCode: string): Promise<number | null> => {
  try {
    const response = await fetch(
      "https://lieservices.luluone.com:9443/liveccyrates?payload=%7B%22activityType%22%3A%22rates.get%22%2C%22aglcid%22%3A784278%2C%22instype%22%3A%22LR%22%7D"
    );
    const data = await response.json();
    
    if (data && data.rate) {
      return parseFloat(data.rate);
    }
    return null;
  } catch (error) {
    console.error("Error fetching currency rate:", error);
    return null;
  }
};

// Check if message is asking about currency rates
export const isCurrencyRateQuery = (message: string): string | null => {
  const rateKeywords = ['rate', 'exchange', 'fx', 'currency', 'conversion'];
  const currencyCodes = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF'];
  
  const msgLower = message.toUpperCase();
  
  // Check if the message contains rate-related keywords
  const hasRateKeyword = rateKeywords.some(keyword => 
    msgLower.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasRateKeyword) {
    // Check if any currency code is mentioned
    for (const code of currencyCodes) {
      if (msgLower.includes(code)) {
        return code;
      }
    }
  }
  
  return null;
};
