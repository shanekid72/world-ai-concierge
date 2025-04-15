
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useChatState } from '../useChatState';

describe('useChatState', () => {
  const mockProps = {
    currentStepId: 'welcome',
    onStageChange: vi.fn(),
  };

  it('initializes with empty input and conversation', () => {
    const { result } = renderHook(() => useChatState(mockProps));
    expect(result.current.inputValue).toBe('');
    expect(result.current.conversation.messages).toHaveLength(1); // Initial welcome message
  });

  it('updates input value', () => {
    const { result } = renderHook(() => useChatState(mockProps));
    act(() => {
      result.current.setInputValue('test message');
    });
    expect(result.current.inputValue).toBe('test message');
  });

  it('handles message sending', async () => {
    const { result } = renderHook(() => useChatState(mockProps));
    act(() => {
      result.current.setInputValue('test message');
    });
    await act(async () => {
      await result.current.handleSendMessage();
    });
    expect(result.current.inputValue).toBe('');
    expect(result.current.conversation.messages.length).toBeGreaterThan(1);
  });

  it('handles conversation reset', () => {
    const { result } = renderHook(() => useChatState(mockProps));
    act(() => {
      result.current.handleReset();
    });
    expect(result.current.conversation.messages).toHaveLength(1); // Back to initial message
  });
});
