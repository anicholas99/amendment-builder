import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import {
  TenantResult,
  getUserActiveTenant,
  checkUserTenantAccess,
  setUserActiveTenant,
} from '../../../repositories/tenantRepository';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/server/api/securePresets';

const apiLogger = createApiLogger('tenants/active');

// Define request body type for PUT requests
interface SetActiveTenantBody {
  tenantId: string;
}

// Validation schema for PUT request
const putBodySchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID format'),
});

// Custom tenant resolver for this specific endpoint
const resolveTenantId = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  // For PUT requests, validate access to the tenant being activated
  if (req.method === 'PUT') {
    const tenantId = (req.body as SetActiveTenantBody | undefined)?.tenantId;
    return tenantId ?? null;
  }

  // For GET requests, use the user's current active tenant (if any)
  const userId = req.user?.id;
  if (!userId) return null;
  const activeTenant: TenantResult | null = await getUserActiveTenant(userId);
  return activeTenant?.id ?? null;
};

async function handler(
  req: CustomApiRequest<SetActiveTenantBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  try {
    // User is guaranteed by middleware
    const { id: userId } = (req as AuthenticatedRequest).user!;

    apiLogger.debug('Processing request for user', { userId });

    switch (req.method) {
      case 'GET':
        try {
          // Get the user's active tenant using repository
          const activeTenant = await getUserActiveTenant(userId);
          apiLogger.info('Retrieved active tenant', {
            userId,
            tenantId: activeTenant?.id,
          });

          const response = { activeTenant };
          apiLogger.logResponse(200, response);
          return res.status(200).json({
            success: true,
            data: response,
          });
        } catch (error) {
          apiLogger.logError(
            error instanceof Error ? error : new Error('Unknown error'),
            {
              userId,
              operation: 'getUserActiveTenant',
            }
          );
          res.status(500).json({ error: 'Failed to fetch active tenant' });
          return;
        }

      case 'PUT': {
        // Validation and tenant access are now handled by middleware.
        // The `withTenantGuard` ensures the user has access to the tenantId,
        // and `withValidation` ensures the body is correct.
        const { tenantId } = req.body as SetActiveTenantBody;

        try {
          // Update user's active tenant preference using repository
          const success = await setUserActiveTenant(userId, tenantId);

          if (!success) {
            apiLogger.error('Failed to update active tenant', {
              userId,
              tenantId,
            });
            res.status(500).json({ error: 'Failed to update active tenant' });
            return;
          }

          apiLogger.info('Updated active tenant', { userId, tenantId });
          const response = { success: true };
          apiLogger.logResponse(200, response);
          return res.status(200).json({
            success: true,
            data: response,
          });
        } catch (error) {
          apiLogger.logError(
            error instanceof Error ? error : new Error('Unknown error'),
            {
              userId,
              tenantId,
              operation: 'setUserActiveTenant',
            }
          );
          res.status(500).json({ error: 'Failed to update active tenant' });
          return;
        }
      }

      default:
        apiLogger.warn('Method not allowed', { method: req.method });
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
  } catch (error) {
    apiLogger.logError(
      error instanceof Error ? error : new Error('Unknown error'),
      {
        operation: 'handleActiveTenantRequest',
      }
    );
    res.status(500).json({ error: 'Failed to handle active tenant request' });
    return;
  }
}

export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    body: putBodySchema,
    bodyMethods: ['PUT'],
  },
});
