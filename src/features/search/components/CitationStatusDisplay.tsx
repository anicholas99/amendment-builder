import React from 'react';
import { cn } from '@/lib/utils';
import { FiInfo } from 'react-icons/fi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useThemeContext } from '@/contexts/ThemeContext';
import { JobWithResult } from '../types/citationTypes';

// Props interface
interface CitationStatusDisplayProps {
  loadingStatus: 'idle' | 'loading' | 'polling' | 'complete' | 'error';
  errorMessage: string | null;
  jobs: JobWithResult[];
  selectedReference: string | null;
  selectedSearchId: string;
  resultsByReference: Record<string, any[]>;
  skipDirectApiCalls?: boolean;
  citationCacheMap?: Record<string, any[]>;
}

export const CitationStatusDisplay: React.FC<CitationStatusDisplayProps> = ({
  loadingStatus,
  errorMessage,
  jobs,
  selectedReference,
  selectedSearchId,
  resultsByReference,
  skipDirectApiCalls = false,
  citationCacheMap,
}) => {
  const { isDarkMode } = useThemeContext();

  // Helper to check if citation cache has data for the selected search
  const hasCacheForCurrentSearch = (): boolean => {
    if (!citationCacheMap) return false;
    if (
      !Object.prototype.hasOwnProperty.call(citationCacheMap, selectedSearchId)
    )
      return false;
    return true;
  };

  // Helper to check if the selected reference has results
  const hasResultsForSelectedReference = (): boolean => {
    if (!selectedReference) return false;
    if (
      !Object.prototype.hasOwnProperty.call(
        resultsByReference,
        selectedReference
      )
    )
      return false;
    return true;
  };

  // Helper to determine if we should show a particular alert/message
  const shouldShowMessage = (messageType: string): boolean => {
    switch (messageType) {
      case 'error':
        return loadingStatus === 'error' && !skipDirectApiCalls;
      case 'loading':
        return loadingStatus === 'loading' && !skipDirectApiCalls;
      case 'polling':
        return loadingStatus === 'polling' && !skipDirectApiCalls;
      case 'pendingPassive':
        return (
          skipDirectApiCalls &&
          jobs.some(job => job.status === 'pending') &&
          loadingStatus !== 'error'
        );
      case 'noJobs':
        return (
          jobs.length === 0 &&
          !skipDirectApiCalls &&
          (loadingStatus === 'idle' || loadingStatus === 'complete')
        );
      case 'noResultsWithCache':
        return (
          jobs.length === 0 &&
          Object.keys(resultsByReference).length === 0 &&
          skipDirectApiCalls &&
          hasCacheForCurrentSearch()
        );
      case 'noSelectedReference':
        return jobs.length > 0 && selectedReference === null;
      case 'referenceWithoutResults':
        return selectedReference !== null && !hasResultsForSelectedReference();
      default:
        return false;
    }
  };

  // Render nothing if no messages need to be shown
  if (
    !shouldShowMessage('error') &&
    !shouldShowMessage('loading') &&
    !shouldShowMessage('polling') &&
    !shouldShowMessage('pendingPassive') &&
    !shouldShowMessage('noJobs') &&
    !shouldShowMessage('noResultsWithCache') &&
    !shouldShowMessage('noSelectedReference') &&
    !shouldShowMessage('referenceWithoutResults')
  ) {
    return null;
  }

  return (
    <>
      {/* Error state */}
      {shouldShowMessage('error') && (
        <Alert
          className={cn(
            'm-4',
            isDarkMode
              ? 'bg-red-900/30 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
          )}
        >
          <div className="flex items-center">
            <div
              className={cn(
                'w-4 h-4 rounded-full mr-2',
                isDarkMode ? 'bg-red-400' : 'bg-red-500'
              )}
            />
            <AlertDescription>
              {errorMessage || 'Failed to load citation data.'}
              <div className="text-sm mt-2">
                Please try refreshing the page or selecting a different search.
              </div>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Loading state */}
      {shouldShowMessage('loading') && (
        <Alert
          className={cn(
            'size-sm',
            isDarkMode
              ? 'bg-blue-900/30 border-blue-700 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          )}
        >
          <div className="flex items-center">
            <div
              className={cn(
                'w-4 h-4 rounded-full mr-2',
                isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
              )}
            />
            <div className="flex flex-col items-start">
              <AlertDescription>Loading citation data...</AlertDescription>
              <Progress className="w-full mt-2" />
            </div>
          </div>
        </Alert>
      )}

      {/* Polling state */}
      {shouldShowMessage('polling') && (
        <div
          className={cn(
            'rounded-md p-4 mb-4 flex items-center',
            isDarkMode
              ? 'bg-blue-900/30 border border-blue-700'
              : 'bg-blue-100 border border-blue-200'
          )}
        >
          <FiInfo
            className={cn(
              'w-5 h-5 mr-2',
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            )}
          />
          <span className={cn(isDarkMode ? 'text-blue-300' : 'text-blue-800')}>
            Results are being processed. This might take a few minutes depending
            on the complexity of the claims.
          </span>
        </div>
      )}

      {/* Pending jobs (passive mode) */}
      {shouldShowMessage('pendingPassive') && (
        <div className="p-4">
          <div
            className={cn(
              'text-sm italic',
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            )}
          >
            No citations have been extracted yet. You'll see results here once
            extraction completes.
          </div>
        </div>
      )}

      {/* No jobs message */}
      {shouldShowMessage('noJobs') && (
        <Alert
          className={cn(
            'size-sm',
            isDarkMode
              ? 'bg-blue-900/30 border-blue-700 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          )}
        >
          <div className="flex items-center">
            <div
              className={cn(
                'w-4 h-4 rounded-full mr-2',
                isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
              )}
            />
            <AlertDescription>
              No citation extraction jobs found or started for this search.
              Click the extract icon in the Search History tab.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* No results with cache message */}
      {shouldShowMessage('noResultsWithCache') && citationCacheMap && (
        <Alert
          className={cn(
            'size-sm m-3',
            isDarkMode
              ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          )}
        >
          <div className="flex items-center">
            <div
              className={cn(
                'w-4 h-4 rounded-full mr-2',
                isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500'
              )}
            />
            <div>
              <AlertDescription>
                {citationCacheMap[selectedSearchId]?.length === 0
                  ? 'We found citation information in the cache, but there are no results to display. Try running a search with citation extraction or refreshing the page.'
                  : citationCacheMap[selectedSearchId]?.every(
                        job => job.status === 'pending'
                      )
                    ? 'Citation extraction is in progress. Results will appear here once processing is complete. You can refresh the page to check for updates.'
                    : "Citation data is available but couldn't be processed. Try refreshing the page."}
              </AlertDescription>
              <Button
                size="sm"
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* No reference selected message */}
      {shouldShowMessage('noSelectedReference') && (
        <Alert
          className={cn(
            'size-sm m-3',
            isDarkMode
              ? 'bg-blue-900/30 border-blue-700 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          )}
        >
          <div className="flex items-center">
            <div
              className={cn(
                'w-4 h-4 rounded-full mr-2',
                isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
              )}
            />
            <AlertDescription>
              Please select a reference to view citation matches.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Reference selected but no results */}
      {shouldShowMessage('referenceWithoutResults') && selectedReference && (
        <div
          className={cn(
            'p-4 border rounded-md',
            isDarkMode
              ? 'border-gray-600 bg-gray-700'
              : 'border-gray-200 bg-gray-50'
          )}
        >
          <div className="text-md">
            {jobs.find(j => j.referenceNumber === selectedReference)?.status ===
            'pending' ? (
              <div
                className={cn(
                  'rounded-md p-4 mb-0 flex items-center',
                  isDarkMode
                    ? 'bg-blue-900/30 border border-blue-700'
                    : 'bg-blue-50 border border-blue-200'
                )}
              >
                <FiInfo
                  className={cn(
                    'w-5 h-5 mr-2',
                    isDarkMode ? 'text-blue-400' : 'text-blue-700'
                  )}
                />
                <span
                  className={cn(isDarkMode ? 'text-blue-300' : 'text-blue-800')}
                >
                  Results are being processed and will appear here when ready.
                </span>
              </div>
            ) : jobs.find(j => j.referenceNumber === selectedReference)
                ?.status === 'failed' ? (
              'Extraction failed for this reference. Please try running extraction again.'
            ) : (
              'No results available for this reference. The extraction might have completed but did not find any relevant citations.'
            )}
          </div>
          {jobs.find(j => j.referenceNumber === selectedReference)?.error && (
            <div
              className={cn(
                'text-sm mt-2',
                isDarkMode ? 'text-red-400' : 'text-red-500'
              )}
            >
              Error:{' '}
              {jobs.find(j => j.referenceNumber === selectedReference)?.error}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CitationStatusDisplay;
