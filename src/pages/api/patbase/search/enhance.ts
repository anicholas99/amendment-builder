/**
 * PatBase Search Results Enhancement API
 *
 * This API takes a list of patent references and returns enhanced information from PatBase.
 * It's used to augment search results with titles, dates, and applicant info.
 */
import { NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { PatentServerService } from '@/server/services/patent.server-service';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('patbase/search/enhance');

// Zod schema for body validation
const bodySchema = z.object({
  references: z.array(z.string()).min(1, 'At least one reference is required.'),
});

/**
 * Main handler for enhancing patent search results.
 * This handler is now a "thin controller" that delegates all logic
 * to the PatentServerService.
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  apiLogger.logRequest(req);

  // The request body is already validated by the withValidation middleware.
  const { references } = req.body as z.infer<typeof bodySchema>;

  // Limit the number of references to process in a single request for performance.
  const limitedReferences = references.slice(0, 20); // Capped at 20

  const enhancedResults =
    await PatentServerService.getBulkPatentBasicInfo(limitedReferences);

  const responseBody = {
    results: enhancedResults,
    count: enhancedResults.length,
  };

  apiLogger.logResponse(200, responseBody);
  res.status(200).json(responseBody);
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      body: bodySchema,
    },
  }
);
