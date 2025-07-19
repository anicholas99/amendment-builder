/**
 * Claim Validation Client Service
 * 
 * Handles background validation of claims without blocking user workflow.
 * Validation is advisory - attorneys can proceed even with warnings.
 */

import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import type { 
  ValidationState, 
  ValidationResult, 
  ClaimValidation,
  AmendmentValidationSummary 
} from '@/features/amendment/types/validation';

export interface ValidateClaimRequest {
  claimId: string;
  claimText: string;
  claimNumber: string;
  projectId: string;
}

export interface ValidateAllClaimsRequest {
  projectId: string;
  claims: Array<{
    id: string;
    text: string;
    number: string;
  }>;
}

export class ClaimValidationService {
  /**
   * Validate a single claim
   * Non-blocking - returns immediately with pending status
   */
  static async validateClaim(request: ValidateClaimRequest): Promise<ClaimValidation> {
    try {
      const response = await apiFetch('/api/claims/validate', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response.data;
    } catch (error) {
      logger.error('[ClaimValidationService] Error validating claim', {
        claimId: request.claimId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Return failed state on error - don't block user
      return {
        claimId: request.claimId,
        claimNumber: request.claimNumber,
        isValidating: false,
        validationResult: {
          state: ValidationState.FAILED,
          riskLevel: 'NONE' as const,
          message: 'Validation service unavailable',
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Validate all claims in a project
   * Triggers background validation for all claims
   */
  static async validateAllClaims(request: ValidateAllClaimsRequest): Promise<{
    jobId: string;
    claimsQueued: number;
  }> {
    try {
      const response = await apiFetch('/api/claims/validate-all', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return response.data;
    } catch (error) {
      logger.error('[ClaimValidationService] Error starting bulk validation', {
        projectId: request.projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get validation status for a claim
   */
  static async getClaimValidation(claimId: string): Promise<ClaimValidation | null> {
    try {
      const response = await apiFetch(`/api/claims/${claimId}/validation`);
      return response.data;
    } catch (error) {
      logger.error('[ClaimValidationService] Error fetching validation status', {
        claimId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Get validation summary for entire amendment
   */
  static async getValidationSummary(projectId: string): Promise<AmendmentValidationSummary> {
    try {
      const response = await apiFetch(`/api/projects/${projectId}/validation-summary`);
      return response.data;
    } catch (error) {
      logger.error('[ClaimValidationService] Error fetching validation summary', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Return safe defaults on error
      return {
        totalClaims: 0,
        validatedClaims: 0,
        pendingValidations: 0,
        failedValidations: 0,
        highRiskClaims: 0,
        mediumRiskClaims: 0,
        lowRiskClaims: 0,
        hasUnvalidatedClaims: false,
        hasHighRiskClaims: false,
        overallRisk: 'NONE' as const,
      };
    }
  }

  /**
   * Check validation status before export
   * Returns validation summary and any warnings
   */
  static async checkExportReadiness(projectId: string): Promise<{
    canExport: boolean;
    requiresOverride: boolean;
    summary: AmendmentValidationSummary;
    warnings: string[];
  }> {
    try {
      const response = await apiFetch(`/api/projects/${projectId}/export-readiness`);
      return response.data;
    } catch (error) {
      logger.error('[ClaimValidationService] Error checking export readiness', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Allow export on error - don't block attorney
      return {
        canExport: true,
        requiresOverride: false,
        summary: await this.getValidationSummary(projectId),
        warnings: ['Validation service unavailable - proceed with caution'],
      };
    }
  }

  /**
   * Record validation override when attorney proceeds without validation
   */
  static async recordValidationOverride(projectId: string, reason?: string): Promise<void> {
    try {
      await apiFetch('/api/projects/validation-override', {
        method: 'POST',
        body: JSON.stringify({ projectId, reason }),
      });
    } catch (error) {
      logger.error('[ClaimValidationService] Error recording validation override', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - this is audit trail only, don't block export
    }
  }
}