/**
 * Centralized hook for Citation Job API mutations.
 */
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { CitationClientService } from '@/client/services/citation.client-service';
import { ApplicationError } from '@/lib/error';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

// Define types based on the new createCitationJob service method
type CreateCitationJobRequest = {
  searchId: string;
  referenceNumber?: string;
  threshold?: number;
  parsedElements?: string[];
};

type CreateCitationJobResponse = {
  success: boolean;
  jobId?: string | number;
  message?: string;
};

/**
 * Hook to create a citation extraction job.
 * This is the primary hook for initiating a new citation analysis.
 */
export function useCreateCitationJob(
  options?: UseMutationOptions<
    CreateCitationJobResponse,
    ApplicationError,
    CreateCitationJobRequest
  >
) {
  const toast = useToast();
  return useMutation<
    CreateCitationJobResponse,
    ApplicationError,
    CreateCitationJobRequest
  >({
    mutationFn: ({ searchId, referenceNumber, parsedElements, threshold }) =>
      CitationClientService.createCitationJob(
        searchId,
        referenceNumber,
        parsedElements,
        threshold
      ),
    onSuccess: data => {
      if (data.success) {
        showSuccessToast(toast, 'Citation job created successfully.');
      } else {
        showErrorToast(toast, data.message || 'Failed to create citation job.');
      }
    },
    onError: error => {
      showErrorToast(
        toast,
        error.message || 'An error occurred while creating the citation job.'
      );
    },
    ...options,
  });
}

/**
 * Hook for queue citation extraction (legacy interface).
 * Uses the createCitationJob under the hood but provides the queueCitationExtraction interface.
 */
export function useQueueCitationExtraction(
  options?: UseMutationOptions<
    CreateCitationJobResponse & { externalJobId?: string },
    ApplicationError,
    {
      searchInputs: string[];
      filterReferenceNumber?: string;
      searchHistoryId: string;
      threshold?: number;
      claimSetVersionId?: string;
    }
  >
) {
  const toast = useToast();

  return useMutation<
    CreateCitationJobResponse & { externalJobId?: string },
    ApplicationError,
    {
      searchInputs: string[];
      filterReferenceNumber?: string;
      searchHistoryId: string;
      threshold?: number;
      claimSetVersionId?: string;
    }
  >({
    mutationFn: async ({
      searchInputs,
      filterReferenceNumber,
      searchHistoryId,
      threshold,
    }) => {
      const result = await CitationClientService.createCitationJob(
        searchHistoryId,
        filterReferenceNumber,
        searchInputs,
        threshold
      );

      return {
        ...result,
        externalJobId: undefined,
      };
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        showSuccessToast(
          toast,
          `Citation extraction queued successfully. Job ID: ${data.jobId}`
        );
      } else {
        showErrorToast(
          toast,
          data.message || 'Failed to queue citation extraction'
        );
      }
    },
    onError: error => {
      showErrorToast(
        toast,
        error.message || 'An error occurred while queuing citation extraction'
      );
    },
    ...options,
  });
}

// Export for convenience
export type { CreateCitationJobRequest, CreateCitationJobResponse };
