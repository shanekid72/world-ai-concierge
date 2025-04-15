
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageInput from '../MessageInput';

describe('MessageInput', () => {
  const mockProps = {
    inputValue: '',
    isAgentTyping: false,
    onInputChange: vi.fn(),
    onSendMessage: vi.fn(),
    onKeyDown: vi.fn(),
  };

  it('renders correctly', () => {
    render(<MessageInput {...mockProps} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('calls onInputChange when typing', () => {
    render(<MessageInput {...mockProps} />);
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'test message' } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith('test message');
  });

  it('disables input when agent is typing', () => {
    render(<MessageInput {...mockProps} isAgentTyping={true} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeDisabled();
  });

  it('calls onSendMessage when send button is clicked', () => {
    render(<MessageInput {...mockProps} inputValue="test message" />);
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    expect(mockProps.onSendMessage).toHaveBeenCalled();
  });
});
