import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { logger } from '@/utils/clientLogger';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Response schemas
const ClaimSchema = z.object({
  id: z.string(),
  number: z.number(),
  text: z.string(),
  inventionId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const BatchUpdateResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    claims: z.array(ClaimSchema),
  }),
});

const AddClaimResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    claims: z.array(ClaimSchema),
  }),
});

export type Claim = z.infer<typeof ClaimSchema>;
// Keep the original interface for external API
export type BatchUpdateResponse = {
  claims: Array<{
    number: number;
    id: string;
    text: string;
    inventionId: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

interface BatchUpdateNumbersParams {
  inventionId: string;
  updates: Array<{
    claimId: string;
    newNumber: number;
  }>;
}

interface AddClaimParams {
  number: number;
  text: string;
}

/**
 * Service layer for claims-related API operations
 */
export class ClaimsApiService {
  /**
   * Batch update claim numbers
   */
  static async batchUpdateNumbers(
    params: BatchUpdateNumbersParams
  ): Promise<BatchUpdateResponse> {
    try {
      const response = await apiFetch('/api/claims/batch-update-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          error.message || 'Failed to update claim numbers'
        );
      }

      const data = await response.json();
      const validated = validateApiResponse(data, BatchUpdateResponseSchema);
      return validated.data;
    } catch (error) {
      logger.error('[ClaimsApiService] Failed to batch update numbers', {
        error,
      });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Failed to update claim numbers'
      );
    }
  }

  /**
   * Add a new claim to a project
   */
  static async addClaim(
    projectId: string,
    params: AddClaimParams
  ): Promise<Claim> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.LIST(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ claims: [params] }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          error.message || 'Failed to add claim'
        );
      }

      const data = await response.json();
      const validated = validateApiResponse(data, AddClaimResponseSchema);
      // Return the first claim for convenience
      return validated.data.claims[0];
    } catch (error) {
      logger.error('[ClaimsApiService] Failed to add claim', { error });
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Failed to add claim'
      );
    }
  }
}
