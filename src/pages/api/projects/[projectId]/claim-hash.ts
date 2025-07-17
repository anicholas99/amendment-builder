import { NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { generateClaimHash } from '@/utils/claimVersioning';

const querySchema = z.object({
  projectId: z.string().min(1),
});

async function handler(
  req: CustomApiRequest & AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { projectId } = req.query as { projectId: string };

  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  try {
    // Get the invention - using raw query to handle new fields
    const inventions = await prisma.$queryRaw<
      Array<{
        id: string;
        claim1Hash: string | null;
        claim1ParsedAt: Date | null;
        parserVersion: string | null;
      }>
    >`
      SELECT id, claim1Hash, claim1ParsedAt, parserVersion
      FROM inventions
      WHERE projectId = ${projectId}
    `;

    const invention = inventions[0];

    if (!invention) {
      return res.status(404).json({
        error: 'Invention not found',
        claim1Hash: null,
      });
    }

    // If no hash stored, check if claim 1 exists and generate hash
    if (!invention.claim1Hash) {
      const claim1 = await prisma.claim.findFirst({
        where: {
          inventionId: invention.id,
          number: 1,
        },
        select: { text: true },
      });

      if (claim1) {
        try {
          const newHash = generateClaimHash(claim1.text);

          // Try to update the hash - may fail if migration not applied
          await prisma.$executeRaw`
            UPDATE inventions 
            SET claim1Hash = ${newHash},
                claim1ParsedAt = ${new Date()},
                parserVersion = 'v1.0'
            WHERE id = ${invention.id}
          `;

          return res.status(200).json({
            claim1Hash: newHash,
            claim1ParsedAt: new Date(),
            parserVersion: 'v1.0',
          });
        } catch (error) {
          logger.warn('[ClaimHashAPI] Could not update hash', { error });
          // Return null hash if update fails
        }
      }
    }

    return res.status(200).json({
      claim1Hash: invention.claim1Hash,
      claim1ParsedAt: invention.claim1ParsedAt,
      parserVersion: invention.parserVersion,
    });
  } catch (error) {
    logger.error('[ClaimHashAPI] Error fetching claim hash', {
      error,
      projectId,
    });

    if (error instanceof ApplicationError) {
      return res.status(400).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch claim hash',
    });
  }
}

// Resolve tenantId for the project
const resolveTenantId = async (
  req: CustomApiRequest
): Promise<string | null> => {
  const { projectId } = req.query as { projectId: string };

  if (!prisma) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { tenantId: true },
  });
  return project?.tenantId || null;
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any);
