
import { toast } from "@/hooks/use-toast";
import { Stage } from '../useWorldApiChat';

export const handleQuoteCreation = async (
  to: string,
  amount: number,
  handleCreateQuote: (payload: any) => Promise<any>,
  setQuoteContext: (value: any) => void
) => {
  try {
    const payload = {
      sending_country_code: 'AE',
      sending_currency_code: 'AED',
      receiving_country_code: to,
      receiving_currency_code: to === 'PK' ? 'PKR' : 'INR',
      sending_amount: amount,
      receiving_mode: 'BANK',
      type: 'SEND',
      instrument: 'REMITTANCE'
    };
    
    const quoteResult = await handleCreateQuote(payload);
    const quoteId = quoteResult?.data?.quote_id;
    setQuoteContext(prev => ({ ...prev, to, quoteId }));
    
    return {
      responseText: `📄 Here's your quote: Send ${amount} AED to ${to} → ` +
        `receive ${quoteResult?.data?.receiving_amount} ${quoteResult?.data?.receiving_currency_code}. ` +
        `💱 Rate: ${quoteResult?.data?.fx_rates?.[0]?.rate}\n\n` +
        "✅ Would you like to proceed with this transaction? (yes/no)",
      nextStage: 'confirm' as Stage
    };
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to create quote. Please try again.",
      variant: "destructive",
    });
    
    return {
      responseText: "I'm having trouble creating that quote. Let's try something else. What would you like to do with worldAPI?",
      nextStage: 'init' as Stage
    };
  }
};
