/**
 * Get Claim Validation Status
 * 
 * Returns current validation status for a specific claim
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';

const logger = createApiLogger('claims/validation');
import { SecurePresets } from '@/server/api/securePresets';

const querySchema = z.object({
  claimId: z.string().uuid(),
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
    const { claimId } = querySchema.parse(req.query);

    // Get most recent validation for this claim
    const validation = await prisma.claimValidation.findFirst({
      where: {
        claimId,
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!validation) {
      return res.status(404).json({ error: 'No validation found for this claim' });
    }

    // Parse details if present
    let details = null;
    if (validation.details) {
      try {
        details = JSON.parse(validation.details);
      } catch {
        logger.warn('[ValidationAPI] Failed to parse validation details', { claimId });
      }
    }

    res.status(200).json({
      claimId,
      claimNumber: '', // Would need to fetch from claim data
      isValidating: validation.validationState === 'PENDING',
      validationResult: {
        state: validation.validationState,
        riskLevel: validation.riskLevel || 'NONE',
        message: validation.message,
        details,
        timestamp: validation.createdAt,
      },
      lastValidated: validation.updatedAt,
    });
  } catch (error) {
    logger.error('[ValidationAPI] Failed to fetch validation status', {
      claimId: req.query.claimId,
      error: error instanceof Error ? error.message : String(error),
    });
    
    res.status(500).json({
      error: 'Failed to fetch validation status',
    });
  }
}

export default SecurePresets.apiKeyOrTenantProtected(handler, {
  rateLimit: 'standard',
});