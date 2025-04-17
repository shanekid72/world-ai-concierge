type QuoteInfo = {
  amount?: number;
  currency?: string;
  to?: string;
};

export const useQuoteExtraction = () => {
  return (message: string): QuoteInfo => {
    const result: QuoteInfo = {};

    const amountMatch = message.match(/\d+(\.\d{1,2})?/);
    if (amountMatch) result.amount = parseFloat(amountMatch[0]);

    const currencyMatch = message.match(/\b(usd|eur|inr|gbp)\b/i);
    if (currencyMatch) result.currency = currencyMatch[0].toUpperCase();

    const toMatch = message.match(/to\s+(\w+)/i);
    if (toMatch) result.to = toMatch[1];

    return result;
  };
};