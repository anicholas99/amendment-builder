import { createHash } from 'crypto';
import { logger } from '@/utils/clientLogger';

/**
 * Current parser version - increment when parsing logic changes
 */
export const CURRENT_PARSER_VERSION = 'v1.0';

/**
 * Generate a SHA-256 hash of claim text for version tracking
 * @param claimText - The claim text to hash
 * @returns SHA-256 hash of the claim text
 */
export function generateClaimHash(claimText: string): string {
  if (!claimText || claimText.trim() === '') {
    throw new Error('Cannot generate hash for empty claim text');
  }

  // Normalize the text by trimming whitespace and converting to lowercase
  const normalizedText = claimText.trim().toLowerCase();

  // Create SHA-256 hash
  const hash = createHash('sha256')
    .update(normalizedText, 'utf8')
    .digest('hex');

  return hash;
}

/**
 * Check if a citation job is stale based on current claim hash
 * @param jobClaimHash - The claim hash stored with the citation job
 * @param currentClaimHash - The current claim hash
 * @param jobParserVersion - The parser version used for the job
 * @returns true if the job is stale and needs re-analysis
 */
export function isCitationJobStale(
  jobClaimHash: string | null | undefined,
  currentClaimHash: string,
  jobParserVersion?: string | null
): boolean {
  // If no hash stored, it's a legacy job - mark as stale
  if (!jobClaimHash) {
    logger.debug(
      '[claimVersioning] Citation job has no claim hash - marking as stale'
    );
    return true;
  }

  // Check if claim text has changed
  if (jobClaimHash !== currentClaimHash) {
    logger.debug('[claimVersioning] Claim hash mismatch - marking as stale', {
      jobHash: jobClaimHash,
      currentHash: currentClaimHash,
    });
    return true;
  }

  // Check if parser version has changed (optional check)
  if (jobParserVersion && jobParserVersion !== CURRENT_PARSER_VERSION) {
    logger.debug(
      '[claimVersioning] Parser version mismatch - marking as stale',
      {
        jobVersion: jobParserVersion,
        currentVersion: CURRENT_PARSER_VERSION,
      }
    );
    return true;
  }

  return false;
}

/**
 * Get stale citation jobs that need re-analysis
 * @param citationJobs - Array of citation jobs to check
 * @param currentClaimHash - Current claim hash
 * @returns Array of stale job IDs
 */
export function getStaleCitationJobs(
  citationJobs: Array<{
    id: string;
    claim1Hash?: string | null;
    parserVersionUsed?: string | null;
    referenceNumber?: string | null;
  }>,
  currentClaimHash: string
): string[] {
  return citationJobs
    .filter(job =>
      isCitationJobStale(
        job.claim1Hash,
        currentClaimHash,
        job.parserVersionUsed
      )
    )
    .map(job => job.id);
}

/**
 * Format stale job information for user display
 * @param staleJobs - Array of stale citation jobs
 * @returns Formatted message for user
 */
export function formatStaleJobsMessage(
  staleJobs: Array<{ referenceNumber?: string | null }>
): string {
  const refs = staleJobs
    .map(job => job.referenceNumber || 'Unknown')
    .filter(ref => ref !== 'Unknown');

  if (refs.length === 0) {
    return 'Some references need to be re-analyzed due to claim changes.';
  }

  if (refs.length === 1) {
    return `Reference ${refs[0]} needs to be re-analyzed due to claim changes.`;
  }

  if (refs.length <= 3) {
    return `References ${refs.join(', ')} need to be re-analyzed due to claim changes.`;
  }

  return `${refs.length} references need to be re-analyzed due to claim changes.`;
}
