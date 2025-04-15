
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollIntoView since it's not available in jsdom
Element.prototype.scrollIntoView = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Add any other global mocks or setup needed for tests
