/**
 * Centralized hook for Claim-related API mutations.
 * Uses simplified string array format for all claim operations.
 */
import React from 'react';
import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import { useApiMutation } from '@/lib/api/queryClient';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { logger } from '@/utils/clientLogger';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { ApplicationError } from '@/lib/error';

/**
 * Hook for parsing claim elements
 * @returns Array of claim element strings
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
        elementCount: elements.length,
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
 * @returns Array of search query strings
 */
export function useGenerateQueries() {
  const queryClient = useQueryClient();
  const { activeProjectId } = useProjectData();

  return useApiMutation({
    mutationFn: async ({
      parsedElements,
      projectId,
    }: {
      parsedElements: string[]; // Always string array now
      projectId: string;
    }) => {
      logger.info('[useGenerateQueries] Generating queries', {
        elementCount: parsedElements.length,
        projectId,
      });

      const queries = await ClaimsClientService.generateSearchQueries(
        parsedElements,
        projectId
      );

      logger.info('[useGenerateQueries] Generated queries', {
        queryCount: queries.length,
      });

      return queries;
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
// Smart Hooks - These are now the primary hooks
// ============================================================================

/**
 * Primary hook for parsing claims with toast notifications
 */
export function useParseClaimSmart(
  options?: UseMutationOptions<
    string[],
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
      return await ClaimsClientService.parseClaimElements(claimText, projectId);
    },
    onSuccess: () => {
      toast.success('Claim parsed successfully.');
    },
    onError: (error: ApplicationError) => {
      toast.error(error.message || 'Failed to parse claim.');
    },
    ...options,
  });
}

/**
 * Primary hook for query generation with toast notifications
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

      return await ClaimsClientService.generateSearchQueries(
        elementsToUse,
        projectId
      );
    },
    onSuccess: () => {
      toast.success('Search queries generated successfully.');
    },
    onError: (error: ApplicationError) => {
      toast.error(error.message || 'Failed to generate queries.');
    },
    ...options,
  });
}

// ============================================================================
// Aliases for backward compatibility
// ============================================================================

export const useParseClaimV2 = useParseClaimSmart;
export const useGenerateQueriesV2 = useGenerateQueriesSmart;
