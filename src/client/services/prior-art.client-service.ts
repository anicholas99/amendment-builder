/**
 * Prior Art API Service
 *
 * Centralized service for all prior art API interactions.
 * Handles data fetching, transformation, and error handling.
 */

import { logger } from '@/lib/monitoring/logger';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import {
  GetPriorArtResponse,
  GetPriorArtResponseSchema,
  CreatePriorArtResponse,
  DeletePriorArtResponse,
  ClaimRefinementAnalysisParams,
  ClaimRefinementAnalysisResult,
  ClaimRefinementAnalysisResultSchema,
  GetExclusionsResponse,
  GetExclusionsResponseSchema,
  PriorArtAnalysisRequest,
  PriorArtAnalysisResponse,
  GenerateDependentClaimsRequest,
  GenerateDependentClaimsResponse,
  AddSavedPriorArtRequest,
  AddSavedPriorArtResponse,
  AddSavedPriorArtResponseSchema,
  RemoveSavedPriorArtRequest,
  RemoveSavedPriorArtResponse,
  RemoveSavedPriorArtResponseSchema,
  PriorArtAnalysisResponseSchema,
  GenerateDependentClaimsResponseSchema,
} from '@/types/api/responses';
import { PriorArtDataToSave } from '@/types/domain/priorArt';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';

/**
 * Service class for prior art API operations
 */
export class PriorArtApiService {
  /**
   * Fetch all prior art for a project
   */
  static async getProjectPriorArt(
    projectId: string
  ): Promise<GetPriorArtResponse> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PRIOR_ART.LIST(projectId)
    );
    const json = await response.json();
    return validateApiResponse(json, GetPriorArtResponseSchema);
  }

  /**
   * Save new prior art to a project
   */
  static async savePriorArt(
    projectId: string,
    priorArt: PriorArtDataToSave
  ): Promise<CreatePriorArtResponse> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PRIOR_ART.CREATE(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priorArt),
      }
    );
    const json = await response.json();
    // TODO: Create a Zod schema for CreatePriorArtResponse
    return json as CreatePriorArtResponse;
  }

  /**
   * Remove prior art from a project
   */
  static async removePriorArt(
    projectId: string,
    priorArtId: string
  ): Promise<DeletePriorArtResponse> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PRIOR_ART.BY_ID(projectId, priorArtId),
      {
        method: 'DELETE',
      }
    );
    const json = await response.json();
    // TODO: Create a Zod schema for DeletePriorArtResponse
    return json as DeletePriorArtResponse;
  }

  /**
   * Run prior art analysis for claim refinement
   */
  static async analyzePriorArt(
    data: ClaimRefinementAnalysisParams
  ): Promise<ClaimRefinementAnalysisResult> {
    const response = await apiFetch(API_ROUTES.PRIOR_ART.ANALYZE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return validateApiResponse(json, ClaimRefinementAnalysisResultSchema);
  }

  static async generateDependentClaims(
    data: GenerateDependentClaimsRequest
  ): Promise<GenerateDependentClaimsResponse> {
    const response = await apiFetch(API_ROUTES.CLAIMS.GENERATE_DEPENDENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return validateApiResponse(json, GenerateDependentClaimsResponseSchema);
  }

  /**
   * Fetch all project exclusions
   */
  static async getProjectExclusions(
    projectId: string
  ): Promise<GetExclusionsResponse> {
    const response = await apiFetch(API_ROUTES.PROJECTS.EXCLUSIONS(projectId));
    const json = await response.json();
    return validateApiResponse(json, GetExclusionsResponseSchema);
  }

  /**
   * Add patent numbers to a project's exclusion list
   */
  static async addProjectExclusion(
    projectId: string,
    patentNumbers: string[],
    metadata?: Record<string, unknown>
  ): Promise<unknown> {
    const response = await apiFetch(API_ROUTES.PROJECTS.EXCLUSIONS(projectId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patentNumbers, metadata }),
    });
    // TODO: Add schema validation
    return response.json();
  }
}
