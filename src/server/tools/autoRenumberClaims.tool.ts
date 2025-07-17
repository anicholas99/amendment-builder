import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { ClaimRepository } from '@/repositories/claimRepository';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface ClaimRenumberResult {
  success: boolean;
  message: string;
  renumberedClaims: Array<{
    oldNumber: number;
    newNumber: number;
    text: string;
    updatedText?: string;
  }>;
  summary: {
    totalClaims: number;
    claimsRenumbered: number;
    dependenciesUpdated: number;
  };
}

/**
 * Automatically renumbers claims and updates all dependency references
 * 
 * This tool:
 * 1. Identifies gaps in claim numbering
 * 2. Renumbers claims sequentially
 * 3. Updates all "claim X" references in dependent claims
 * 4. Preserves claim hierarchy and relationships
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function autoRenumberClaims(
  projectId: string,
  tenantId: string
): Promise<ClaimRenumberResult> {
  logger.info('[AutoRenumberClaims] Starting claim renumbering', {
    projectId,
    tenantId,
  });

  try {
    // Verify tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    if (!project.invention) {
      return {
        success: true,
        message: 'No invention found for this project',
        renumberedClaims: [],
        summary: {
          totalClaims: 0,
          claimsRenumbered: 0,
          dependenciesUpdated: 0,
        },
      };
    }

    // Get all claims sorted by current number
    const claims = await ClaimRepository.findByInventionId(project.invention.id);
    const sortedClaims = claims.sort((a, b) => a.number - b.number);

    // Create renumbering map
    const renumberMap = new Map<number, number>();
    const renumberedClaims: ClaimRenumberResult['renumberedClaims'] = [];
    let dependenciesUpdated = 0;

    // First pass: determine new numbers
    sortedClaims.forEach((claim, index) => {
      const newNumber = index + 1;
      if (claim.number !== newNumber) {
        renumberMap.set(claim.number, newNumber);
      }
    });

    // If no renumbering needed, return early
    if (renumberMap.size === 0) {
      logger.info('[AutoRenumberClaims] No renumbering needed', {
        projectId,
        totalClaims: sortedClaims.length,
      });
      
      return {
        success: true,
        message: `All ${sortedClaims.length} claims are already numbered sequentially`,
        renumberedClaims: [],
        summary: {
          totalClaims: sortedClaims.length,
          claimsRenumbered: 0,
          dependenciesUpdated: 0,
        },
      };
    }

    // Ensure prisma is initialized (server-side check)
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client not initialized'
      );
    }

    // Second pass: update claims and their dependencies
    await prisma.$transaction(async (tx) => {
      for (const claim of sortedClaims) {
        const newNumber = renumberMap.get(claim.number) || claim.number;
        let updatedText = claim.text;

        // Update dependency references in claim text
        renumberMap.forEach((newNum, oldNum) => {
          // Match various patterns: "claim 1", "claims 1", "Claim 1", etc.
          const patterns = [
            new RegExp(`\\bclaim\\s+${oldNum}\\b`, 'gi'),
            new RegExp(`\\bclaims\\s+${oldNum}\\b`, 'gi'),
            new RegExp(`\\bof\\s+claim\\s+${oldNum}\\b`, 'gi'),
            new RegExp(`\\bin\\s+claim\\s+${oldNum}\\b`, 'gi'),
          ];

          patterns.forEach(pattern => {
            const matches = updatedText.match(pattern);
            if (matches) {
              dependenciesUpdated += matches.length;
              updatedText = updatedText.replace(pattern, (match) => {
                // Preserve the original case and format
                return match.replace(String(oldNum), String(newNum));
              });
            }
          });
        });

        // Update the claim if number or text changed
        if (claim.number !== newNumber || updatedText !== claim.text) {
          await tx.claim.update({
            where: { id: claim.id },
            data: {
              number: newNumber,
              text: updatedText,
            },
          });

          renumberedClaims.push({
            oldNumber: claim.number,
            newNumber,
            text: claim.text,
            updatedText: updatedText !== claim.text ? updatedText : undefined,
          });
        }
      }
    });

    logger.info('[AutoRenumberClaims] Renumbering completed', {
      projectId,
      totalClaims: sortedClaims.length,
      claimsRenumbered: renumberedClaims.length,
      dependenciesUpdated,
    });

    return {
      success: true,
      message: `Successfully renumbered ${renumberedClaims.length} claims and updated ${dependenciesUpdated} dependency references`,
      renumberedClaims,
      summary: {
        totalClaims: sortedClaims.length,
        claimsRenumbered: renumberedClaims.length,
        dependenciesUpdated,
      },
    };
  } catch (error) {
    logger.error('[AutoRenumberClaims] Renumbering failed', {
      projectId,
      error,
    });
    throw error;
  }
} 