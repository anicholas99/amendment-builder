/**
 * PatBase Patent Details API
 *
 * This API fetches detailed information about a specific patent reference.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { PatentServerService } from '@/server/services/patent.server-service';
import { SecurePresets } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('get-patent-by-reference');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);
  const { reference } = req.query;

  if (typeof reference !== 'string' || !reference) {
    return res.status(400).json({
      error: 'Patent reference must be provided as a non-empty string.',
    });
  }

  // The service layer will handle throwing a standardized ApplicationError
  // which is then handled by the withErrorHandling middleware.
  const patentData = await PatentServerService.getPatentByNumber(reference);

  apiLogger.logResponse(200, { reference, found: !!patentData });
  return res.status(200).json(patentData);
}

// Use SecurePresets for a public patent lookup endpoint
export default SecurePresets.public(handler);
