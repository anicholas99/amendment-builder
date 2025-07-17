/**
 * Citation Repository
 *
 * Main entry point for citation-related data access.
 * This file re-exports functions from the consolidated repositories for convenience.
 *
 * NOTE: This aggregator will be deprecated in favor of direct imports.
 * New code should import directly from citationJobRepository or citationMatchRepository.
 */

import { logger } from '@/server/logger';

// Re-export citation job functions from the consolidated repository
export {
  create as createCitationJob,
  findManyBySearchHistory as getCitationJobsBySearchHistoryId,
  findWithTenantInfo as getCitationJobWithTenantInfo,
  findWithResult as getCitationJobWithResult,
  findDeepAnalysisByIds as getCitationJobsDeepAnalysisByIds,
  findByReferenceAndSearch as findCitationJobsByReferenceAndSearch,
  getStatistics as getCitationJobStatistics,
  findWithExaminerAnalysis as findCitationJobWithExaminerAnalysis,
  findWithFullDetailsForExaminerAnalysis as getCitationJobWithFullDetailsForExaminerAnalysis,
  findWithDeepAnalysis as getCitationJobsWithDeepAnalysis,
  // Consolidated functions from citationCoreRepository
  saveCitationResult,
} from './citationJobRepository';

// Re-export citation match functions from the consolidated repository
export {
  updateCitationMatchLocationJob,
  updateCitationMatchLocationSuccess,
  updateCitationMatchLocationFailure,
  updateCitationMatchReasoningSuccess,
  updateCitationMatchReasoningFailure,
  updateCitationMatchReasoningStatus,
  countCitationMatchesByJobId,
  findMatchesWithReasoning,
  findBySearchHistory,
  getCitationMatchForReasoning,
  findTopCitationMatchesForReasoning,
  getCitationMatchWithTenantInfo,
  validateCitationMatchExists,
  markCitationMatchesAsFailed,
  getCitationMatchByLocationJobId,
  deleteCitationMatchesByJobAndVersion,
  // Consolidated functions from citationCoreRepository
  deleteCitationMatchesByJobId,
  createCitationMatches,
  getCitationMatchesByJobId,
  // Consolidated functions from citationQueryRepository
  findCitationMatchesBySearchWithOptions,
  // Consolidated functions from citationReasoningRepository
  getSearchHistoryForReasoning,
  getProjectForReasoning,
} from './citationMatchRepository';

// Re-export types and utilities from the utils module
export type {
  TransactionClient,
  CitationMatchData,
  PatentMetadata,
  DeepAnalysisInput,
  CitationMatchWithJob,
  PlaceholderMatch,
  ConsolidationResult,
} from './citationUtils';

export {
  consolidateCitationResults,
  parseCitationResults,
  extractCitationMatches,
  normalizeCitationScore,
} from './citationUtils';

// Note: Deprecated functions have been removed. Use the service layer directly:
// - For citation job operations, use src/server/services/citations.server.service.ts
// - For citation processing, use src/server/services/citation-processing.server-service.ts

export const getCitationJobDetailsForRetry = async (jobId: string) => {
  const { findById } = await import('./citationJobRepository');
  logger.warn(
    'DEPRECATED: getCitationJobDetailsForRetry called via aggregator. Use findById directly.',
    { jobId }
  );
  return await findById(jobId);
};

export const saveCitationResultsAndConsolidate = async (
  jobId: string,
  resultsData: string | null,
  searchInputs: string[],
  jobStatus: string,
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  // Import and create an instance of the service
  const { CitationProcessingService } = await import(
    '@/server/services/citation-processing.server-service'
  );

  logger.warn(
    'DEPRECATED: saveCitationResultsAndConsolidate called via aggregator. Use CitationProcessingService directly.',
    {
      jobId,
      jobStatus,
    }
  );

  // Create a new instance of the service
  const citationProcessingService = new CitationProcessingService();

  return await citationProcessingService.processCitationResults({
    jobId,
    resultsData,
    searchInputs,
    jobStatus,
    errorMessage,
  });
};
