/**
 * Centralized hook for Claim-related API mutations.
 */
import React from 'react';
import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { useApiMutation } from '@/lib/api/queryClient';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { logger } from '@/lib/monitoring/logger';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { ApplicationError } from '@/lib/error';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

/**
 * Hook for parsing claim elements
 */
export function useParseClaim() {
  const queryClient = useQueryClient();
  const { activeProjectId } = useProjectData();

  return useApiMutation({
    mutationFn: async ({
      projectId,
      claimText,
      claimData,
      background = true,
    }: {
      projectId: string;
      claimText: string;
      claimData?: Record<string, string>;
      background?: boolean;
    }) => {
      logger.info('[useParseClaim] Parsing claim', {
        projectId,
        claimLength: claimText.length,
        hasClaimData: !!claimData,
      });

      const elements = await ClaimsClientService.parseClaimElements(
        claimText,
        projectId,
        undefined, // claimSetVersionId no longer used
        claimData,
        background
      );

      logger.info('[useParseClaim] Parsed elements', {
        elementCount: (elements as any[]).length,
      });

      return elements;
    },

    onSuccess: _elements => {
      // Invalidate related queries
      if (activeProjectId) {
        queryClient.invalidateQueries({
          queryKey: ['parsedElements', activeProjectId],
        });
      }
    },

    onError: _error => {
      logger.error('[useParseClaim] Failed to parse claim', _error);
    },
  });
}

/**
 * Hook for generating search queries from parsed elements
 */
export function useGenerateQueries() {
  const queryClient = useQueryClient();
  const { activeProjectId } = useProjectData();

  return useApiMutation({
    mutationFn: async ({
      parsedElements,
      projectId,
    }: {
      parsedElements: string[]; // V2 format
      projectId: string;
    }) => {
      logger.info('[useGenerateQueries] Generating queries', {
        elementCount: parsedElements.length,
        projectId,
      });

      const _queries = await ClaimsClientService.generateSearchQueries(
        parsedElements,
        projectId
      );

      logger.info('[useGenerateQueries] Generated queries', {
        queryCount: _queries.length,
      });

      return _queries;
    },

    onSuccess: _queries => {
      // Invalidate related queries
      if (activeProjectId) {
        queryClient.invalidateQueries({
          queryKey: ['searchQueries', activeProjectId],
        });
      }
    },

    onError: _error => {
      logger.error('[useGenerateQueries] Failed to generate queries', _error);
    },
  });
}

// ============================================================================
// V2 Hooks - Simplified string array format
// ============================================================================

/**
 * V2 Hook to parse a claim into string elements.
 */
export function useParseClaimV2(
  options?: UseMutationOptions<
    string[], // Simple string array response
    ApplicationError,
    {
      claimText: string;
      projectId: string;
    }
  >
) {
  const toast = useToast();
  return useApiMutation<
    string[],
    {
      claimText: string;
      projectId: string;
    }
  >({
    mutationFn: async ({ claimText, projectId }) => {
      return await ClaimsClientService.parseClaimElementsV2(
        claimText,
        projectId
      );
    },
    onSuccess: () => {
      showSuccessToast(toast, 'Claim parsed successfully (V2).');
    },
    onError: (error: ApplicationError) => {
      showErrorToast(toast, error.message || 'Failed to parse claim.');
    },
    ...options,
  });
}

/**
 * V2 Hook to generate queries from string elements.
 */
export function useGenerateQueriesV2(
  options?: UseMutationOptions<
    string[], // Array of search query strings
    ApplicationError,
    { elements: string[]; projectId: string }
  >
) {
  const toast = useToast();
  return useApiMutation<string[], { elements: string[]; projectId: string }>({
    mutationFn: async ({ elements, projectId }) => {
      return await ClaimsClientService.generateSearchQueriesV2(
        elements,
        projectId
      );
    },
    onSuccess: () => {
      showSuccessToast(toast, 'Search queries generated successfully (V2).');
    },
    onError: (error: ApplicationError) => {
      showErrorToast(toast, error.message || 'Failed to generate queries.');
    },
    ...options,
  });
}

// ============================================================================
// Feature Flag Aware Wrappers
// ============================================================================

/**
 * Smart hook that uses V2 (now the only version)
 */
export function useParseClaimSmart() {
  const toast = useToast();

  return useApiMutation<
    string[],
    {
      claimText: string;
      projectId: string;
    }
  >({
    mutationFn: async ({ claimText, projectId }) => {
      return await ClaimsClientService.parseClaimElementsV2(
        claimText,
        projectId
      );
    },
    onSuccess: () => {
      showSuccessToast(toast, 'Claim parsed successfully.');
    },
    onError: (error: ApplicationError) => {
      showErrorToast(toast, error.message || 'Failed to parse claim.');
    },
  });
}

/**
 * Smart hook for query generation (now always uses V2)
 */
export function useGenerateQueriesSmart(
  options?: UseMutationOptions<
    string[],
    ApplicationError,
    {
      elements?: string[];
      parsedElements?: string[];
      projectId: string;
    }
  >
) {
  const toast = useToast();
  return useApiMutation<
    string[],
    {
      elements?: string[];
      parsedElements?: string[];
      projectId: string;
    }
  >({
    mutationFn: async ({ elements, parsedElements, projectId }) => {
      // Use elements if provided, otherwise fall back to parsedElements
      const elementsToUse = elements || parsedElements;
      if (!elementsToUse) {
        throw new Error('Either elements or parsedElements must be provided');
      }

      return await ClaimsClientService.generateSearchQueriesV2(
        elementsToUse,
        projectId
      );
    },
    onSuccess: () => {
      showSuccessToast(toast, 'Search queries generated successfully.');
    },
    onError: (error: ApplicationError) => {
      showErrorToast(toast, error.message || 'Failed to generate queries.');
    },
    ...options,
  });
}
