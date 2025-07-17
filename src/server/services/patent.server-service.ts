/**
 * Server-side service for handling patent-related operations.
 *
 * This service acts as a wrapper around the Patbase API client,
 * centralizing all logic for fetching and processing patent data from
 * the external Patbase service. This ensures that our API routes remain
 * "thin controllers" and that all interactions with the third-party API
 * are handled consistently.
 */
import { callPatbaseApi, authenticatePatbase } from '@/lib/api/patbase';
import { enrichPatentMetadata } from '@/lib/clients/patbase/patbaseClient';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  formatPatbaseDate,
  stripHtmlTags,
} from '@/features/search/utils/patbase-utils';
import { PriorArtReference } from '@/types/claimTypes';
import {
  mapToUnifiedPriorArt,
  mapToPriorArtReference,
} from '@/utils/typeMappers';
import { ProjectService } from './project.server-service';
import { PatBaseGetMemberResult } from '@/types/patbaseTypes';

export class PatentServerService {
  /**
   * Fetches patent details from the Patbase API by patent number.
   *
   * @param patentNumber - The patent number to look up.
   * @returns The patent data from the Patbase API.
   */
  static async getPatentByNumber(patentNumber: string): Promise<any> {
    logger.debug(
      `[PatentServerService] Fetching patent by number: ${patentNumber}`
    );

    if (!patentNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Patent number is required.'
      );
    }

    try {
      const patentData = await callPatbaseApi('getpublication', {
        number: patentNumber,
        format: 'json',
      });
      logger.info(
        `[PatentServerService] Successfully fetched patent: ${patentNumber}`
      );
      return patentData;
    } catch (error) {
      logger.error(
        `[PatentServerService] Error fetching patent ${patentNumber}`,
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );

      // Re-throw the error as a standardized application error
      // to be handled by the middleware.
      throw new ApplicationError(
        ErrorCode.CITATION_EXTERNAL_API_ERROR,
        `Failed to fetch patent data for ${patentNumber} from Patbase.`
      );
    }
  }

  /**
   * Enhances a search query using the Patbase API.
   *
   * @param query - The search query to enhance.
   * @returns The enhanced query suggestions from the Patbase API.
   */
  static async enhanceSearchQuery(query: string): Promise<any> {
    logger.debug(`[PatentServerService] Enhancing search query`);

    if (!query) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Search query is required.'
      );
    }

    try {
      const enhancedQueryData = await callPatbaseApi('enhanceSearch', {
        query,
      });
      logger.info(`[PatentServerService] Successfully enhanced search query.`);
      return enhancedQueryData;
    } catch (error) {
      logger.error(`[PatentServerService] Error enhancing search query`, {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to enhance search query using Patbase.`
      );
    }
  }

  /**
   * Fetches basic bibliographic info for a list of patent references.
   * This method encapsulates the multi-step process of querying Patbase
   * and parsing the results for multiple patents.
   *
   * @param references - An array of patent reference numbers.
   * @returns A promise that resolves to an array of enhanced patent data.
   */
  static async getBulkPatentBasicInfo(references: string[]): Promise<any[]> {
    logger.debug(`[PatentServerService] Fetching bulk patent info`, {
      count: references.length,
    });

    if (!references || references.length === 0) {
      return [];
    }

    // The patbaseApiClient handles its own authentication and session management.
    // We can process all references in parallel.
    const results = await Promise.all(
      references.map(reference =>
        this.getSinglePatentBasicInfo(reference).catch(error => ({
          referenceNumber: reference,
          error: `Failed to process: ${error.message}`,
          found: false,
        }))
      )
    );

    logger.info(`[PatentServerService] Finished processing bulk patent info`, {
      total: references.length,
      found: results.filter(r => r.found).length,
    });

    return results;
  }

  /**
   * Helper method to get basic info for a single patent.
   * Encapsulates the two-step query -> searchresultsbib flow.
   *
   * @param reference - A single patent reference number.
   * @returns The enhanced patent data.
   */
  private static async getSinglePatentBasicInfo(
    reference: string
  ): Promise<any> {
    const cleanedReference = reference.trim().replace(/\s+/g, '');
    const encodedQuery = encodeURIComponent(`PN=${cleanedReference}`);

    // Step 1: Query PatBase to get a QueryKey
    const queryData = await callPatbaseApi<any>('query', {
      query: encodedQuery,
    });

    if (!queryData?.QueryKey) {
      logger.warn(
        `[PatentServerService] No QueryKey found for reference: ${reference}`
      );
      return {
        referenceNumber: reference,
        error: 'Patent not found via PN query',
        found: false,
      };
    }

    const { QueryKey } = queryData;

    // Step 2: Use the QueryKey to get the bibliographic data
    const resultsData = await callPatbaseApi<any>('searchresultsbib', {
      querykey: QueryKey,
      from: '1',
      to: '1',
    });

    if (!resultsData?.Families?.length) {
      logger.warn(
        `[PatentServerService] No family results found for QueryKey: ${QueryKey}`
      );
      return {
        referenceNumber: reference,
        error: 'No family results found for QueryKey',
        found: false,
      };
    }

    // Extract basic info from the first family
    const family = resultsData.Families[0];
    const publication = family?.Publications?.[0] || {};
    const title = family?.Titles?.[0]?.Title || '';
    const assignee = family?.Assignees?.[0]?.PA || '';
    const abstractText = family?.Abstracts?.[0]?.AB || '';
    const publicationDate = publication?.PD
      ? formatPatbaseDate(publication.PD)
      : '';

    return {
      referenceNumber: reference,
      title: stripHtmlTags(title),
      abstract: stripHtmlTags(abstractText),
      publicationDate,
      assignee,
      found: true,
    };
  }

  /**
   * Enriches a list of patent references with additional metadata from Patbase.
   *
   * @param patents - An array of patent references to enrich.
   * @returns A promise that resolves to an array of enriched patent data.
   */
  static async enrichPatents(
    patents: PriorArtReference[]
  ): Promise<PriorArtReference[]> {
    logger.debug(`[PatentServerService] Enriching ${patents.length} patents`);

    if (!patents || patents.length === 0) {
      return [];
    }

    try {
      // Map to the canonical type expected by the client function
      const unifiedPatents = patents.map(mapToUnifiedPriorArt);

      // The client function handles the concurrency and error handling per patent.
      const enrichedResults = await enrichPatentMetadata(unifiedPatents);

      // Map back to the type expected by the API route
      const finalResults = enrichedResults.map(mapToPriorArtReference);

      logger.info(
        `[PatentServerService] Successfully enriched ${finalResults.length} patents.`
      );
      return finalResults;
    } catch (error) {
      logger.error(
        `[PatentServerService] Error during patent enrichment process`,
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );

      throw new ApplicationError(
        ErrorCode.CITATION_EXTERNAL_API_ERROR,
        `Failed to enrich patents using Patbase.`
      );
    }
  }

  /**
   * Fetches claim1 and summary for a patent from PatBase.
   * Used for enriching prior art references when generating patents.
   *
   * @param patentNumber - The patent number to fetch data for
   * @returns Object with claim1 and summary, or null values if not found
   */
  static async fetchClaim1AndSummary(
    patentNumber: string
  ): Promise<{ claim1: string | null; summary: string | null }> {
    try {
      // Clean up patent number for PatBase query
      const cleanedNumber = patentNumber.trim().replace(/\s+/g, '');

      logger.info(
        `[PatentServerService] Fetching claim1 and summary for ${cleanedNumber}`
      );

      // Try to get the patent full text using getmember API
      const sessionToken = await authenticatePatbase();
      const memberData = await callPatbaseApi<PatBaseGetMemberResult>(
        'getmember',
        {
          pn: cleanedNumber,
          ft: 'true', // Request full text
        },
        { sessionToken }
      );

      if (!memberData?.FullText?.[0]) {
        logger.warn(
          `[PatentServerService] No full text data found for ${cleanedNumber}`
        );
        return { claim1: null, summary: null };
      }

      const fullText = memberData.FullText[0];

      // Extract claim 1
      let claim1: string | null = null;
      if (
        fullText.Claims &&
        Array.isArray(fullText.Claims) &&
        fullText.Claims.length > 0
      ) {
        // Simply join all claims and take the first portion
        const claimsText = fullText.Claims.join('\n');
        if (claimsText && claimsText.trim()) {
          claim1 = stripHtmlTags(claimsText.trim());
          // Limit to 1000 chars - this will naturally capture claim 1
          // since it appears first in the claims text
          if (claim1.length > 1000) {
            claim1 = claim1.substring(0, 997) + '...';
          }
          logger.debug(
            `[PatentServerService] Claims text captured for ${cleanedNumber}, length: ${claim1.length}`
          );
        }
      }

      // Extract summary from abstract or first part of description
      let summary: string | null = null;
      if (
        fullText.Abstracts &&
        Array.isArray(fullText.Abstracts) &&
        fullText.Abstracts.length > 0
      ) {
        summary = stripHtmlTags(fullText.Abstracts.join(' ').trim());
        // Limit to 500 chars for token efficiency
        if (summary.length > 500) {
          summary = summary.substring(0, 497) + '...';
        }
      } else if (
        fullText.Descriptions &&
        Array.isArray(fullText.Descriptions) &&
        fullText.Descriptions.length > 0
      ) {
        // Use first paragraph of description as summary if no abstract
        const firstParagraph = fullText.Descriptions[0];
        if (firstParagraph) {
          summary = stripHtmlTags(firstParagraph.trim());
          // Limit to 500 chars
          if (summary.length > 500) {
            summary = summary.substring(0, 497) + '...';
          }
        }
      }

      logger.info(
        `[PatentServerService] Successfully fetched data for ${cleanedNumber}`,
        {
          hasClaim1: !!claim1,
          hasSummary: !!summary,
        }
      );

      return { claim1, summary };
    } catch (error) {
      logger.error(
        `[PatentServerService] Error fetching claim1/summary for ${patentNumber}:`,
        {
          error: error instanceof Error ? error : new Error(String(error)),
        }
      );
      // Return nulls on error - we don't want to block patent generation
      return { claim1: null, summary: null };
    }
  }
}
