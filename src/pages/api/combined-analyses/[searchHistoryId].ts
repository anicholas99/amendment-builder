import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import * as combinedAnalysisRepository from '@/repositories/combinedExaminerAnalysisRepository';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { logger } from '@/lib/monitoring/logger';

// Query params schema
const querySchema = z.object({
  searchHistoryId: z.string().min(1),
});

const handler = async (
  req: CustomApiRequest & AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { searchHistoryId } = req.query as { searchHistoryId: string };
  const userId = req.user?.id;

  try {
    // Retrieve all combined analyses for this search history and user
    const analyses = await combinedAnalysisRepository.findBySearchHistory(
      searchHistoryId,
      userId
    );

    // Parse the analysis JSON for each result
    const parsedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      createdAt: analysis.createdAt,
      referenceNumbers: JSON.parse(analysis.referenceNumbers),
      analysis: JSON.parse(analysis.analysisJson),
      claim1Text: analysis.claim1Text,
    }));

    logger.info('Retrieved combined analyses', {
      searchHistoryId,
      count: parsedAnalyses.length,
    });

    res.status(200).json({ analyses: parsedAnalyses });
  } catch (error) {
    logger.error('Failed to retrieve combined analyses', {
      error,
      searchHistoryId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to retrieve combined analyses'
    );
  }
};

// Use the new secure preset with query validation
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'read',
  }
);
