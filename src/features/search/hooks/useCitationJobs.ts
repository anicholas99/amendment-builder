import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { CitationClientService } from '@/client/services/citation.client-service';
import { initializeReferencesWithCitations } from './useCitationMatches';

// Re-export CitationJob type for other modules
export type { CitationJob } from '@prisma/client';

interface UseCitationJobsProps {
  entryId: string;
  isExpanded: boolean;
  referencesWithJobs?: Set<string>;
}

export const useCitationJobs = ({
  entryId,
  isExpanded,
  referencesWithJobs = new Set(),
}: UseCitationJobsProps) => {
  const [citationJobNumbers, setCitationJobNumbers] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  // TODO: Refactor to use React Query with refetchInterval instead of setInterval
  // eslint-disable-next-line no-restricted-globals
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load citation jobs when expanded
  useEffect(() => {
    const loadCitationJobs = async () => {
      setIsLoadingJobs(true);
      try {
        logger.log(
          `[SearchHistoryRow] Fetching citation jobs for entry ID: ${entryId}`
        );
        // TODO: This hook needs a full refactor. The original method it called was a placeholder.
        // This is a temporary replacement to prevent build errors. The data shape is likely incorrect.
        const jobs =
          await CitationClientService.getCitationJobsBySearchHistoryId(entryId);
        const references = jobs.map(job => job.referenceNumber).filter(Boolean);

        logger.log(
          `[SearchHistoryRow] Fetched references with jobs for ${entryId}:`,
          { references }
        );
        const normalizedRefs = new Set(
          Array.from(references)
            .filter((ref): ref is string => ref !== null)
            .map(ref => ref.replace(/-/g, '').toUpperCase())
        );
        logger.log(
          `[SearchHistoryRow] Normalized job numbers set for ${entryId}:`,
          { normalizedRefs: Array.from(normalizedRefs) }
        );
        setCitationJobNumbers(normalizedRefs);

        // Initialize the global cache with these references
        initializeReferencesWithCitations(
          entryId,
          Array.from(references).filter((ref): ref is string => ref !== null)
        );
      } catch (error) {
        logger.error('Error loading citation jobs:', error);
        setCitationJobNumbers(new Set());
      } finally {
        setIsLoadingJobs(false);
      }
    };

    if (isExpanded) {
      loadCitationJobs();
    }
  }, [entryId, isExpanded]);

  // Initialize from referencesWithJobs prop
  useEffect(() => {
    if (referencesWithJobs && referencesWithJobs.size > 0) {
      const normalizedJobNumbers = new Set<string>();

      referencesWithJobs.forEach(referenceNumber => {
        if (typeof referenceNumber === 'string') {
          normalizedJobNumbers.add(
            referenceNumber.replace(/-/g, '').toUpperCase()
          );
        }
      });

      setCitationJobNumbers(prev => {
        const merged = new Set(prev);
        normalizedJobNumbers.forEach(num => merged.add(num));
        return merged;
      });
    }
  }, [referencesWithJobs]);

  // Polling function
  const pollForCitationCompletion = useCallback(
    (
      referenceNumber: string,
      extractingReferenceNumber: string | null,
      setExtractingReferenceNumber: (value: string | null) => void
    ) => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      let attempts = 0;
      const maxAttempts = 15;

      logger.log(
        `[SearchHistoryRow POLLING_START] Starting polling for citation job completion for: ${referenceNumber}`
      );

      const checkJobStatus = async () => {
        try {
          logger.log(
            `[SearchHistoryRow POLLING_CHECK] Checking job status for ${referenceNumber}. Current extractingRef: ${extractingReferenceNumber}`
          );
          // TODO: This hook needs a full refactor. The original method it called was a placeholder.
          // This is a temporary replacement to prevent build errors. The data shape is likely incorrect.
          const updatedJobs =
            await CitationClientService.getCitationJobsBySearchHistoryId(
              entryId
            );
          const updatedReferences = updatedJobs
            .map(job => job.referenceNumber)
            .filter(Boolean);

          const normalizedRefNumber = referenceNumber
            .replace(/-/g, '')
            .toUpperCase();
          const normalizedJobs = new Set(
            Array.from(updatedReferences)
              .filter((ref): ref is string => ref !== null)
              .map(ref => ref.replace(/-/g, '').toUpperCase())
          );

          if (normalizedJobs.has(normalizedRefNumber)) {
            logger.log(
              `[SearchHistoryRow POLLING_SUCCESS] Job found for ${referenceNumber} via polling.`
            );

            setCitationJobNumbers(prev => {
              const newSet = new Set(prev);
              newSet.add(normalizedRefNumber);
              return newSet;
            });

            if (extractingReferenceNumber === referenceNumber) {
              setExtractingReferenceNumber(null);
            }

            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            return true;
          }

          return false;
        } catch (error) {
          logger.error(
            '[SearchHistoryRow POLLING_ERROR] Error checking job status:',
            error
          );
          return false;
        }
      };

      checkJobStatus().then(jobFound => {
        if (jobFound) {
          logger.log(
            `[SearchHistoryRow] Job already found on immediate check for ${referenceNumber}`
          );
          return;
        }

        // TODO: Refactor to use React Query with refetchInterval instead of setInterval
        // eslint-disable-next-line no-restricted-globals
        pollIntervalRef.current = setInterval(async () => {
          attempts++;
          const jobFound = await checkJobStatus();

          if (!jobFound && attempts >= maxAttempts) {
            logger.log(
              `[SearchHistoryRow] Max polling attempts (${maxAttempts}) reached for ${referenceNumber}. Stopping spinner.`
            );

            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            if (extractingReferenceNumber === referenceNumber) {
              setExtractingReferenceNumber(null);
            }
          }
        }, 1000);
      });

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    },
    [entryId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  return {
    citationJobNumbers,
    setCitationJobNumbers,
    pollForCitationCompletion,
    isLoadingJobs,
  };
};
