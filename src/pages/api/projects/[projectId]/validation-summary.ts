/**
 * Get Validation Summary for Project
 * 
 * Returns aggregated validation status for all claims in a project
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';

const logger = createApiLogger('projects/validation-summary');
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ValidationState, RiskLevel } from '@/features/amendment/types/validation';

const querySchema = z.object({
  projectId: z.string().uuid(),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId } = req.user;
  
  try {
    const { projectId } = querySchema.parse(req.query);

    // Get total claim count for the project
    const totalClaims = await prisma.claim.count({
      where: {
        projectId,
        tenantId,
        deletedAt: null,
      },
    });

    // Get latest validation for each claim
    const validations = await prisma.$queryRaw<Array<{
      claimId: string;
      validationState: string;
      riskLevel: string | null;
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
      SELECT claimId, validationState, riskLevel
      FROM LatestValidations
      WHERE rn = 1
    `;

    // Calculate summary statistics
    const summary = {
      totalClaims,
      validatedClaims: 0,
      pendingValidations: 0,
      failedValidations: 0,
      highRiskClaims: 0,
      mediumRiskClaims: 0,
      lowRiskClaims: 0,
      hasUnvalidatedClaims: false,
      hasHighRiskClaims: false,
      overallRisk: RiskLevel.NONE as RiskLevel,
    };

    // Process validations
    const validatedClaimIds = new Set<string>();
    
    for (const validation of validations) {
      validatedClaimIds.add(validation.claimId);
      
      switch (validation.validationState) {
        case ValidationState.PENDING:
          summary.pendingValidations++;
          break;
        case ValidationState.FAILED:
          summary.failedValidations++;
          break;
        case ValidationState.PASSED_LOW:
          summary.validatedClaims++;
          summary.lowRiskClaims++;
          break;
        case ValidationState.PASSED_MED:
          summary.validatedClaims++;
          summary.mediumRiskClaims++;
          break;
        case ValidationState.PASSED_HIGH:
          summary.validatedClaims++;
          summary.highRiskClaims++;
          summary.hasHighRiskClaims = true;
          break;
      }
    }

    // Check for unvalidated claims
    summary.hasUnvalidatedClaims = validatedClaimIds.size < totalClaims;

    // Determine overall risk
    if (summary.highRiskClaims > 0) {
      summary.overallRisk = RiskLevel.HIGH;
    } else if (summary.mediumRiskClaims > 0) {
      summary.overallRisk = RiskLevel.MEDIUM;
    } else if (summary.lowRiskClaims > 0) {
      summary.overallRisk = RiskLevel.LOW;
    }

    res.status(200).json(summary);
  } catch (error) {
    logger.error('[ValidationAPI] Failed to generate validation summary', {
      projectId: req.query.projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    res.status(500).json({
      error: 'Failed to generate validation summary',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { rateLimit: 'standard' }
);