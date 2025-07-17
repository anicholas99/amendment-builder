import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Diagnostic function to check project-invention-claim relationships
 * Helps identify data integrity issues
 */
export async function getProjectDiagnostics(
  projectId: string,
  tenantId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    // Check project exists and belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
        deletedAt: null,
      },
      include: {
        invention: {
          include: {
            claims: {
              select: {
                id: true,
                number: true,
                inventionId: true,
              },
              orderBy: {
                number: 'asc',
              },
            },
          },
        },
      },
    });

    if (!project) {
      return {
        projectExists: false,
        error: 'Project not found or access denied',
      };
    }

    // Check for orphaned claims (claims without proper invention link)
    const orphanedClaims = await prisma.claim.findMany({
      where: {
        invention: {
          projectId: projectId,
        },
      },
      select: {
        id: true,
        number: true,
        inventionId: true,
      },
    });

    // Get all claims for this project's invention (if it exists)
    const allProjectClaims = project.invention?.id
      ? await prisma.claim.findMany({
          where: {
            inventionId: project.invention.id,
          },
          select: {
            id: true,
            number: true,
            text: true,
          },
          orderBy: {
            number: 'asc',
          },
        })
      : [];

    const diagnostics = {
      projectExists: true,
      projectId: project.id,
      projectName: project.name,
      hasInvention: !!project.invention,
      inventionId: project.invention?.id || null,
      claimsLoadedViaRelation: project.invention?.claims?.length || 0,
      claimsDirectQuery: allProjectClaims.length,
      totalClaimsFound: orphanedClaims.length,
      issues: [] as string[],
    };

    // Identify issues
    if (!project.invention) {
      diagnostics.issues.push('No invention record exists for this project');
    }

    if (diagnostics.claimsLoadedViaRelation !== diagnostics.claimsDirectQuery) {
      diagnostics.issues.push(
        `Mismatch: ${diagnostics.claimsLoadedViaRelation} claims via relation, ${diagnostics.claimsDirectQuery} via direct query`
      );
    }

    if (diagnostics.claimsDirectQuery === 0 && project.invention) {
      diagnostics.issues.push('Invention exists but has no claims');
    }

    logger.info('[ProjectDiagnostics] Diagnostic check complete', diagnostics);

    return diagnostics;
  } catch (error) {
    logger.error('[ProjectDiagnostics] Error running diagnostics', {
      error,
      projectId,
    });
    throw error;
  }
}
