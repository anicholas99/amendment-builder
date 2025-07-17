import React, { useState } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToastWrapper';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  useCheckCitationJobStatus,
  useResetCitationExtraction,
  useGetDebugInfo,
} from '@/hooks/api/useDebug';

export default function DebugCitationPage() {
  const { isDarkMode } = useThemeContext();
  const [jobId, setJobId] = useState<string>('1579');
  const toast = useToast();

  // React Query hooks
  const {
    data: statusData,
    isLoading: isCheckingStatus,
    refetch: checkStatus,
  } = useCheckCitationJobStatus(jobId);
  const resetExtraction = useResetCitationExtraction();
  const {
    data: debugInfoData,
    isLoading: isLoadingDebugInfo,
    refetch: getDebugInfo,
  } = useGetDebugInfo();

  // Handle status check with toast notifications
  const handleCheckStatus = async () => {
    const result = await checkStatus();
    if (result.data) {
      toast({
        title: `Job Status: ${result.data.status === 1 ? 'Complete' : result.data.status === 2 ? 'Failed' : 'Processing'}`,
        status:
          result.data.status === 1
            ? 'success'
            : result.data.status === 2
              ? 'error'
              : 'info',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  // Handle reset extraction
  const handleResetExtraction = () => {
    resetExtraction.mutate(parseInt(jobId, 10));
  };

  // Determine which result to show
  const resultStatus = statusData
    ? JSON.stringify(statusData, null, 2)
    : debugInfoData
      ? JSON.stringify(debugInfoData, null, 2)
      : resetExtraction.data
        ? JSON.stringify(resetExtraction.data, null, 2)
        : resetExtraction.error
          ? `Error: ${resetExtraction.error.message}`
          : '';

  // Combined loading state
  const isLoading =
    isCheckingStatus || resetExtraction.isPending || isLoadingDebugInfo;

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Citation Extraction Debug</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This page helps debug citation extraction issues. Use it to check job
          status or reset the UI state.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Job ID</h2>
          <div className="flex items-center space-x-2">
            <Input
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              placeholder="Enter job ID"
              type="number"
              className="w-[200px]"
            />
            <Button onClick={handleCheckStatus} disabled={isCheckingStatus}>
              {isCheckingStatus ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
            <Button
              onClick={handleResetExtraction}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              disabled={resetExtraction.isPending}
            >
              {resetExtraction.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                  Resetting...
                </>
              ) : (
                'Reset UI State'
              )}
            </Button>
            <Button
              onClick={() => getDebugInfo()}
              variant="outline"
              disabled={isLoadingDebugInfo}
            >
              {isLoadingDebugInfo ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                  Loading...
                </>
              ) : (
                'Debug Info'
              )}
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-lg font-semibold mb-3">Result</h2>
          {resultStatus ? (
            <div
              className={cn(
                'p-4 rounded-md overflow-x-auto font-mono text-sm',
                isDarkMode
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-50 text-gray-800'
              )}
            >
              <pre>{resultStatus}</pre>
            </div>
          ) : (
            <p className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
              No results yet. Click one of the buttons above.
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Instructions</h2>
          <p>1. Enter the job ID (default: 1579)</p>
          <p>2. Click "Check Status" to see if the job is complete</p>
          <p>
            3. If the UI is stuck, click "Reset UI State" to try resetting the
            extraction state
          </p>
          <p>
            4. Return to the main app and try clicking the citation extraction
            button again
          </p>
        </div>
      </div>
    </div>
  );
}
