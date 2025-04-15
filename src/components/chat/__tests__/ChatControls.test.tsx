
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatControls from '../ChatControls';

describe('ChatControls', () => {
  const mockOnReset = vi.fn();

  it('renders reset button', () => {
    render(<ChatControls onReset={mockOnReset} />);
    expect(screen.getByTitle('Reset conversation')).toBeInTheDocument();
  });

  it('calls onReset when clicked', () => {
    render(<ChatControls onReset={mockOnReset} />);
    fireEvent.click(screen.getByTitle('Reset conversation'));
    expect(mockOnReset).toHaveBeenCalled();
  });
});
