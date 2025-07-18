import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { prisma } from '@/lib/prisma';
import { createAmendmentProjectFile } from '@/repositories/amendmentProjectFileRepository';
import { AmendmentFileType } from '@/types/amendment';

const apiLogger = createApiLogger('amendment-project-file-upload');

// Query validation schema
const querySchema = z.object({
  amendmentProjectId: z.string().uuid('Amendment project ID must be a valid UUID'),
});

/**
 * Resolve tenant ID from amendment project
 */
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { amendmentProjectId } = req.query;
  
  if (!prisma) {
    return null;
  }
  
  try {
    const result = await prisma.$queryRaw<Array<{ tenantId: string }>>`
      SELECT tenantId FROM amendment_projects WHERE id = ${String(amendmentProjectId)}
    `;
    
    return result.length > 0 ? result[0].tenantId : null;
  } catch (error) {
    apiLogger.errorSafe('Failed to resolve tenant from amendment project', error as Error);
    return null;
  }
};

/**
 * File upload handler for amendment projects
 * Note: This is a simplified version. In production, you'd want to:
 * - Integrate with Azure Blob Storage
 * - Add file validation (size, type, virus scanning)
 * - Handle file processing (text extraction, metadata)
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    return apiResponse.methodNotAllowed(res, ['POST']);
  }

  const { amendmentProjectId } = querySchema.parse(req.query);
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  try {
    // In a real implementation, you would:
    // 1. Parse multipart form data to get the file
    // 2. Upload to Azure Blob Storage
    // 3. Extract text content if possible
    // 4. Generate metadata

    // For now, create a placeholder file record
    const fileData = {
      amendmentProjectId,
      tenantId,
      fileType: AmendmentFileType.DRAFT_RESPONSE, // Default type
      fileName: 'uploaded-file.pdf',
      originalName: 'uploaded-file.pdf',
      uploadedBy: userId,
      description: 'File uploaded via amendment studio',
    };

    const newFile = await createAmendmentProjectFile(fileData);

    apiLogger.info('Amendment project file uploaded', {
      fileId: newFile.id,
      amendmentProjectId,
      fileName: newFile.fileName,
    });

    return apiResponse.created(res, {
      success: true,
      data: { 
        file: newFile,
        message: 'File upload placeholder created. Integration with Azure Blob Storage needed for full functionality.',
      },
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to upload amendment project file', error as Error);
    return apiResponse.serverError(res, error as Error);
  }
}

// SECURITY: This endpoint is tenant-protected using amendment project-based resolution
export default SecurePresets.tenantProtected(
  resolveTenantId,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'api',
  }
); 