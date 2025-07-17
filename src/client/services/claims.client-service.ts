import { logger } from '@/utils/clientLogger';
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { API_ROUTES } from '@/constants/apiRoutes';
import type {
  ParseClaimResponseV2,
  GenerateQueriesResponseV2,
} from '@/types/api/responses';
import type { Claim } from '@prisma/client';

/**
 * API client functions for parsing and generating claims.
 * Uses simplified V2 format (string arrays) for all operations.
 */
export class ClaimsClientService {
  /**
   * Parses a claim into string elements using the LLM service.
   *
   * @param claimText - The text of claim 1 to parse
   * @param projectId - The project ID
   * @param claimSetVersionId - DEPRECATED - no longer used
   * @param allClaims - DEPRECATED - no longer used
   * @param background - DEPRECATED - no longer used
   * @returns Array of claim element strings
   */
  static async parseClaimElements(
    claimText: string,
    projectId: string,
    claimSetVersionId?: string, // Keep for compatibility, but unused
    allClaims?: Record<string, string>, // Keep for compatibility, but unused
    background?: boolean // Keep for compatibility, but unused
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
        API_ROUTES.PROJECTS.CLAIMS.PARSE(projectId),
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

      const result = await response.json();

      // Handle standardized API response format
      if (result.success && result.data) {
        const parseData = result.data;
        // Validate response
        if (
          !parseData ||
          !parseData.elements ||
          !Array.isArray(parseData.elements)
        ) {
          throw new ApplicationError(
            ErrorCode.API_NETWORK_ERROR,
            'Failed to parse claim - invalid response'
          );
        }
        return parseData.elements;
      }

      // Fallback for non-standardized response (backward compatibility)
      if (result.elements && Array.isArray(result.elements)) {
        return result.elements;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        'Failed to parse claim - invalid response format'
      );
    } catch (error: unknown) {
      logger.error('Error parsing claim elements', { error });

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
   * Generate search queries based on parsed elements.
   *
   * @param parsedElements - Array of claim element strings
   * @param projectId - The project ID
   * @returns The generated search queries
   */
  static async generateSearchQueries(
    parsedElements: string[] | unknown[], // Accept both for compatibility
    projectId: string
  ): Promise<string[]> {
    // Ensure we have string array
    const elements = parsedElements.map(el =>
      typeof el === 'string' ? el : String(el)
    );

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
        logger.debug('Fetched invention data for query generation', {
          projectId,
          hasInventionData: !!inventionData,
        });
      } catch (inventionError) {
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
            elements,
            inventionData,
          }),
        }
      );

      const result = await response.json();

      // Handle standardized API response format
      if (result.success && result.data) {
        const queryData = result.data;
        logger.debug('Query generation response', {
          result,
          hasSearchQueries: 'searchQueries' in queryData,
          searchQueriesLength: queryData.searchQueries?.length,
        });
        return queryData.searchQueries;
      }

      // Fallback for non-standardized response (backward compatibility)
      if (result.searchQueries && Array.isArray(result.searchQueries)) {
        logger.debug('Query generation response (legacy format)', {
          result,
          hasSearchQueries: 'searchQueries' in result,
          searchQueriesLength: result.searchQueries?.length,
        });
        return result.searchQueries;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        'Failed to generate search queries - invalid response format'
      );
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

      const result = await response.json();

      // Handle standardized API response format
      if (result.success && result.data) {
        return {
          claim: result.data.claim,
          // Include metadata if present for potential future use
          ...(result.data.metadata && { metadata: result.data.metadata }),
        };
      }

      // Fallback for non-standardized response (backward compatibility)
      if (result.claim) {
        return result;
      }

      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Invalid response format from claim generation API'
      );
    } catch (error) {
      logger.error('Error generating claim 1', { error });
      throw error;
    }
  }

  // Keep V2 methods as aliases for gradual migration
  static parseClaimElementsV2 = ClaimsClientService.parseClaimElements;
  static generateSearchQueriesV2 = ClaimsClientService.generateSearchQueries;

  /**
   * Updates the text of an existing claim
   */
  static async updateClaimText(claimId: string, text: string): Promise<Claim> {
    const response = await apiFetch(`/api/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return response.json();
  }

  /**
   * Updates the number of an existing claim
   */
  static async updateClaimNumber(
    claimId: string,
    number: number
  ): Promise<Claim> {
    const response = await apiFetch(`/api/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
    });
    return response.json();
  }

  /**
   * Deletes a claim by ID
   */
  static async deleteClaim(claimId: string): Promise<void> {
    // Implementation of deleteClaim method
  }
}
