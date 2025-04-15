
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionFlow } from '../TransactionFlow';
import { toast } from "@/hooks/use-toast";

// Mock the custom hooks
vi.mock('@/lib/useWorldApiHooks', () => ({
  useCreateQuote: () => ({
    createQuote: vi.fn().mockResolvedValue({ data: { quote_id: 'test-quote-id' } })
  }),
  useCreateTransaction: () => ({
    createTransaction: vi.fn().mockResolvedValue({ data: { transaction_ref_number: 'test-txn-ref' } })
  }),
  useConfirmTransaction: () => ({
    confirmTransaction: vi.fn().mockResolvedValue({ data: { status: 'CONFIRMED' } })
  })
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn()
}));

describe('TransactionFlow', () => {
  const mockProps = {
    amount: 1000,
    destinationCountry: 'PK',
    onQuoteCreated: vi.fn(),
    onTransactionCreated: vi.fn(),
    onError: vi.fn()
  };

  it('should handle successful quote creation', async () => {
    render(<TransactionFlow {...mockProps} />);
    
    await waitFor(() => {
      expect(mockProps.onQuoteCreated).toHaveBeenCalledWith('test-quote-id');
    });
  });

  it('should handle quote creation error', async () => {
    vi.mocked(useCreateQuote).mockImplementationOnce(() => ({
      createQuote: vi.fn().mockRejectedValue(new Error('Quote creation failed'))
    }));

    render(<TransactionFlow {...mockProps} />);
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
      expect(mockProps.onError).toHaveBeenCalled();
    });
  });
});
