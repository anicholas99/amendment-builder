import type { NextApiResponse } from 'next';
// TODO: Delete this route after IPD Identity is live - tenant switching will be handled differently
import { getSession } from '@/lib/auth/getSession';
import { logger } from '@/server/logger';
import { z } from 'zod';
import {
  findTenantById,
  setUserActiveTenant,
} from '@/repositories/tenantRepository';
import { CustomApiRequest } from '@/types/api';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';

const bodySchema = z.object({
  tenantId: z.string().uuid(),
});

interface SwitchTenantBody {
  tenantId: string;
}

const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  return (req.body as SwitchTenantBody)?.tenantId ?? null;
};

async function handler(
  req: CustomApiRequest<SwitchTenantBody>,
  res: NextApiResponse
) {
  // User and tenant access are guaranteed by middleware
  const session = (await getSession(req, res))!;
  const { tenantId } = req.body;

  try {
    // Note: withTenantGuard already ensures tenant exists and user has access.
    // We just need to get the tenant details to return them.
    const tenant = await findTenantById(tenantId);
    if (!tenant) {
      // This should theoretically not be reached if guard is working.
      // A failsafe in case the tenant is deleted between guard check and here.
      logger.error('Tenant not found after guard passed', {
        tenantId,
        userId: session.user.id,
      });
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Update user's active tenant
    await setUserActiveTenant(session.user.id, tenant.id);

    // TODO: With IPD Identity, this may need to update session claims differently
    // For now, return success and let the client refetch session
    logger.info('Tenant switched successfully', {
      userId: session.user.id,
      newTenantId: tenant.id,
    });

    return res.status(200).json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    });
  } catch (error) {
    logger.error('Error switching tenant:', error);
    return res.status(500).json({ error: 'Failed to switch tenant' });
  }
}

export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    body: bodySchema,
    bodyMethods: ['POST'],
  },
});
