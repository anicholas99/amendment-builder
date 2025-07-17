import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ClaimRepository } from '@/repositories/claimRepository';
import { inventionRepository } from '@/repositories/inventionRepository';
import { upsertDraftDocument } from '@/repositories/project/draft.repository';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';

/**
 * Updates the CLAIMS section in the patent application document
 * by syncing from the claim refinement system
 *
 * This is different from addClaims which adds claims to the refinement system.
 * This tool updates the actual patent document's CLAIMS section.
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function updatePatentClaims(
  projectId: string,
  tenantId: string
): Promise<{
  success: boolean;
  claimCount: number;
  message: string;
  documentSection: string;
  syncTrigger?: {
    projectId: string;
    sectionType: string;
    timestamp: number;
  };
}> {
  logger.info('[UpdatePatentClaimsTool] Syncing claims to patent document', {
    projectId,
  });

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get invention
    const invention = await inventionRepository.findByProjectId(projectId);
    if (!invention) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'No invention found for this project. Create an invention first.'
      );
    }

    // Get claims from the refinement system
    const claims = await ClaimRepository.findByInventionId(invention.id);

    let claimsContent: string;
    if (!claims || claims.length === 0) {
      claimsContent =
        'What is claimed is:\n\n[No claims have been defined yet. Use the claim refinement feature to draft claims.]';
    } else {
      // Format claims in standard patent format
      const formattedClaims = claims
        .sort((a, b) => a.number - b.number)
        .map(claim => `${claim.number}. ${claim.text}`)
        .join('\n\n');

      claimsContent = `What is claimed is:\n\n${formattedClaims}`;
    }

    // Update the CLAIMS section in the patent document
    await upsertDraftDocument(projectId, 'CLAIMS', claimsContent);

    logger.info(
      '[UpdatePatentClaimsTool] Successfully updated CLAIMS section',
      {
        projectId,
        claimCount: claims.length,
      }
    );

    return {
      success: true,
      claimCount: claims.length,
      message:
        claims.length > 0
          ? `Successfully updated the CLAIMS section with ${claims.length} claim${claims.length !== 1 ? 's' : ''}`
          : 'CLAIMS section updated with placeholder text (no claims defined yet)',
      documentSection: claimsContent,
      syncTrigger: {
        projectId,
        sectionType: 'CLAIMS',
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    logger.error('[UpdatePatentClaimsTool] Failed to update patent claims', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Alternative: Add claims directly to the patent document's CLAIMS section
 * without using the claim refinement system
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function setPatentClaimsDirectly(
  projectId: string,
  tenantId: string,
  claimsText: string
): Promise<{
  success: boolean;
  message: string;
  documentSection: string;
  syncTrigger?: {
    projectId: string;
    sectionType: string;
    timestamp: number;
  };
}> {
  logger.info(
    '[SetPatentClaimsDirectlyTool] Setting claims directly in patent document',
    {
      projectId,
      contentLength: claimsText.length,
    }
  );

  try {
    // Verify project and tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Format the claims section
    let claimsContent = claimsText.trim();

    // Ensure it starts with standard claim language if not already present
    const standardHeaders = [
      'what is claimed is:',
      'i claim:',
      'we claim:',
      'claims:',
    ];
    const hasHeader = standardHeaders.some(header =>
      claimsContent.toLowerCase().startsWith(header)
    );

    if (!hasHeader) {
      claimsContent = `What is claimed is:\n\n${claimsContent}`;
    }

    // Update the CLAIMS section in the patent document
    await upsertDraftDocument(projectId, 'CLAIMS', claimsContent);

    logger.info(
      '[SetPatentClaimsDirectlyTool] Successfully set CLAIMS section',
      {
        projectId,
      }
    );

    return {
      success: true,
      message: 'Successfully updated the CLAIMS section in the patent document',
      documentSection: claimsContent,
      syncTrigger: {
        projectId,
        sectionType: 'CLAIMS',
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    logger.error('[SetPatentClaimsDirectlyTool] Failed to set patent claims', {
      projectId,
      error,
    });
    throw error;
  }
}
