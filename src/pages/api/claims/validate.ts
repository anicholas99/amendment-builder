/**
 * Claim Validation API Endpoint
 * 
 * Triggers background validation for a single claim.
 * Non-blocking - returns immediately with pending status.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';

const logger = createApiLogger('claims/validate');
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ValidationState, RiskLevel } from '@/features/amendment/types/validation';

const validateClaimSchema = z.object({
  claimId: z.string().uuid(),
  claimText: z.string().min(1),
  claimNumber: z.string(),
  projectId: z.string().uuid(),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tenantId } = req.user;
  
  try {
    const { claimId, claimText, claimNumber, projectId } = validateClaimSchema.parse(req.body);

    // Check if validation already exists and is recent
    const existingValidation = await prisma.claimValidation.findFirst({
      where: {
        claimId,
        projectId,
        tenantId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
        },
      },
    });

    if (existingValidation && existingValidation.validationState === ValidationState.PENDING) {
      // Return existing pending validation
      return res.status(200).json({
        claimId,
        claimNumber,
        isValidating: true,
        validationResult: {
          state: existingValidation.validationState,
          riskLevel: existingValidation.riskLevel || RiskLevel.NONE,
          message: existingValidation.message,
          timestamp: existingValidation.createdAt,
        },
      });
    }

    // Create new validation record in pending state
    const validation = await prisma.claimValidation.create({
      data: {
        claimId,
        projectId,
        tenantId,
        validationState: ValidationState.PENDING,
        message: 'Validation in progress',
      },
    });

    // Trigger async validation (non-blocking)
    setImmediate(async () => {
      try {
        // Simulate validation logic - replace with actual AI validation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mock validation result - replace with actual logic
        const mockRisk = Math.random();
        let state: ValidationState;
        let riskLevel: RiskLevel;
        let message: string;

        if (mockRisk < 0.6) {
          state = ValidationState.PASSED_LOW;
          riskLevel = RiskLevel.LOW;
          message = 'Claim validated successfully with low risk';
        } else if (mockRisk < 0.85) {
          state = ValidationState.PASSED_MED;
          riskLevel = RiskLevel.MEDIUM;
          message = 'Claim validated with medium risk - review recommended';
        } else {
          state = ValidationState.PASSED_HIGH;
          riskLevel = RiskLevel.HIGH;
          message = 'High risk detected - manual review strongly recommended';
        }

        // Update validation result
        await prisma.claimValidation.update({
          where: { id: validation.id },
          data: {
            validationState: state,
            riskLevel,
            message,
            details: JSON.stringify({
              issuesFound: mockRisk > 0.6 ? Math.floor(mockRisk * 5) : 0,
              suggestions: mockRisk > 0.6 ? ['Consider narrowing scope', 'Add dependent claims'] : [],
              confidence: 0.85,
            }),
          },
        });

        logger.info('[ValidationAPI] Claim validation completed', {
          claimId,
          state,
          riskLevel,
        });
      } catch (error) {
        // Update to failed state on error
        await prisma.claimValidation.update({
          where: { id: validation.id },
          data: {
            validationState: ValidationState.FAILED,
            message: 'Validation failed - please try again',
          },
        });

        logger.error('[ValidationAPI] Validation processing failed', {
          claimId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Return immediate response
    res.status(200).json({
      claimId,
      claimNumber,
      isValidating: true,
      validationResult: {
        state: ValidationState.PENDING,
        riskLevel: RiskLevel.NONE,
        message: 'Validation started',
        timestamp: validation.createdAt,
      },
    });
  } catch (error) {
    logger.error('[ValidationAPI] Request failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    res.status(500).json({
      error: 'Failed to start validation',
    });
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromBody('projectId'),
  handler,
  { 
    rateLimit: 'ai',
    validate: { body: validateClaimSchema },
  }
);