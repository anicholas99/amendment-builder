import { NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { throwUnauthorized } from '@/middleware/errorHandling';

import {
  findTenantsByUserId,
  TenantResult,
} from '../../../repositories/tenantRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { safeJsonParse } from '@/utils/json-utils';
import { SecurePresets } from '@/lib/api/securePresets';

// No request body needed for this GET-only endpoint
interface EmptyBody {}

const handler = async (
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
) => {
  // User is guaranteed by the secure preset
  const userId = req.user!.id;

  // Get all tenants the user belongs to using the repository function
  const userTenants = await findTenantsByUserId(userId);

  // Transform the data to match the expected format
  const tenants = userTenants.map(tenant => {
    let parsedSettings = undefined;
    if (tenant.settings) {
      parsedSettings = safeJsonParse(tenant.settings);
      if (parsedSettings === undefined) {
        logger.warn(
          `Failed to parse settings for tenant ${tenant.id} - invalid JSON`
        );
      }
    }

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      settings: parsedSettings,
    };
  });

  // If no tenants found, return empty array
  if (!tenants.length) {
    logger.warn(`User ${userId} has no tenant associations`);
  }

  return res.status(200).json({ tenants });
};

// Use the user-private preset as this returns data specific to the authenticated user
export default SecurePresets.userPrivate(handler);
