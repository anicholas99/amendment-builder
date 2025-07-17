/**
 * PatBase Patent Details API
 *
 * This API fetches detailed information about a specific patent reference.
 * Secured to prevent abuse and track usage per user.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { PatentServerService } from '@/server/services/patent.server-service';
import { SecurePresets } from '@/server/api/securePresets';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';

const apiLogger = createApiLogger('get-patent-by-reference');

// Validation schema
const querySchema = z.object({
  reference: z.string().min(1, 'Patent reference must be provided'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { reference } = req.query as z.infer<typeof querySchema>;

  // The service layer will handle throwing a standardized ApplicationError
  // which is then handled by the withErrorHandling middleware.
  const patentData = await PatentServerService.getPatentByNumber(reference);

  const response = {
    success: true,
    data: patentData,
  };

  apiLogger.logResponse(200, { reference, found: !!patentData });
  return res.status(200).json(response);
}

// SECURITY: Patent lookup now requires authentication to prevent abuse
// Uses stricter rate limiting to prevent scraping
export default SecurePresets.userPrivate(handler, {
  validate: {
    query: querySchema,
  },
  rateLimit: 'api', // Standard rate limit for authenticated users
});
