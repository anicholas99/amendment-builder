/**
 * Client-side API service for claim operations.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';

export class ClaimApiService {
  static async updateClaim(
    projectId: string,
    claimId: string,
    text: string
  ): Promise<any> {
    try {
      const response = await apiFetch(API_ROUTES.CLAIMS.DETAILS(claimId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update claim: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[ClaimApiService] Error updating claim', {
        projectId,
        claimId,
        error,
      });
      throw error;
    }
  }

  static async deleteClaim(
    claimId: string,
    renumber: boolean = false
  ): Promise<any> {
    try {
      const url = renumber
        ? `${API_ROUTES.CLAIMS.DETAILS(claimId)}?renumber=true`
        : API_ROUTES.CLAIMS.DETAILS(claimId);

      const response = await apiFetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to delete claim: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[ClaimApiService] Error deleting claim', {
        claimId,
        renumber,
        error,
      });
      throw error;
    }
  }

  static async mirrorClaims(
    projectId: string,
    claimIds: string[],
    targetType: 'system' | 'method' | 'apparatus' | 'process' | 'crm'
  ): Promise<any> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.MIRROR(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ claimIds, targetType }),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to mirror claims: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[ClaimApiService] Error mirroring claims', {
        projectId,
        claimIds,
        targetType,
        error,
      });
      throw error;
    }
  }
}

class ClaimClientService {
  /**
   * Placeholder for parsing a claim.
   * TODO: Implement the actual API call.
   */
  async parseClaim(claimText: string): Promise<any> {
    logger.info('[ClaimClientService] parseClaim called (placeholder)', {
      claimText,
    });
    return Promise.resolve({ parsed: 'placeholder' });
  }
}

// Export the class for context-based instantiation
export { ClaimClientService };

// REMOVED: Singleton export that could cause session isolation issues
