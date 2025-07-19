/**
 * Check Export Readiness
 * 
 * Checks if project is ready for export and identifies any validation issues
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';

const logger = createApiLogger('projects/export-readiness');
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

    // Get validation summary
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
      message: string | null;
    }>>`
      WITH LatestValidations AS (
        SELECT 
          claimId,
          validationState,
          riskLevel,
          message,
          ROW_NUMBER() OVER (PARTITION BY claimId ORDER BY createdAt DESC) as rn
        FROM claim_validations
        WHERE projectId = ${projectId}
          AND tenantId = ${tenantId}
      )
      SELECT claimId, validationState, riskLevel, message
      FROM LatestValidations
      WHERE rn = 1
    `;

    // Build summary and warnings
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

    const warnings: string[] = [];
    const validatedClaimIds = new Set<string>();
    
    for (const validation of validations) {
      validatedClaimIds.add(validation.claimId);
      
      switch (validation.validationState) {
        case ValidationState.PENDING:
          summary.pendingValidations++;
          break;
        case ValidationState.FAILED:
          summary.failedValidations++;
          warnings.push(`Validation failed for claim: ${validation.message || 'Unknown error'}`);
          break;
        case ValidationState.PASSED_LOW:
          summary.validatedClaims++;
          summary.lowRiskClaims++;
          break;
        case ValidationState.PASSED_MED:
          summary.validatedClaims++;
          summary.mediumRiskClaims++;
          if (validation.message) {
            warnings.push(validation.message);
          }
          break;
        case ValidationState.PASSED_HIGH:
          summary.validatedClaims++;
          summary.highRiskClaims++;
          summary.hasHighRiskClaims = true;
          if (validation.message) {
            warnings.push(validation.message);
          }
          break;
      }
    }

    // Check for unvalidated claims
    const unvalidatedCount = totalClaims - validatedClaimIds.size;
    if (unvalidatedCount > 0) {
      summary.hasUnvalidatedClaims = true;
      warnings.push(`${unvalidatedCount} claim${unvalidatedCount !== 1 ? 's have' : ' has'} not been validated`);
    }

    // Determine overall risk
    if (summary.highRiskClaims > 0) {
      summary.overallRisk = RiskLevel.HIGH;
    } else if (summary.mediumRiskClaims > 0) {
      summary.overallRisk = RiskLevel.MEDIUM;
    } else if (summary.lowRiskClaims > 0) {
      summary.overallRisk = RiskLevel.LOW;
    }

    // Determine if override is required
    const requiresOverride = summary.hasUnvalidatedClaims || 
                           summary.hasHighRiskClaims || 
                           summary.failedValidations > 0;

    res.status(200).json({
      canExport: true, // Always allow export
      requiresOverride,
      summary,
      warnings,
    });
  } catch (error) {
    logger.error('[ValidationAPI] Failed to check export readiness', {
      projectId: req.query.projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    // On error, allow export but note the issue
    res.status(200).json({
      canExport: true,
      requiresOverride: false,
      summary: {
        totalClaims: 0,
        validatedClaims: 0,
        pendingValidations: 0,
        failedValidations: 0,
        highRiskClaims: 0,
        mediumRiskClaims: 0,
        lowRiskClaims: 0,
        hasUnvalidatedClaims: false,
        hasHighRiskClaims: false,
        overallRisk: RiskLevel.NONE,
      },
      warnings: ['Validation service temporarily unavailable'],
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  { rateLimit: 'standard' }
);