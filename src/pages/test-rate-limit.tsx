import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api/apiClient';
import { isDevelopment } from '@/config/environment.client';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';

export default function TestRateLimit() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Only show in development
  if (!isDevelopment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          This page is only available in development mode.
        </p>
      </div>
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
      logger.error('Test error:', error);
      toast({
        title: 'Request failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
    <div className="mx-auto max-w-6xl p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Rate Limit Testing Page</h1>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">How this works:</p>
              <p>
                The test endpoint allows 5 requests per minute. After that, it
                returns 429 errors.
              </p>
              <p>
                Our apiFetch will automatically retry with exponential backoff
                (1s, 2s, 4s...).
              </p>
              <p>Open DevTools Console to see detailed retry logs!</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button
            onClick={testSingleRequest}
            disabled={isLoading}
            variant="default"
          >
            Make Single Request
          </Button>

          <Button
            onClick={testRateLimit}
            disabled={isLoading}
            variant="destructive"
          >
            Trigger Rate Limit (10 rapid requests)
          </Button>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">Results:</h2>
          <div className="max-h-96 overflow-y-auto rounded-md border bg-muted/50 p-4">
            {results.length === 0 ? (
              <p className="text-muted-foreground">
                No results yet. Click a button above to test.
              </p>
            ) : (
              results.map((result, i) => (
                <code key={i} className="mb-1 block text-sm">
                  {result}
                </code>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">Testing Instructions:</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open browser DevTools Console (F12)</li>
            <li>
              Click "Make Single Request" a few times to see normal behavior
            </li>
            <li>
              Click "Trigger Rate Limit" to see 429 errors and retry behavior
            </li>
            <li>
              Watch the console for "[apiFetch] Rate limited..." messages
              showing retry delays
            </li>
            <li>Notice how requests eventually succeed after backing off</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
