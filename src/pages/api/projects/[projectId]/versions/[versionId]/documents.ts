import { NextApiResponse, NextApiRequest } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { withErrorHandling } from '@/middleware/errorHandling';
import { AuthenticatedRequest } from '@/types/middleware';
import { updateVersionDocument } from '../../../../../../repositories/applicationVersionRepository';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { versionQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { withCsrf } from '@/lib/security/csrf';
import { withValidation } from '@/lib/security/validate';
import { withRateLimit } from '@/middleware/rateLimiter';
import { requireRole } from '@/middleware/role';
import { withMethod } from '@/middleware/method';
import { withQueryValidation } from '@/middleware/queryValidation';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Define request body type for document updates
interface DocumentUpdateBody {
  type: string;
  content: string;
}

const apiLogger = createApiLogger('application-version-documents');

// Validation schema for document creation
const createDocumentSchema = z.object({
  type: z.string().min(1, 'Document type is required'),
  content: z.string().min(1, 'Content is required'),
});

/**
 * Handler for updating patent application documents
 * PUT: Updates or creates a document for a specific application version
 */
const handler = async (
  req: CustomApiRequest<DocumentUpdateBody>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  if (req.method !== 'PUT') {
    apiLogger.warn('Method not allowed', { method: req.method });
    res.setHeader('Allow', 'PUT');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Query parameters are validated by middleware
  const { projectId, versionId } = req.query as z.infer<
    typeof versionQuerySchema
  >;
  const { type, content } = req.body;
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId;

  logger.info(
    `API [documents] PUT: Updating document ${type} for version ${versionId}`,
    {
      projectId,
      versionId,
      userId,
      tenantId,
      documentType: type,
      contentLength: content.length,
    }
  );

  // Update or create document using repository function
  const document = await updateVersionDocument(
    versionId,
    projectId,
    tenantId!,
    type,
    content
  );

  res.status(200).json({
    success: true,
    document: {
      id: document.id,
      type: document.type,
      updatedAt: document.updatedAt,
    },
  });
};

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: versionQuerySchema,
      body: createDocumentSchema,
      bodyMethods: ['PUT'],
    },
    rateLimit: 'api',
  }
);
