import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES, buildApiUrl } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';

export interface ClaimAmendmentChange {
  type: 'addition' | 'deletion' | 'modification';
  text: string;
  position?: number;
}

export interface ClaimAmendment {
  claimNumber: number;
  originalText: string;
  amendedText: string;
  changes: ClaimAmendmentChange[];
  changeReason: string;
}

export interface AmendmentGenerationResult {
  claims: ClaimAmendment[];
  summary: string;
  generatedAt: Date;
}

export interface GenerateAmendmentsParams {
  projectId: string;
  regenerate?: boolean;
}

export interface UpdateAmendmentParams {
  projectId: string;
  claimNumber: number;
  amendedText: string;
}

export class AmendmentsClientService {
  /**
   * Generate amendments for a project based on Office Action analysis
   */
  static async generateAmendments(
    params: GenerateAmendmentsParams
  ): Promise<AmendmentGenerationResult> {
    try {
      const response = await apiFetch(
        API_ROUTES.AMENDMENTS.CLAIM_AMENDMENTS.GENERATE(params.projectId),
        {
          method: 'POST',
          body: JSON.stringify({ regenerate: params.regenerate })
        }
      );

      const data = await response.json();

      // Handle dual response format - extract the original format for ClaimAmendmentGenerator
      if (data.claims) {
        // New dual format response
        return {
          claims: data.claims,
          summary: data.summary,
          generatedAt: new Date(data.generatedAt),
        };
      } else {
        // Legacy format (shouldn't happen but handle gracefully)
        return data;
      }
    } catch (error) {
      throw new ApplicationError(
        ErrorCode.API_ERROR,
        'Failed to generate amendments',
        error
      );
    }
  }

  /**
   * Get existing amendments for a project and optional office action
   */
  static async getAmendments(
    projectId: string, 
    officeActionId?: string
  ): Promise<AmendmentGenerationResult> {
    try {
      let url = API_ROUTES.AMENDMENTS.CLAIM_AMENDMENTS.GENERATE(projectId);
      
      // Add officeActionId as query parameter if provided
      if (officeActionId) {
        url += `?officeActionId=${encodeURIComponent(officeActionId)}`;
      }
      
      const response = await apiFetch(url, { method: 'GET' });
      const data = await response.json();

      // Handle dual response format - extract the original format for ClaimAmendmentGenerator
      if (data.claims) {
        // New dual format response
        return {
          claims: data.claims,
          summary: data.summary,
          generatedAt: new Date(data.generatedAt),
        };
      } else {
        // Legacy format (shouldn't happen but handle gracefully)
        return data;
      }
    } catch (error) {
      throw new ApplicationError(
        ErrorCode.API_ERROR,
        'Failed to get amendments',
        error
      );
    }
  }

  /**
   * Update a specific claim amendment
   */
  static async updateAmendment(
    params: UpdateAmendmentParams
  ): Promise<AmendmentGenerationResult> {
    try {
      const response = await apiFetch<AmendmentGenerationResult>(
        API_ROUTES.AMENDMENTS.CLAIM_AMENDMENTS.UPDATE(params.projectId, params.claimNumber),
        {
          method: 'PUT',
          body: JSON.stringify({ amendedText: params.amendedText })
        }
      );

      return response;
    } catch (error) {
      throw new ApplicationError(
        ErrorCode.API_ERROR,
        'Failed to update amendment',
        error
      );
    }
  }
}