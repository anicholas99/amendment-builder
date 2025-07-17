import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES, buildApiUrl } from '@/constants/apiRoutes';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { z } from 'zod';
import { CitationMatchSchema, DeepAnalysisSchema } from '@/types/api/citation';

// Response schema for top citation matches
const TopCitationMatchesResponseSchema = z.object({
  groupedResults: z.array(
    z.object({
      elementText: z.string(),
      matches: z.array(CitationMatchSchema),
    })
  ),
  totalMatches: z.number(),
  deepAnalysisSummary: z
    .object({
      overallAssessment: DeepAnalysisSchema,
      holisticAnalysis: z.string(),
    })
    .nullable()
    .optional(),
});

export type TopCitationMatchesResponse = z.infer<
  typeof TopCitationMatchesResponseSchema
>;

export const CitationApiService = {
  /**
   * Fetches top citation matches from deep analysis
   * @param searchHistoryId The search history ID
   * @param referenceNumber Optional reference number to filter by
   */
  async getTopCitationMatches(
    searchHistoryId: string,
    referenceNumber?: string
  ): Promise<TopCitationMatchesResponse> {
    const params: Record<string, string> = { searchHistoryId };
    if (referenceNumber) {
      params.referenceNumber = referenceNumber;
    }

    const url = buildApiUrl(API_ROUTES.CITATION_MATCHES.TOP_RESULTS, params);
    const response = await apiFetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch top citation matches: ${response.statusText}`
      );
    }

    const data = await response.json();
    return validateApiResponse(data, TopCitationMatchesResponseSchema);
  },

  /**
   * Fetches citation matches by search (legacy endpoint)
   * @param searchHistoryId The search history ID
   * @param includeMetadataForAllReferences Whether to include metadata for all references
   */
  async getCitationMatchesBySearch(
    searchHistoryId: string,
    includeMetadataForAllReferences = false
  ): Promise<any> {
    const params = {
      searchHistoryId,
      includeMetadataForAllReferences:
        includeMetadataForAllReferences.toString(),
    };

    const url = buildApiUrl(API_ROUTES.CITATION_MATCHES.BY_SEARCH, params);
    const response = await apiFetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch citation matches: ${response.statusText}`
      );
    }

    return response.json();
  },
};
