import { NextApiRequest, NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { auditPrivacyEvent } from '@/lib/monitoring/audit-logger';
import { logger } from '@/lib/monitoring/logger';
import {
  updateUserConsent,
  getUserPrivacySettings,
} from '@/repositories/userRepository';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const consentSchema = z.object({
  dataProcessingConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  analyticsConsent: z.boolean().optional(),
  thirdPartyConsent: z.boolean().optional(),
  dataRetentionDays: z.number().min(30).max(3650).optional(),
});

/**
 * Manage user privacy consent and preferences
 * GET: Retrieve current consent status
 * POST: Update consent preferences
 */
async function handler(req: CustomApiRequest, res: NextApiResponse) {
  // User is guaranteed by middleware
  const { id: userId, tenantId } = (req as AuthenticatedRequest).user!;

  if (req.method === 'GET') {
    try {
      // Get current consent settings
      const privacySettings = await getUserPrivacySettings(userId);

      if (!privacySettings) {
        // Return default settings if none exist
        return res.status(200).json({
          userId,
          dataProcessingConsent: false,
          marketingConsent: false,
          analyticsConsent: false,
          thirdPartyConsent: false,
          dataRetentionDays: 365,
          consentGivenAt: null,
        });
      }

      return res.status(200).json(privacySettings);
    } catch (error) {
      logger.error('Failed to fetch consent settings', { error, userId });
      return res
        .status(500)
        .json({ error: 'Failed to fetch consent settings' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    // Note: Body is already validated by middleware
    const validation = consentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid consent data',
        details: validation.error.flatten(),
      });
    }

    try {
      // Update consent preferences using repository
      const updatedConsent = await updateUserConsent(userId, validation.data);

      // Audit consent changes
      await auditPrivacyEvent(userId, tenantId!, 'consent_given', {
        changes: validation.data,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      });

      logger.info('User consent updated', {
        userId,
        tenantId,
        changes: Object.keys(validation.data),
      });

      return res.status(200).json({
        success: true,
        message: 'Consent preferences updated successfully',
        consent: updatedConsent,
      });
    } catch (error) {
      logger.error('Failed to update consent', { error, userId });
      return res.status(500).json({
        error: 'Failed to update consent preferences',
        message: 'An error occurred while saving your preferences',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Use the user-private preset as this endpoint manages user-specific, not tenant-specific, data
export default SecurePresets.userPrivate(handler);
