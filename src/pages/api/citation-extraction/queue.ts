import { NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { CitationsServerService } from '@/server/services/citations.server.service';
import { getSearchHistoryWithTenant } from '@/repositories/search';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('citation-extraction-queue');

// Define schema for parsed elements (legacy)
const LegacyParsedElementSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  type: z.string().optional(),
  order: z.number().optional(),
});

// Legacy schema for backward compatibility
const requestSchema = z.object({
  searchInputs: z.array(z.string()).min(1),
  filterReferenceNumber: z.string().optional(),
  threshold: z.number().min(0).max(100).optional().default(30),
  searchHistoryId: z.string().uuid(),
  // Legacy fields that are no longer used
  claimSetVersionId: z.string().optional(),
  parsedElements: z.array(LegacyParsedElementSchema).optional(),
});

type CitationExtractionQueueBody = z.infer<typeof requestSchema>;

/**
 * @deprecated This endpoint is deprecated - use /api/citation-jobs instead
 * Kept for backward compatibility with existing code
 */
const handler = async (
  req: CustomApiRequest<CitationExtractionQueueBody>,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'POST') {
    return apiResponse.methodNotAllowed(res, ['POST']);
  }
  apiLogger.logRequest(req);
  apiLogger.warn('Using deprecated citation-extraction/queue endpoint');

  const { searchInputs, filterReferenceNumber, threshold, searchHistoryId } =
    req.body;

  try {
    // Create citation job using the new service
    const newJob = await CitationsServerService.createCitationJob({
      userId: req.user!.id,
      searchHistoryId,
      filterReferenceNumber: filterReferenceNumber || '',
      searchInputs,
      threshold,
    });

    // Return response in the legacy format
    return apiResponse.ok(res, {
      success: true,
      jobId: newJob.id,
      externalJobId: newJob.externalJobId || undefined,
    });
  } catch (error) {
    apiLogger.error('Error in deprecated citation extraction queue', { error });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to queue citation extraction'
    );
  }
};

const resolveTenantFromSearchHistoryInBody = async (
  req: AuthenticatedRequest
) => {
  const { searchHistoryId } = (req.body as CitationExtractionQueueBody) || {};
  if (!searchHistoryId) return null;

  const searchHistory = await getSearchHistoryWithTenant(searchHistoryId);
  return searchHistory?.tenantId || null;
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  resolveTenantFromSearchHistoryInBody,
  handler,
  {
    validate: {
      body: requestSchema,
    },
  }
);
