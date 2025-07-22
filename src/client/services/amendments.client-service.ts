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
      const response = await apiFetch<AmendmentGenerationResult>(
        API_ROUTES.AMENDMENTS.CLAIM_AMENDMENTS.GENERATE(params.projectId),
        {
          method: 'POST',
          body: JSON.stringify({ regenerate: params.regenerate })
        }
      );

      return response;
    } catch (error) {
      throw new ApplicationError(
        ErrorCode.API_ERROR,
        'Failed to generate amendments',
        error
      );
    }
  }

  /**
   * Get existing amendments for a project
   */
  static async getAmendments(projectId: string): Promise<AmendmentGenerationResult> {
    try {
      const response = await apiFetch<AmendmentGenerationResult>(
        API_ROUTES.AMENDMENTS.CLAIM_AMENDMENTS.GENERATE(projectId),
        { method: 'GET' }
      );

      return response;
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