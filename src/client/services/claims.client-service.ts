import { logger } from '@/lib/monitoring/logger';
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  ParseClaimResponseV2,
  GenerateQueriesResponseV2,
} from '@/types/api/responses';

/**
 * API client functions for parsing and generating claims.
 */
export class ClaimsClientService {
  /**
   * Parses a claim into elements using the LLM service.
   * This will also update the parsedElementsJson field in the claim set version.
   *
   * @param claimText - The text of claim 1 to parse
   * @param projectId - The project ID
   * @param allClaims - Optional object containing all claims in format {"1": "text", "2": "text"}
   * @param background - Whether to process variants in the background (faster UI response) - defaults to true
   * @returns The parsed claim elements
   */
  static async parseClaimElements(
    claimText: string,
    projectId: string,
    claimSetVersionId?: string,
    allClaims?: Record<string, string>,
    background: boolean = true
  ): Promise<unknown> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    if (!claimText?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Claim text is required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.PARSE(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            claimOneText: claimText,
            claimSetVersionId,
            allClaims,
            background, // Pass the background flag to API
          }),
        }
      );

      const result = await response.json();

      // Check if we have a valid response with parsedElements
      if (!result || !result.parsedElements) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          'Failed to parse claim - invalid response'
        );
      }

      return result.parsedElements;
    } catch (error: unknown) {
      logger.error('Error parsing claim elements', { error });

      // If it's already an ApplicationError, just re-throw it
      if (error instanceof ApplicationError) {
        throw error;
      }

      // Otherwise wrap it
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to parse claim elements';
      throw new ApplicationError(ErrorCode.API_NETWORK_ERROR, errorMessage);
    }
  }

  /**
   * Generate search queries based on parsed elements.
   *
   * @param parsedElements - The parsed claim elements
   * @param projectId - The project ID
   * @returns The generated search queries
   */
  static async generateSearchQueries(
    parsedElements: unknown[],
    projectId: string
  ): Promise<string[]> {
    if (!parsedElements || !parsedElements.length || !projectId) {
      throw new Error(
        'Parsed elements and project ID are required to generate search queries'
      );
    }

    try {
      // Fetch invention data for better context
      let inventionData = null;
      try {
        const inventionResponse = await apiFetch(
          API_ROUTES.PROJECTS.INVENTION(projectId)
        );
        inventionData = await inventionResponse.json();
        logger.debug('Fetched invention data for query generation', {
          projectId,
          hasInventionData: !!inventionData,
          inventionDataKeys: inventionData ? Object.keys(inventionData) : [],
        });
      } catch (inventionError) {
        // If invention data fetch fails, continue without it
        logger.warn(
          'Failed to fetch invention data for query generation, proceeding without context',
          {
            projectId,
            error: inventionError,
          }
        );
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.GENERATE_QUERIES(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parsedElements,
            inventionData, // Now passing invention data for better context
          }),
        }
      );

      const result = await response.json();
      return result.searchQueries || result.queries || [];
    } catch (error) {
      logger.error('Error generating search queries', { error });
      throw error;
    }
  }

  /**
   * Generates a new claim 1 based on invention data.
   * @param projectId - The project ID
   * @param inventionData - The invention data (not sent to API, kept for interface compatibility)
   * @returns The generated claim text
   */
  static async generateClaim1(
    projectId: string,
    inventionData: Record<string, unknown>
  ): Promise<{ claim: string }> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.GENERATE_CLAIM1(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Empty body - projectId is now in URL
        }
      );

      return await response.json();
    } catch (error) {
      logger.error('Error generating claim 1', { error });
      throw error;
    }
  }

  // ============================================================================
  // V2 Methods - Simplified string array format
  // ============================================================================

  /**
   * V2: Parses a claim into simple string elements.
   *
   * @param claimText - The claim text to parse
   * @param projectId - The project ID
   * @returns Array of claim element strings
   */
  static async parseClaimElementsV2(
    claimText: string,
    projectId: string
  ): Promise<string[]> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    if (!claimText?.trim()) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Claim text is required'
      );
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.V2.PARSE(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            claimText,
            projectId,
          }),
        }
      );

      const result: ParseClaimResponseV2 = await response.json();

      // Validate response
      if (!result || !result.elements || !Array.isArray(result.elements)) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          'Failed to parse claim - invalid response'
        );
      }

      return result.elements;
    } catch (error: unknown) {
      logger.error('Error parsing claim elements V2', { error });

      if (error instanceof ApplicationError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to parse claim elements';
      throw new ApplicationError(ErrorCode.API_NETWORK_ERROR, errorMessage);
    }
  }

  /**
   * V2: Generate search queries from simple string elements.
   *
   * @param elements - Array of claim element strings
   * @param projectId - The project ID
   * @returns The generated search queries
   */
  static async generateSearchQueriesV2(
    elements: string[],
    projectId: string
  ): Promise<string[]> {
    if (!elements || !elements.length || !projectId) {
      throw new Error(
        'Elements and project ID are required to generate search queries'
      );
    }

    try {
      // Fetch invention data for better context
      let inventionData = null;
      try {
        const inventionResponse = await apiFetch(
          API_ROUTES.PROJECTS.INVENTION(projectId)
        );
        inventionData = await inventionResponse.json();
        logger.debug('Fetched invention data for V2 query generation', {
          projectId,
          hasInventionData: !!inventionData,
        });
      } catch (inventionError) {
        logger.warn(
          'Failed to fetch invention data for V2 query generation, proceeding without context',
          {
            projectId,
            error: inventionError,
          }
        );
      }

      const response = await apiFetch(
        API_ROUTES.PROJECTS.CLAIMS.V2.GENERATE_QUERIES(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            elements,
            inventionData,
          }),
        }
      );

      const result: GenerateQueriesResponseV2 = await response.json();

      logger.debug('V2 query generation response', {
        result,
        hasSearchQueries: 'searchQueries' in result,
        searchQueriesLength: result.searchQueries?.length,
      });

      return result.searchQueries;
    } catch (error) {
      logger.error('Error generating V2 search queries', { error });
      throw error;
    }
  }
}
