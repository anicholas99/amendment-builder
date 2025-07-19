/**
 * Record Validation Override
 * 
 * Records when an attorney proceeds with export despite validation warnings
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';

const logger = createApiLogger('projects/validation-override');
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

const overrideSchema = z.object({
  projectId: z.string().uuid(),
  reason: z.string().optional(),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id: userId, tenantId } = req.user;
  
  try {
    const { projectId, reason } = overrideSchema.parse(req.body);

    // Get current validation summary for audit trail
    const validationSummary = await getValidationSummary(projectId, tenantId);

    // Find the amendment project
    const amendmentProject = await prisma.amendmentProject.findFirst({
      where: {
        projectId,
        tenantId,
        status: {
          in: ['DRAFT', 'IN_REVIEW', 'READY_TO_FILE'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!amendmentProject) {
      return res.status(404).json({ error: 'No active amendment project found' });
    }

    // Update amendment project with override information
    await prisma.amendmentProject.update({
      where: { id: amendmentProject.id },
      data: {
        validationOverridden: true,
        validationOverrideReason: reason || 'Attorney proceeded without validation',
        validationOverrideAt: new Date(),
        validationOverrideBy: userId,
        validationSummary: JSON.stringify(validationSummary),
      },
    });

    // Log to AI audit trail
    await prisma.aIAuditLog.create({
      data: {
        userId,
        tenantId,
        operation: 'VALIDATION_OVERRIDE',
        model: 'SYSTEM',
        prompt: `Validation override for project ${projectId}`,
        response: JSON.stringify({
          reason,
          validationSummary,
        }),
        metadata: {
          projectId,
          amendmentProjectId: amendmentProject.id,
          overrideReason: reason,
        },
      },
    });

    logger.info('[ValidationAPI] Validation override recorded', {
      projectId,
      amendmentProjectId: amendmentProject.id,
      userId,
      hasReason: !!reason,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('[ValidationAPI] Failed to record validation override', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Don't block export on audit failure
    res.status(200).json({ success: true });
  }
}

// Helper function to get validation summary
async function getValidationSummary(projectId: string, tenantId: string) {
  const totalClaims = await prisma.claim.count({
    where: {
      projectId,
      tenantId,
      deletedAt: null,
    },
  });

  const validations = await prisma.$queryRaw<Array<{
    validationState: string;
    riskLevel: string | null;
    count: bigint;
  }>>`
    WITH LatestValidations AS (
      SELECT 
        claimId,
        validationState,
        riskLevel,
        ROW_NUMBER() OVER (PARTITION BY claimId ORDER BY createdAt DESC) as rn
      FROM claim_validations
      WHERE projectId = ${projectId}
        AND tenantId = ${tenantId}
    )
    SELECT validationState, riskLevel, COUNT(*) as count
    FROM LatestValidations
    WHERE rn = 1
    GROUP BY validationState, riskLevel
  `;

  const summary = {
    totalClaims,
    validationBreakdown: validations.map(v => ({
      state: v.validationState,
      riskLevel: v.riskLevel,
      count: Number(v.count),
    })),
    timestamp: new Date(),
  };

  return summary;
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromBody('projectId'),
  handler,
  { 
    rateLimit: 'standard',
    validate: { body: overrideSchema },
  }
);