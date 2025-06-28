import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, Stack, Alert } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { environment } from '@/config/environment';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error in React component tree:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          <VStack spacing={6} maxW="md" textAlign="center">
            <Heading size="xl" color="red.500">
              Oops! Something went wrong
            </Heading>
            <Text fontSize="lg" color="gray.600">
              We apologize for the inconvenience. The application encountered an
              unexpected error.
            </Text>
            {environment.isDevelopment && this.state.error && (
              <Alert
                status="error"
                variant="left-accent"
                mt={4}
                borderRadius="md"
              >
                <Text fontSize="sm" color="red.600" fontFamily="mono">
                  {this.state.error.toString()}
                </Text>
              </Alert>
            )}
            <Button colorScheme="blue" onClick={this.handleReset} size="lg">
              Return to Home
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
