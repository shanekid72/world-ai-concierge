
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MessageList from '../MessageList';

describe('MessageList', () => {
  const mockMessages = [
    { id: '1', content: 'Hello', isUser: true, timestamp: new Date() },
    { id: '2', content: 'Hi there!', isUser: false, timestamp: new Date() }
  ];

  it('renders messages correctly', () => {
    render(<MessageList messages={mockMessages} isAgentTyping={false} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows typing indicator when agent is typing', () => {
    render(<MessageList messages={mockMessages} isAgentTyping={true} />);
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('renders empty state when no messages', () => {
    render(<MessageList messages={[]} isAgentTyping={false} />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
