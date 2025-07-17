import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ClaimRepository } from '@/repositories/claimRepository';
import { inventionRepository } from '@/repositories/inventionRepository';
import {
  ClaimMirroringService,
  ClaimType,
} from '@/server/services/claim-mirroring.server-service';
import { z } from 'zod';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';

/**
 * Add new claims to a project
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function addClaims(
  projectId: string,
  tenantId: string,
  claims: Array<{ number: number; text: string }>
): Promise<{ success: boolean; claims: any[]; message: string }> {
  logger.info('[AddClaimsTool] Adding claims', {
    projectId,
    claimCount: claims.length,
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

    // Get or create invention
    const invention = await inventionRepository.findByProjectId(projectId);
    if (!invention) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'No invention found for this project. Create an invention first.'
      );
    }

    // Create claims
    const result = await ClaimRepository.createClaimsForInvention(
      invention.id,
      claims
    );

    return {
      success: true,
      claims: result.claims,
      message: `Successfully added ${result.count} claim${result.count > 1 ? 's' : ''}`,
    };
  } catch (error) {
    logger.error('[AddClaimsTool] Failed to add claims', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Edit an existing claim
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function editClaim(
  projectId: string,
  tenantId: string,
  claimId: string,
  newText: string
): Promise<{ success: boolean; claim: any; message: string }> {
  logger.info('[EditClaimTool] Editing claim', {
    projectId,
    claimId,
  });

  try {
    // Verify claim belongs to tenant
    const existingClaims = await ClaimRepository.findByIds([claimId], tenantId);
    if (!existingClaims || existingClaims.length === 0) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Claim not found'
      );
    }

    const existingClaim = existingClaims[0];

    // Update claim (userId not available in tool context, history tracking will be skipped)
    const updatedClaim = await ClaimRepository.update(claimId, newText);

    return {
      success: true,
      claim: updatedClaim,
      message: `Successfully updated claim ${updatedClaim.number}`,
    };
  } catch (error) {
    logger.error('[EditClaimTool] Failed to edit claim', {
      projectId,
      claimId,
      error,
    });
    throw error;
  }
}

/**
 * Delete claims
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function deleteClaims(
  projectId: string,
  tenantId: string,
  claimIds: string[]
): Promise<{ success: boolean; message: string }> {
  logger.info('[DeleteClaimsTool] Deleting claims', {
    projectId,
    claimCount: claimIds.length,
  });

  try {
    // Verify all claims belong to tenant
    for (const claimId of claimIds) {
      const claimTenantId = await ClaimRepository.resolveTenantId(claimId);
      if (claimTenantId && claimTenantId !== tenantId) {
        throw new ApplicationError(
          ErrorCode.PROJECT_ACCESS_DENIED,
          'Access denied to one or more claims'
        );
      }
    }

    // Batch delete claims efficiently
    const deletedCount = await ClaimRepository.deleteMany(claimIds, tenantId);

    return {
      success: true,
      message: `Successfully deleted ${deletedCount} claim${deletedCount !== 1 ? 's' : ''}`,
    };
  } catch (error) {
    logger.error('[DeleteClaimsTool] Failed to delete claims', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Reorder claims by updating claim numbers
 *
 * Intelligently handles reordering:
 * - If moving to an empty number (gap) → claim is simply moved to that number
 * - If moving to an occupied number → the two claims swap positions
 *
 * This allows intuitive reordering where gaps are filled before swapping occurs.
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function reorderClaims(
  projectId: string,
  tenantId: string,
  claim1Id: string,
  claim2Id: string
): Promise<{ success: boolean; message: string }> {
  logger.info('[ReorderClaimsTool] Reordering claims', {
    projectId,
    claim1Id,
    claim2Id,
  });

  try {
    // Fetch both claims
    const claims = await ClaimRepository.findByIds(
      [claim1Id, claim2Id],
      tenantId
    );

    if (!claims || claims.length !== 2) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'One or both claims not found'
      );
    }

    const claim1 = claims.find(c => c.id === claim1Id);
    const claim2 = claims.find(c => c.id === claim2Id);

    if (!claim1 || !claim2) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'One or both claims not found'
      );
    }

    // Swap claim numbers - the repository method handles the transaction and history tracking
    await ClaimRepository.updateClaimNumber(claim1Id, claim2.number);
    // The above will automatically swap the numbers between the two claims

    return {
      success: true,
      message: `Successfully reordered claims ${claim1.number} and ${claim2.number}`,
    };
  } catch (error) {
    logger.error('[ReorderClaimsTool] Failed to reorder claims', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Mirror claims to a different type
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function mirrorClaims(
  projectId: string,
  tenantId: string,
  claimIds: string[],
  targetType: string
): Promise<{ success: boolean; claims: any[]; message: string }> {
  logger.info('[MirrorClaimsTool] Mirroring claims', {
    projectId,
    claimCount: claimIds.length,
    targetType,
  });

  try {
    // Validate target type
    const validTypes = ['system', 'method', 'apparatus', 'process', 'crm'];
    if (!validTypes.includes(targetType)) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        `Invalid target type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    // Mirror claims using existing service
    const mirroredClaims = await ClaimMirroringService.mirrorClaims({
      projectId,
      claimIds,
      targetType: targetType as ClaimType,
      tenantId,
    });

    return {
      success: true,
      claims: mirroredClaims,
      message: `Successfully created ${mirroredClaims.length} ${targetType} claims`,
    };
  } catch (error) {
    logger.error('[MirrorClaimsTool] Failed to mirror claims', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Get all claims for a project
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function getClaims(
  projectId: string,
  tenantId: string
): Promise<{ success: boolean; claims: any[]; message: string }> {
  logger.info('[GetClaimsTool] Getting claims', {
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
      return {
        success: true,
        claims: [],
        message: 'No invention found for this project',
      };
    }

    // Get claims
    const claims = await ClaimRepository.findByInventionId(invention.id);

    return {
      success: true,
      claims: claims,
      message: `Found ${claims.length} claim${claims.length !== 1 ? 's' : ''}`,
    };
  } catch (error) {
    logger.error('[GetClaimsTool] Failed to get claims', {
      projectId,
      error,
    });
    throw error;
  }
}
