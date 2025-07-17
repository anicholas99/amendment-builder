import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { logger } from '@/server/logger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { inventionRepository } from '@/repositories/inventionRepository';
import { ClaimRepository } from '@/repositories/claimRepository';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('[DEBUG] Starting claims diagnostic', { projectId });

    if (!prisma) {
      return res.status(500).json({ error: 'Database connection unavailable' });
    }

    // 1. Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, tenantId: true },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        projectId,
      });
    }

    // 2. Check if invention exists
    const invention = await inventionRepository.findByProjectId(projectId);

    // 3. Get claims through different methods
    let claimsByInventionId = [];
    let claimsDirectQuery = [];

    if (invention) {
      // Method 1: Through ClaimRepository
      claimsByInventionId = await ClaimRepository.findByInventionId(
        invention.id
      );

      // Method 2: Direct Prisma query
      claimsDirectQuery = await prisma.claim.findMany({
        where: { inventionId: invention.id },
        orderBy: { number: 'asc' },
      });
    }

    // 4. Check for orphaned claims (claims with wrong inventionId)
    const allProjectClaims = await prisma.claim.findMany({
      where: {
        invention: {
          projectId: projectId,
        },
      },
      include: {
        invention: {
          select: {
            id: true,
            projectId: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    });

    // 5. Get claim sync data
    let claimSyncData = null;
    if (invention) {
      claimSyncData = {
        parsedElementsJson: invention.parsedClaimElementsJson,
        searchQueriesJson: invention.searchQueriesJson,
        lastSyncedClaim: invention.lastSyncedClaim,
        claimSyncedAt: invention.claimSyncedAt,
      };
    }

    const diagnostics = {
      project: {
        id: project.id,
        name: project.name,
        tenantId: project.tenantId,
      },
      invention: {
        exists: !!invention,
        id: invention?.id || null,
        hasClaimSyncData: !!(
          invention?.parsedClaimElementsJson || invention?.searchQueriesJson
        ),
      },
      claims: {
        totalFound: allProjectClaims.length,
        byInventionId: claimsByInventionId.length,
        directQuery: claimsDirectQuery.length,
        claim1: allProjectClaims.find(c => c.number === 1) || null,
      },
      claimDetails: allProjectClaims.map(c => ({
        id: c.id,
        number: c.number,
        inventionId: c.inventionId,
        textLength: c.text.length,
        textPreview: c.text.substring(0, 100) + '...',
      })),
      claimSyncData,
      issues: [] as string[],
    };

    // Identify issues
    if (!invention) {
      diagnostics.issues.push('No invention record found for project');
    }

    if (invention && claimsByInventionId.length === 0) {
      diagnostics.issues.push(
        `Invention exists (${invention.id}) but no claims found with that inventionId`
      );
    }

    if (
      allProjectClaims.length > 0 &&
      !allProjectClaims.find(c => c.number === 1)
    ) {
      diagnostics.issues.push('Claims exist but no claim with number 1');
    }

    if (invention && allProjectClaims.length > 0) {
      const wrongInventionId = allProjectClaims.find(
        c => c.inventionId !== invention.id
      );
      if (wrongInventionId) {
        diagnostics.issues.push(
          `Some claims have different inventionId. Expected: ${invention.id}, Found: ${wrongInventionId.inventionId}`
        );
      }
    }

    logger.info('[DEBUG] Claims diagnostic complete', {
      projectId,
      issueCount: diagnostics.issues.length,
    });

    return res.status(200).json(diagnostics);
  } catch (error) {
    logger.error('[DEBUG] Error in claims diagnostic', {
      projectId,
      error,
    });
    return res.status(500).json({
      error: 'Failed to run diagnostic',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Apply security middleware
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler
);
