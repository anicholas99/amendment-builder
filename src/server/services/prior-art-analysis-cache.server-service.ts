import { logger } from '@/server/logger';
import { priorArtAnalysisCacheRepository } from '@/repositories/priorArtAnalysisCacheRepository';
import { FullAnalysisResponse } from '../../types/priorArtAnalysisTypes';

/**
 * Finds a cached prior art analysis result.
 *
 * @param projectId The project ID.
 * @param searchHistoryId The search history ID.
 * @param claim1TextHash The SHA256 hash of the claim 1 text.
 * @returns The cached entry or null if not found or on error.
 */
export async function findAnalysisCache(
  projectId: string,
  searchHistoryId: string,
  claim1TextHash: string
) {
  return priorArtAnalysisCacheRepository.findUnique({
    projectId_searchHistoryId_claim1TextHash: {
      projectId,
      searchHistoryId,
      claim1TextHash,
    },
  });
}

/**
 * Creates or updates a cached prior art analysis result.
 *
 * @param projectId The project ID.
 * @param searchHistoryId The search history ID.
 * @param claim1TextHash The SHA256 hash of the claim 1 text.
 * @param results The full analysis results object to cache.
 */
export async function createOrUpdateAnalysisCache(
  projectId: string,
  searchHistoryId: string,
  claim1TextHash: string,
  results: FullAnalysisResponse
) {
  logger.info(
    `[Cache Service - Upsert] Caching analysis for ${searchHistoryId}, hash ${claim1TextHash.substring(
      0,
      8
    )}`
  );
  await priorArtAnalysisCacheRepository.upsert(
    projectId,
    searchHistoryId,
    claim1TextHash,
    results
  );
}
