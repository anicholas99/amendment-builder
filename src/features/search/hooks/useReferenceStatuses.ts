import { useMemo } from 'react';
import { CitationJob } from '@/types/citation';
import { ReferenceJobStatus } from '../../search/components/CitationTabHeader';
import { logger } from '@/lib/monitoring/logger';
import { hasProperty } from '@/types/safe-type-helpers';

// Pattern: Dynamic property access → define extended interface
interface CitationJobWithOptimistic extends CitationJob {
  isOptimistic?: boolean;
  wasOptimistic?: boolean;
}

interface CitationMatchWithScore {
  referenceNumber: string;
  reasoningScore?: number | null;
}

/**
 * Hook to build a stable list of reference job statuses combining live citationJobs
 * with citationMatch data (for older/legacy references that no longer have jobs).
 * The algorithm preserves original ordering and keeps track of optimistic jobs.
 */
export function useReferenceStatuses(
  citationJobs: CitationJob[] | undefined,
  citationMatchesData: Array<CitationMatchWithScore> | undefined
) {
  return useMemo<Array<ReferenceJobStatus & { originalIndex: number }>>(() => {
    // Commented out to reduce console noise - uncomment when debugging
    // logger.debug('[useReferenceStatuses] Calculating statuses', {
    //   jobCount: citationJobs?.length ?? 0,
    //   matchCount: citationMatchesData?.length ?? 0,
    // });

    // First, calculate relevancy scores for each reference
    const relevancyScores = new Map<string, { total: number; count: number }>();

    // Group matches by reference and calculate average score
    citationMatchesData?.forEach(match => {
      if (!match.referenceNumber) return;

      const existing = relevancyScores.get(match.referenceNumber);
      const scores = existing || { total: 0, count: 0 };

      if (
        match.reasoningScore !== null &&
        match.reasoningScore !== undefined &&
        match.reasoningScore > 0
      ) {
        scores.total += match.reasoningScore;
        scores.count += 1;
      }
      relevancyScores.set(match.referenceNumber, scores);
    });

    // Convert to average scores
    const avgScores = new Map<string, number>();
    relevancyScores.forEach((scores, refNum) => {
      if (scores.count > 0) {
        avgScores.set(refNum, scores.total / scores.count);
      }
    });

    const processed = new Set<string>();
    const result: Array<ReferenceJobStatus & { originalIndex: number }> = [];
    let cursor = 0;

    // 1) Active citation jobs first (retaining incoming order)
    citationJobs?.forEach(job => {
      if (!job.referenceNumber || processed.has(job.referenceNumber)) return;
      let status = job.status.toLowerCase();
      if (status === 'queued' || status === 'created') status = 'processing';

      // Pattern: Safe property access → use type guard
      const isOptimistic =
        hasProperty(job, 'isOptimistic') &&
        typeof job.isOptimistic === 'boolean'
          ? job.isOptimistic
          : false;
      const wasOptimistic =
        hasProperty(job, 'wasOptimistic') &&
        typeof job.wasOptimistic === 'boolean'
          ? job.wasOptimistic
          : false;

      result.push({
        referenceNumber: job.referenceNumber,
        status,
        relevancyScore: avgScores.get(job.referenceNumber) || 0,
        isOptimistic,
        wasOptimistic,
        originalIndex: cursor++,
      });
      processed.add(job.referenceNumber);
    });

    // 2) References that only exist in citationMatchesData
    const uniqueRefsFromMatches = new Set<string>();
    citationMatchesData?.forEach(match => {
      if (match.referenceNumber) {
        uniqueRefsFromMatches.add(match.referenceNumber);
      }
    });

    uniqueRefsFromMatches.forEach(referenceNumber => {
      if (processed.has(referenceNumber)) return;

      result.push({
        referenceNumber,
        status: 'completed',
        relevancyScore: avgScores.get(referenceNumber) || 0,
        isOptimistic: false,
        wasOptimistic: false,
        originalIndex: cursor++,
      });
      processed.add(referenceNumber);
    });

    // Temporarily commented out to reduce console spam during debugging
    // logger.debug('[useReferenceStatuses] Final list with scores', {
    //   count: result.length,
    //   scores: result.map(r => ({
    //     ref: r.referenceNumber,
    //     score: r.relevancyScore,
    //   })),
    // });
    return result;
  }, [citationJobs, citationMatchesData]);
}
