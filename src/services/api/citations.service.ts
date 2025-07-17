/**
 * Citation Saving Service
 *
 * Clean, non-blocking service for saving citations to prior art.
 * Follows established service layer patterns with proper error handling.
 */

import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { z } from 'zod';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { formatLocationData } from '@/features/search/utils/citationFormatting';

// Response validation schema
const SaveCitationResponseSchema = z.object({
  success: z.boolean(),
  priorArtId: z.string().optional(),
});

export interface SaveCitationData {
  patentNumber: string;
  title: string;
  publicationDate: string;
  savedCitationsData?: string;
}

export class CitationSaveService {
  /**
   * Save a citation to prior art - fire and forget pattern
   * Returns immediately with success, actual save happens asynchronously
   */
  static async saveCitation(
    projectId: string,
    citationMatch: ProcessedCitationMatch
  ): Promise<void> {
    // Validate inputs
    if (!projectId || !citationMatch) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Invalid parameters for citation save'
      );
    }

    // Prepare citation data
    const citationData = {
      elementText: citationMatch.parsedElementText || '',
      citation: citationMatch.citation || '',
      location: citationMatch.location
        ? formatLocationData(citationMatch.location)
        : citationMatch.locationDataRaw || undefined,
      reasoning: citationMatch.reasoning?.summary || undefined,
    };

    const priorArtData: SaveCitationData = {
      patentNumber: citationMatch.referenceNumber,
      title: citationMatch.referenceTitle || '',
      publicationDate: citationMatch.referencePublicationDate || '',
      savedCitationsData: JSON.stringify([citationData]),
    };

    // Fire the request without awaiting - non-blocking
    this.performSave(projectId, priorArtData).catch(error => {
      // Log error but don't throw - this is fire-and-forget
      logger.error('[CitationSaveService] Background save failed', {
        error,
        projectId,
        patentNumber: priorArtData.patentNumber,
      });
    });

    // Return immediately - UI updates optimistically
    return;
  }

  /**
   * Add a citation to existing prior art
   */
  static async addCitationToExisting(
    projectId: string,
    citationMatch: ProcessedCitationMatch,
    existingCitations: any[]
  ): Promise<void> {
    // Prepare new citation
    const newCitation = {
      elementText: citationMatch.parsedElementText || '',
      citation: citationMatch.citation || '',
      location: citationMatch.location
        ? formatLocationData(citationMatch.location)
        : citationMatch.locationDataRaw || undefined,
      reasoning: citationMatch.reasoning?.summary || undefined,
    };

    // Check for duplicates
    const isDuplicate = existingCitations.some(
      saved =>
        saved.elementText === newCitation.elementText &&
        saved.citation === newCitation.citation
    );

    if (isDuplicate) {
      // Don't save duplicates, just return success
      return;
    }

    // Combine citations
    const updatedCitations = [...existingCitations, newCitation];

    const priorArtData: SaveCitationData = {
      patentNumber: citationMatch.referenceNumber,
      title: citationMatch.referenceTitle || '',
      publicationDate: citationMatch.referencePublicationDate || '',
      savedCitationsData: JSON.stringify(updatedCitations),
    };

    // Fire the request without awaiting
    this.performSave(projectId, priorArtData).catch(error => {
      logger.error('[CitationSaveService] Background update failed', {
        error,
        projectId,
        patentNumber: priorArtData.patentNumber,
      });
    });

    return;
  }

  /**
   * Internal method to perform the actual save
   */
  private static async performSave(
    projectId: string,
    priorArtData: SaveCitationData
  ): Promise<void> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.PRIOR_ART.CREATE(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(priorArtData),
        }
      );

      const data = await response.json();
      validateApiResponse(data, SaveCitationResponseSchema);

      logger.info('[CitationSaveService] Citation saved successfully', {
        projectId,
        patentNumber: priorArtData.patentNumber,
      });
    } catch (error) {
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Failed to save citation',
        500
      );
    }
  }
}
