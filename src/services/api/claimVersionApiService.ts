import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';

export interface ClaimVersion {
  id: string;
  inventionId: string;
  userId: string;
  name: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  snapshots?: ClaimSnapshot[];
}

export interface ClaimSnapshot {
  id: string;
  claimVersionId: string;
  number: number;
  text: string;
  createdAt: string;
}

export interface CreateClaimVersionPayload {
  inventionId: string;
  name?: string;
}

export interface RestoreClaimVersionPayload {
  inventionId: string;
}

export class ClaimVersionApiService {
  /**
   * Get all claim versions for an invention
   */
  static async getVersions(inventionId: string): Promise<ClaimVersion[]> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.CLAIMS.VERSIONS}?inventionId=${inventionId}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch claim versions: ${response.status}`
        );
      }

      const data = await response.json();
      return data.data?.versions || [];
    } catch (error) {
      logger.error('[ClaimVersionApiService] Error fetching versions', {
        inventionId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get a specific claim version with its snapshots
   */
  static async getVersion(versionId: string): Promise<ClaimVersion> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.CLAIMS.VERSIONS}/${versionId}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch claim version: ${response.status}`
        );
      }

      const data = await response.json();
      return data.data?.version;
    } catch (error) {
      logger.error('[ClaimVersionApiService] Error fetching version', {
        versionId,
        error,
      });
      throw error;
    }
  }

  /**
   * Create a new claim version
   */
  static async createVersion(
    payload: CreateClaimVersionPayload
  ): Promise<ClaimVersion> {
    try {
      if (!payload.inventionId) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'inventionId is required to create a claim version'
        );
      }

      const response = await apiFetch(API_ROUTES.CLAIMS.VERSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to create claim version: ${response.status}`
        );
      }

      const data = await response.json();
      return data.data?.version;
    } catch (error) {
      logger.error('[ClaimVersionApiService] Error creating version', {
        error,
        inventionId: payload?.inventionId,
      });
      throw error;
    }
  }

  /**
   * Restore claims from a version
   */
  static async restoreVersion(
    versionId: string,
    payload: RestoreClaimVersionPayload
  ): Promise<any[]> {
    try {
      // Extract only the inventionId for the API call, filtering out any extra properties
      const apiPayload: RestoreClaimVersionPayload = {
        inventionId: payload.inventionId,
      };

      const response = await apiFetch(
        `${API_ROUTES.CLAIMS.VERSIONS}/${versionId}?action=restore`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to restore claim version: ${response.status}`
        );
      }

      const data = await response.json();
      return data.data?.claims || [];
    } catch (error) {
      logger.error('[ClaimVersionApiService] Error restoring version', {
        versionId,
        payload,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete a claim version
   */
  static async deleteVersion(versionId: string): Promise<void> {
    try {
      const response = await apiFetch(
        `${API_ROUTES.CLAIMS.VERSIONS}/${versionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to delete claim version: ${response.status}`
        );
      }
    } catch (error) {
      logger.error('[ClaimVersionApiService] Error deleting version', {
        versionId,
        error,
      });
      throw error;
    }
  }
}
