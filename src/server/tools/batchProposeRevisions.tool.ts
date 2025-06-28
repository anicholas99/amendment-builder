import { ClaimRepository } from '@/repositories/claimRepository';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { proposeClaimRevision, ClaimRevision } from './proposeClaimRevision.tool';

export interface BatchRevisionResult {
  revisions: ClaimRevision[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Propose revisions for multiple claims at once
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 * 
 * This tool batch processes multiple claims through the revision engine,
 * allowing users to apply the same instruction to multiple claims efficiently.
 */
export async function batchProposeRevisions(
  projectId: string,
  tenantId: string,
  claimIds: string[],
  instruction: string
): Promise<BatchRevisionResult> {
  logger.info('[BatchProposeRevisionsTool] Starting batch revision', {
    projectId,
    claimCount: claimIds.length,
    instruction,
  });

  try {
    // Validate all claims belong to tenant
    const claims = await ClaimRepository.findByIds(claimIds, tenantId);
    if (!claims || claims.length !== claimIds.length) {
      const foundIds = new Set(claims.map(c => c.id));
      const missingIds = claimIds.filter(id => !foundIds.has(id));
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Some claims not found or access denied: ${missingIds.join(', ')}`
      );
    }

    // Process claims in parallel for efficiency
    const revisionPromises = claimIds.map(claimId => 
      proposeClaimRevision(projectId, tenantId, claimId, instruction)
        .catch(error => {
          logger.error('[BatchProposeRevisionsTool] Failed to revise claim', {
            claimId,
            error,
          });
          return null; // Return null for failed revisions
        })
    );

    const results = await Promise.all(revisionPromises);
    
    // Filter out failed revisions
    const successfulRevisions = results.filter((r): r is ClaimRevision => r !== null);
    
    return {
      revisions: successfulRevisions,
      summary: {
        total: claimIds.length,
        successful: successfulRevisions.length,
        failed: claimIds.length - successfulRevisions.length,
      },
    };
  } catch (error) {
    logger.error('[BatchProposeRevisionsTool] Failed to batch propose revisions', {
      projectId,
      error,
    });
    throw error;
  }
} 