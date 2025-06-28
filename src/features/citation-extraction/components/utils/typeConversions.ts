import { CitationJob } from '@prisma/client';
import { LocalEnhancedJob } from '../types/CitationsTabTypes';

/**
 * Convert a LocalEnhancedJob (with string dates) to CitationJob format (with Date objects)
 */
export function convertLocalJobToCitationJob(
  localJob: LocalEnhancedJob
): CitationJob {
  return {
    id: localJob.id,
    searchHistoryId: localJob.searchHistoryId,
    status: localJob.status,
    externalJobId: localJob.externalJobId,
    referenceNumber: localJob.referenceNumber,
    createdAt: new Date(localJob.createdAt),
    updatedAt: new Date(localJob.updatedAt),
    startedAt: localJob.startedAt ? new Date(localJob.startedAt) : null,
    completedAt: localJob.completedAt ? new Date(localJob.completedAt) : null,
    error: localJob.error,
    deepAnalysisJson: localJob.deepAnalysisJson || null,
    claimSetVersionId: localJob.claimSetVersionId || '',
    rawResultData: localJob.rawResultData || null,
    errorMessage: localJob.errorMessage || null,
    lastCheckedAt: localJob.lastCheckedAt
      ? new Date(localJob.lastCheckedAt)
      : null,
    examinerAnalysisJson: null,
  } as CitationJob;
}

/**
 * Convert an array of LocalEnhancedJob to CitationJob array
 */
export function convertLocalJobsToCitationJobs(
  localJobs: LocalEnhancedJob[]
): CitationJob[] {
  return localJobs.map(convertLocalJobToCitationJob);
}
