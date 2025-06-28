import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';

import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Import repository functions
import { batchUpdateDocuments } from '../../../repositories/documentRepository';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Initialize apiLogger
const apiLogger = createApiLogger('documents-batch-update');

// Define validation schema for document batch updates
const documentUpdateSchema = z.object({
  documentId: z.string().uuid('Document ID must be a valid UUID'),
  content: z.string().min(1, 'Content cannot be empty'),
});

const batchUpdateSchema = z
  .array(documentUpdateSchema)
  .min(1, 'At least one document update is required')
  .max(100, 'Cannot update more than 100 documents at once');

// Define request body type from schema
type DocumentBatchUpdate = z.infer<typeof batchUpdateSchema>;

const handler = async (
  req: CustomApiRequest<DocumentBatchUpdate>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  const userId = req.user?.id;
  if (!userId) {
    throw new ApplicationError(
      ErrorCode.AUTH_UNAUTHORIZED,
      'Authentication required'
    );
  }

  const updates = req.body;

  apiLogger.info(`Processing ${updates.length} document updates`, { userId });

  // Use repository function for batch updates
  const results = await batchUpdateDocuments(updates, userId);

  const responseBody = {
    count: results.length,
    results,
  };
  apiLogger.logResponse(200, responseBody);
  res.status(200).json(responseBody);
};

// Create the batch-update endpoint
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increased size limit for batch document updates
    },
  },
};

// SECURITY: This endpoint is tenant-protected using the user's tenant
// Batch document updates are scoped to the authenticated user's tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      body: batchUpdateSchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
