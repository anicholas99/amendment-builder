import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ClaimRepository } from '@/repositories/claimRepository';
import { inventionRepository } from '@/repositories/inventionRepository';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Validation schema for claims operations
const claimSchema = z.object({
  text: z.string().min(1, 'Claim text is required'),
  number: z.number().int().positive(),
});

const createClaimsSchema = z.object({
  claims: z.array(claimSchema).min(1, 'At least one claim is required'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    if (req.method === 'GET') {
      logger.info('[API] Getting claims', { projectId });

      const invention = await inventionRepository.findByProjectId(projectId);

      if (!invention) {
        logger.warn(
          '[API] No invention found for project, returning empty claims array.',
          { projectId }
        );
        return res.status(200).json({
          success: true,
          data: { claims: [] },
        });
      }

      const claims = await ClaimRepository.findByInventionId(invention.id);

      return res.status(200).json({
        success: true,
        data: { claims },
      });
    }

    if (req.method === 'POST') {
      // Create claims
      const { claims: claimsData } = req.body;

      logger.info('[API] Creating claims', {
        projectId,
        claimCount: claimsData.length,
      });

      const invention = await inventionRepository.findByProjectId(projectId);

      if (!invention) {
        logger.error(
          '[API] Cannot create claims: No invention found for project',
          { projectId }
        );
        return res
          .status(404)
          .json({ error: 'Invention not found for this project.' });
      }

      const result = await ClaimRepository.createClaimsForInvention(
        invention.id,
        claimsData
      );

      return res.status(201).json({
        success: true,
        data: { claims: result.claims },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logger.error('[API] Error handling claims operation', {
      projectId,
      method: req.method,
      error,
    });
    return res.status(500).json({ error: 'Failed to handle claims operation' });
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only access/create claims for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: createClaimsSchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
