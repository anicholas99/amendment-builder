import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Code,
  Heading,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { apiFetch } from '@/lib/api/apiClient';
import { environment } from '@/config/environment';

export default function TestRateLimit() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in development
  if (!environment.isDevelopment) {
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          This page is only available in development mode.
        </Alert>
      </Box>
    );
  }

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testRateLimit = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // Make 10 requests rapidly (limit is 5)
      addResult('Starting rapid requests...');

      const promises = Array.from({ length: 10 }, async (_, i) => {
        try {
          addResult(`Request ${i + 1} started`);
          const response = await apiFetch('/api/test/rate-limit?limit=5');
          const data = await response.json();
          addResult(
            `Request ${i + 1} succeeded: ${data.message} (${data.remaining} remaining)`
          );
        } catch (error) {
          if (error instanceof Error) {
            addResult(`Request ${i + 1} failed: ${error.message}`);
          }
        }
      });

      await Promise.all(promises);
      addResult(
        'All requests completed. Check the console for retry behavior!'
      );
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSingleRequest = async () => {
    setIsLoading(true);

    try {
      addResult('Making single request...');
      const response = await apiFetch('/api/test/rate-limit?limit=5');
      const data = await response.json();
      addResult(
        `Success: ${data.message} (Request ${data.requestCount}/${data.limit})`
      );
    } catch (error) {
      if (error instanceof Error) {
        addResult(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading>Rate Limit Testing Page</Heading>

        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">How this works:</Text>
            <Text>
              The test endpoint allows 5 requests per minute. After that, it
              returns 429 errors.
            </Text>
            <Text>
              Our apiFetch will automatically retry with exponential backoff
              (1s, 2s, 4s...).
            </Text>
            <Text>Open DevTools Console to see detailed retry logs!</Text>
          </Box>
        </Alert>

        <VStack spacing={4} align="stretch">
          <Button
            onClick={testSingleRequest}
            isLoading={isLoading}
            colorScheme="blue"
          >
            Make Single Request
          </Button>

          <Button
            onClick={testRateLimit}
            isLoading={isLoading}
            colorScheme="red"
          >
            Trigger Rate Limit (10 rapid requests)
          </Button>
        </VStack>

        <Box>
          <Heading size="md" mb={2}>
            Results:
          </Heading>
          <Box
            borderWidth={1}
            borderRadius="md"
            p={4}
            bg="gray.50"
            maxH="400px"
            overflowY="auto"
          >
            {results.length === 0 ? (
              <Text color="gray.500">
                No results yet. Click a button above to test.
              </Text>
            ) : (
              results.map((result, i) => (
                <Code key={i} display="block" mb={1} fontSize="sm">
                  {result}
                </Code>
              ))
            )}
          </Box>
        </Box>

        <Box>
          <Heading size="md" mb={2}>
            Testing Instructions:
          </Heading>
          <VStack align="start" spacing={2}>
            <Text>1. Open browser DevTools Console (F12)</Text>
            <Text>
              2. Click "Make Single Request" a few times to see normal behavior
            </Text>
            <Text>
              3. Click "Trigger Rate Limit" to see 429 errors and retry behavior
            </Text>
            <Text>
              4. Watch the console for "[apiFetch] Rate limited..." messages
              showing retry delays
            </Text>
            <Text>
              5. Notice how requests eventually succeed after backing off
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
