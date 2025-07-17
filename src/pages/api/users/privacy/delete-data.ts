import { NextApiRequest, NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { auditPrivacyEvent } from '@/server/monitoring/audit-logger';
import { logger } from '@/server/logger';
import { deleteUserData } from '@/repositories/userRepository';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

const deleteSchema = z.object({
  confirmation: z.literal('DELETE MY DATA'),
});

/**
 * GDPR Article 17: Right to Erasure ("Right to be Forgotten")
 * Permanently delete all user data upon request
 */
async function handler(
  req: CustomApiRequest<{ confirmation: string }>,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // User is guaranteed by middleware
  const { id: userId, tenantId } = (req as AuthenticatedRequest).user!;

  try {
    // Log the deletion request
    logger.info('User data deletion requested', { userId, tenantId });

    // Use repository for deletion
    await deleteUserData(userId, tenantId!);

    // Audit the deletion
    await auditPrivacyEvent(userId, tenantId!, 'data_deleted', {
      timestamp: new Date().toISOString(),
    });

    logger.info('User data deletion completed', { userId, tenantId });

    return res.status(200).json({
      success: true,
      message: 'Your data has been successfully deleted',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to delete user data', { error, userId, tenantId });
    return res.status(500).json({
      error: 'Failed to delete user data',
      message:
        'An error occurred while deleting your data. Please contact support.',
    });
  }
}

// Use the user-private preset for GDPR compliance
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      body: deleteSchema,
      bodyMethods: ['DELETE'],
    },
  }
);
