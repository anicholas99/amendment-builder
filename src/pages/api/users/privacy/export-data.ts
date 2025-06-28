import { NextApiResponse, NextApiRequest } from 'next';
import { CustomApiRequest } from '@/types/api';
import { auditPrivacyEvent } from '@/lib/monitoring/audit-logger';
import { logger } from '@/lib/monitoring/logger';
import { z } from 'zod';
import { exportUserData } from '@/repositories/userRepository';
import { SecurePresets } from '@/lib/api/securePresets';

const querySchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
});

/**
 * GDPR Article 20: Right to Data Portability
 * Export all user data in a structured, machine-readable format
 */
async function handler(req: CustomApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { format = 'json' } = req.query as z.infer<typeof querySchema>;
  // User is guaranteed by the secure preset
  const userId = req.user!.id;

  try {
    // Use repository instead of direct Prisma access
    const exportData = await exportUserData(userId);

    // Prepare export data
    const exportPayload = {
      exportDate: new Date().toISOString(),
      userData: exportData.user,
      projects: exportData.projects,
      chatMessages: exportData.chatMessages,
      searchHistory: exportData.searchHistory,
      privacySettings: exportData.privacySettings,
    };

    if (format === 'csv') {
      // For CSV format, we'll create a simple summary
      // In a real implementation, you'd want a proper CSV conversion
      const csvData = `Data Export for User: ${exportData.user?.email}
Export Date: ${exportPayload.exportDate}
Total Projects: ${exportData.projects.length}
Total Messages: ${exportData.chatMessages.length}
Total Searches: ${exportData.searchHistory.length}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="patent-drafter-export-${Date.now()}.csv"`
      );
      return res.status(200).send(csvData);
    }

    // JSON format (default)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="patent-drafter-export-${Date.now()}.json"`
    );
    return res.status(200).json(exportPayload);
  } catch (error) {
    logger.error('Error exporting user data:', { userId, error });
    return res.status(500).json({
      error: 'Failed to export user data',
      message: 'An error occurred while preparing your data export',
    });
  }
}

// Use the user-private preset as this endpoint exports a user's own data
export default SecurePresets.userPrivate(handler, {
  validate: {
    query: querySchema,
  },
});
