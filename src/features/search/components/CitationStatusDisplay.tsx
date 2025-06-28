import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Text,
  Progress,
  Button,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
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
        <Alert status="error" m={4}>
          <AlertIcon />
          <AlertDescription>
            {errorMessage || 'Failed to load citation data.'}
            <Text fontSize="sm" mt={2}>
              Please try refreshing the page or selecting a different search.
            </Text>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {shouldShowMessage('loading') && (
        <Alert status="info" size="sm">
          <AlertIcon />
          <Flex direction="column" alignItems="flex-start">
            <AlertDescription>Loading citation data...</AlertDescription>
            <Progress size="xs" width="100%" isIndeterminate mt={2} />
          </Flex>
        </Alert>
      )}

      {/* Polling state */}
      {shouldShowMessage('polling') && (
        <Box
          bg="blue.100"
          borderRadius="md"
          p={4}
          mb={4}
          display="flex"
          alignItems="center"
        >
          <Icon as={FiInfo} boxSize="20px" color="blue.700" mr={2} />
          <Text color="blue.800">
            Results are being processed. This might take a few minutes depending
            on the complexity of the claims.
          </Text>
        </Box>
      )}

      {/* Pending jobs (passive mode) */}
      {shouldShowMessage('pendingPassive') && (
        <Box p={3}>
          <Text fontSize="sm" color="blue.600" className="italic">
            No citations have been extracted yet. You'll see results here once
            extraction completes.
          </Text>
        </Box>
      )}

      {/* No jobs message */}
      {shouldShowMessage('noJobs') && (
        <Alert status="info" size="sm">
          <AlertIcon />
          <AlertDescription>
            No citation extraction jobs found or started for this search. Click
            the extract icon in the Search History tab.
          </AlertDescription>
        </Alert>
      )}

      {/* No results with cache message */}
      {shouldShowMessage('noResultsWithCache') && citationCacheMap && (
        <Alert status="warning" size="sm" m={3}>
          <AlertIcon />
          <Box>
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
              size="xs"
              mt={2}
              onClick={() => window.location.reload()}
              colorScheme="blue"
            >
              Refresh Page
            </Button>
          </Box>
        </Alert>
      )}

      {/* No reference selected message */}
      {shouldShowMessage('noSelectedReference') && (
        <Alert status="info" size="sm" m={3}>
          <AlertIcon />
          <AlertDescription>
            Please select a reference to view citation matches.
          </AlertDescription>
        </Alert>
      )}

      {/* Reference selected but no results */}
      {shouldShowMessage('referenceWithoutResults') && selectedReference && (
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          bg="gray.50"
          _dark={{ bg: 'gray.700' }}
        >
          <Text fontSize="md">
            {jobs.find(j => j.referenceNumber === selectedReference)?.status ===
            'pending' ? (
              <Box
                bg="blue.50"
                borderRadius="md"
                p={4}
                mb={0}
                display="flex"
                alignItems="center"
              >
                <Icon as={FiInfo} boxSize="20px" color="blue.700" mr={2} />
                <Text color="blue.800">
                  Results are being processed and will appear here when ready.
                </Text>
              </Box>
            ) : jobs.find(j => j.referenceNumber === selectedReference)
                ?.status === 'failed' ? (
              'Extraction failed for this reference. Please try running extraction again.'
            ) : (
              'No results available for this reference. The extraction might have completed but did not find any relevant citations.'
            )}
          </Text>
          {jobs.find(j => j.referenceNumber === selectedReference)?.error && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Error:{' '}
              {jobs.find(j => j.referenceNumber === selectedReference)?.error}
            </Text>
          )}
        </Box>
      )}
    </>
  );
};

export default CitationStatusDisplay;
