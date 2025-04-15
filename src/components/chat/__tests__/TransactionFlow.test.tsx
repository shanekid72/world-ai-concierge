
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionFlow } from '../TransactionFlow';
import { toast } from "@/hooks/use-toast";

// Mock the custom hooks
vi.mock('@/lib/useWorldApiHooks', () => ({
  useCreateQuote: vi.fn().mockReturnValue({
    createQuote: vi.fn().mockResolvedValue({ data: { quote_id: 'test-quote-id' } }),
    data: null,
    loading: false,
    error: null
  }),
  useCreateTransaction: vi.fn().mockReturnValue({
    createTransaction: vi.fn().mockResolvedValue({ data: { transaction_ref_number: 'test-txn-ref' } })
  }),
  useConfirmTransaction: vi.fn().mockReturnValue({
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
    // Mock implementation for error case
    const mockCreateQuote = vi.fn().mockRejectedValue(new Error('Quote creation failed'));
    
    vi.mocked(useCreateQuote).mockImplementationOnce(() => ({
      createQuote: mockCreateQuote,
      data: null,
      loading: false,
      error: null
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

// Import the mocked function to fix the type error
import { useCreateQuote } from '@/lib/useWorldApiHooks';
