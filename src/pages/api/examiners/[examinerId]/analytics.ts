import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { SecurePresets } from '@/server/api/securePresets';
import { ExaminerService } from '@/services/ExaminerService';
import { ApplicationError } from '@/lib/error';

const querySchema = z.object({
  examinerId: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { examinerId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user;
    const examinerService = new ExaminerService();

    // Get examiner analytics data
    const analyticsData = await examinerService.getExaminerAnalytics(examinerId, userId, tenantId);

    return res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch examiner analytics',
    });
  }
}

export default SecurePresets.userPrivate(
  handler,
  { 
    rateLimit: 'standard',
    validate: { query: querySchema }
  }
);