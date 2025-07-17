import React, { ReactNode, ErrorInfo } from 'react';
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VStack } from '@/components/ui/stack';
import { logger } from '@/utils/clientLogger';
import { isDevelopment } from '@/config/environment.client';

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error Fallback Component
 *
 * Displays a user-friendly error message when the ErrorBoundary catches an error
 */
const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Box className="min-h-screen flex items-center justify-center p-6">
      <VStack spacing={6} className="max-w-md text-center">
        <Heading size="xl" className="text-red-500">
          Oops! Something went wrong
        </Heading>
        <Text size="lg" className="text-muted-foreground">
          We apologize for the inconvenience. The application encountered an
          unexpected error.
        </Text>
        {isDevelopment && error && (
          <Alert variant="destructive" className="mt-4 rounded-md">
            <AlertDescription>
              <Text size="sm" className="font-mono text-red-600">
                {error.toString()}
              </Text>
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={resetErrorBoundary} size="lg">
          Return to Home
        </Button>
      </VStack>
    </Box>
  );
};

/**
 * Error Boundary Component (Function-based)
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * This function-based implementation supports Fast Refresh, unlike class components.
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logger.error('Uncaught error in React component tree:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack || 'No component stack available',
      timestamp: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    // Navigate to home page on reset
    window.location.href = '/';
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
