/**
 * Unit tests for ErrorBoundary component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock the logger
jest.mock('@/lib/monitoring/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="success">Success</div>;
};

// Wrapper component with ChakraProvider
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('success')).toBeInTheDocument();
  });

  it('renders error UI when child component throws an error', () => {
    renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows custom fallback component when provided', () => {
    const CustomFallback: React.FC = () => (
      <div data-testid="custom-fallback">Custom error message</div>
    );

    renderWithChakra(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    retryButton.click();

    // Re-render with no error
    rerender(
      <ChakraProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </ChakraProvider>
    );

    // Success content should be visible again
    expect(screen.getByTestId('success')).toBeInTheDocument();
  });

  it('renders error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details:')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('does not render error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details:')).not.toBeInTheDocument();
    expect(screen.queryByText('Test error')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('logs error to monitoring service', () => {
    const { logger } = require('@/lib/monitoring/logger');

    renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'Error caught by boundary',
      expect.objectContaining({
        error: expect.any(Error),
        errorInfo: expect.any(Object),
      })
    );
  });

  it('handles error info with component stack', () => {
    const { logger } = require('@/lib/monitoring/logger');

    renderWithChakra(
      <ErrorBoundary>
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'Error caught by boundary',
      expect.objectContaining({
        error: expect.any(Error),
        errorInfo: expect.objectContaining({
          componentStack: expect.any(String),
        }),
      })
    );
  });
});