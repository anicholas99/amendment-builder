/**
 * Claim Validation Hooks
 * 
 * React Query hooks for managing claim validation state.
 * Supports background validation with real-time updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClaimValidationService } from '@/client/services/claim-validation.client-service';
import { logger } from '@/utils/clientLogger';
import { useCallback, useEffect } from 'react';
import type { 
  ClaimValidation, 
  AmendmentValidationSummary,
  ValidationState 
} from '@/features/amendment/types/validation';

const QUERY_KEYS = {
  claimValidation: (claimId: string) => ['claim-validation', claimId] as const,
  validationSummary: (projectId: string) => ['validation-summary', projectId] as const,
  exportReadiness: (projectId: string) => ['export-readiness', projectId] as const,
};

/**
 * Hook to get validation status for a single claim
 */
export function useClaimValidation(claimId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.claimValidation(claimId || ''),
    queryFn: () => ClaimValidationService.getClaimValidation(claimId!),
    enabled: !!claimId,
    refetchInterval: (data) => {
      // Poll while validation is pending
      if (data?.isValidating || data?.validationResult?.state === ValidationState.PENDING) {
        return 2000; // Poll every 2 seconds
      }
      return false;
    },
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

/**
 * Hook to get validation summary for entire project
 */
export function useValidationSummary(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.validationSummary(projectId),
    queryFn: () => ClaimValidationService.getValidationSummary(projectId),
    refetchInterval: (data) => {
      // Poll while any validations are pending
      if (data?.pendingValidations && data.pendingValidations > 0) {
        return 5000; // Poll every 5 seconds
      }
      return false;
    },
    staleTime: 60000, // Consider data stale after 1 minute
  });
}

/**
 * Hook to validate a single claim
 */
export function useValidateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClaimValidationService.validateClaim,
    onMutate: async (variables) => {
      // Optimistically update to pending state
      const queryKey = QUERY_KEYS.claimValidation(variables.claimId);
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData<ClaimValidation>(queryKey);
      
      queryClient.setQueryData<ClaimValidation>(queryKey, {
        claimId: variables.claimId,
        claimNumber: variables.claimNumber,
        isValidating: true,
        validationResult: {
          state: ValidationState.PENDING,
          riskLevel: 'NONE' as const,
          timestamp: new Date(),
        },
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.claimValidation(variables.claimId),
          context.previousData
        );
      }
      logger.error('[useValidateClaim] Validation failed', { error });
    },
    onSuccess: (data) => {
      // Update cache with result
      queryClient.setQueryData(QUERY_KEYS.claimValidation(data.claimId), data);
      
      // Invalidate summary to reflect new validation
      queryClient.invalidateQueries({ 
        queryKey: ['validation-summary'],
        exact: false,
      });
    },
  });
}

/**
 * Hook to validate all claims in a project
 */
export function useValidateAllClaims() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ClaimValidationService.validateAllClaims,
    onSuccess: (data, variables) => {
      logger.info('[useValidateAllClaims] Bulk validation started', {
        jobId: data.jobId,
        claimsQueued: data.claimsQueued,
      });
      
      // Invalidate all validation queries for this project
      queryClient.invalidateQueries({
        queryKey: ['claim-validation'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.validationSummary(variables.projectId),
      });
    },
  });
}

/**
 * Hook to check export readiness
 */
export function useExportReadiness(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.exportReadiness(projectId),
    queryFn: () => ClaimValidationService.checkExportReadiness(projectId),
    staleTime: 30000,
  });
}

/**
 * Hook to record validation override
 */
export function useRecordValidationOverride() {
  return useMutation({
    mutationFn: ({ projectId, reason }: { projectId: string; reason?: string }) =>
      ClaimValidationService.recordValidationOverride(projectId, reason),
    onSuccess: (_, variables) => {
      logger.info('[useRecordValidationOverride] Override recorded', {
        projectId: variables.projectId,
      });
    },
  });
}

/**
 * Hook to automatically trigger validation when claims change
 */
export function useAutoValidation(
  projectId: string,
  claims: Array<{ id: string; text: string; number: string }> | undefined,
  enabled = true
) {
  const validateAll = useValidateAllClaims();
  const queryClient = useQueryClient();

  const triggerValidation = useCallback(() => {
    if (!claims || claims.length === 0) return;

    validateAll.mutate({
      projectId,
      claims,
    });
  }, [projectId, claims, validateAll]);

  useEffect(() => {
    if (!enabled || !claims) return;

    // Debounce validation to avoid excessive API calls
    const timer = setTimeout(() => {
      triggerValidation();
    }, 3000); // Wait 3 seconds after changes stop

    return () => clearTimeout(timer);
  }, [claims, enabled, triggerValidation]);

  return {
    isValidating: validateAll.isPending,
    triggerValidation,
  };
}