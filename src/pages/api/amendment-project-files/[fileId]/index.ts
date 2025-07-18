import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { prisma } from '@/lib/prisma';
import { 
  findAmendmentProjectFileById, 
  updateAmendmentProjectFile,
  deleteAmendmentProjectFile,
  UpdateAmendmentProjectFileData 
} from '@/repositories/amendmentProjectFileRepository';
import { AmendmentFileStatus } from '@/types/amendment';

const apiLogger = createApiLogger('amendment-project-file-detail');

// Query validation schema
const querySchema = z.object({
  fileId: z.string().uuid('File ID must be a valid UUID'),
});

// Query parameters for GET requests
const getQuerySchema = querySchema.extend({
  includeRelations: z.string().transform(val => val === 'true').optional(),
});

// Request body schema for PATCH requests
const updateFileSchema = z.object({
  fileName: z.string().min(1).max(255).optional(),
  status: z.nativeEnum(AmendmentFileStatus).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  extractedText: z.string().optional(),
  extractedMetadata: z.record(z.unknown()).optional(),
  exportedAt: z.string().datetime().transform(val => new Date(val)).optional(),
  filedAt: z.string().datetime().transform(val => new Date(val)).optional(),
  linkedDraftId: z.string().uuid().optional(),
});

/**
 * Resolve tenant ID from amendment project file
 */
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { fileId } = req.query;
  
  if (!prisma) {
    throw new ApplicationError(ErrorCode.DB_CONNECTION_ERROR, 'Database client not available');
  }
  
  try {
    const result = await prisma.$queryRaw<Array<{ tenantId: string }>>`
      SELECT tenantId FROM amendment_project_files WHERE id = ${String(fileId)}
    `;
    
    return result.length > 0 ? result[0].tenantId : null;
  } catch (error) {
    apiLogger.errorSafe('Failed to resolve tenant from amendment project file', error as Error);
    return null;
  }
};

/**
 * Main API handler for individual amendment project files
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { fileId } = querySchema.parse(req.query);
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  switch (req.method) {
    case 'GET':
      return handleGetFile(req, res, fileId);
    
    case 'PATCH':
      return handleUpdateFile(req, res, fileId);
    
    case 'DELETE':
      return handleDeleteFile(req, res, fileId);
    
    default:
      return apiResponse.methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  }
}

/**
 * Handle GET request - get file details
 */
async function handleGetFile(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  fileId: string
) {
  try {
    const queryParams = getQuerySchema.parse(req.query);
    const { includeRelations = false } = queryParams;

    const file = await findAmendmentProjectFileById(fileId, includeRelations);

    if (!file) {
      return apiResponse.notFound(res, 'Amendment project file not found');
    }

    apiLogger.info('Amendment project file retrieved', {
      fileId,
      fileName: file.fileName,
      fileType: file.fileType,
    });

    return apiResponse.ok(res, {
      success: true,
      data: { file },
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to retrieve amendment project file', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to retrieve amendment project file'
    );
  }
}

/**
 * Handle PATCH request - update file
 */
async function handleUpdateFile(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  fileId: string
) {
  try {
    const updateData = updateFileSchema.parse(req.body);

    // Check if file exists first
    const existingFile = await findAmendmentProjectFileById(fileId);
    if (!existingFile) {
      return apiResponse.notFound(res, 'Amendment project file not found');
    }

    const updatedFile = await updateAmendmentProjectFile(fileId, updateData as UpdateAmendmentProjectFileData);

    apiLogger.info('Amendment project file updated', {
      fileId,
      fileName: updatedFile.fileName,
      updates: Object.keys(updateData),
    });

    return apiResponse.ok(res, {
      success: true,
      data: { file: updatedFile },
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to update amendment project file', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to update amendment project file'
    );
  }
}

/**
 * Handle DELETE request - soft delete file
 */
async function handleDeleteFile(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  fileId: string
) {
  try {
    // Check if file exists first
    const existingFile = await findAmendmentProjectFileById(fileId);
    if (!existingFile) {
      return apiResponse.notFound(res, 'Amendment project file not found');
    }

    await deleteAmendmentProjectFile(fileId);

    apiLogger.info('Amendment project file deleted', {
      fileId,
      fileName: existingFile.fileName,
    });

    return apiResponse.ok(res, {
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to delete amendment project file', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to delete amendment project file'
    );
  }
}

// SECURITY: This endpoint is tenant-protected using file-based resolution
// Users can only access/modify files within their own tenant
export default SecurePresets.tenantProtected(
  resolveTenantId,
  handler,
  {
    validate: {
      query: getQuerySchema,
      body: updateFileSchema,
      bodyMethods: ['PATCH'],
    },
    rateLimit: 'api',
  }
); 