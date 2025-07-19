import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { prisma } from '@/lib/prisma';
import { 
  findAmendmentProjectFiles, 
  createAmendmentProjectFile,
  getAmendmentProjectFileStats,
  CreateAmendmentProjectFileData 
} from '@/repositories/amendmentProjectFileRepository';
import { AmendmentFileType, AmendmentFileStatus } from '@/types/amendment';

const apiLogger = createApiLogger('amendment-project-files');

// Path parameter validation schema (validated manually in handler)
const pathParamsSchema = z.object({
  amendmentProjectId: z.string().uuid('Amendment project ID must be a valid UUID'),
});

// Query parameters for GET requests (excludes path parameters)
const getQuerySchema = z.object({
  fileType: z.nativeEnum(AmendmentFileType).optional(),
  status: z.nativeEnum(AmendmentFileStatus).optional(),
  search: z.string().max(255).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20').optional(),
  includeStats: z.string().transform(val => val === 'true').optional(),
  includeRelations: z.string().transform(val => val === 'true').optional(),
});

// Request body schema for POST requests
const createFileSchema = z.object({
  fileType: z.nativeEnum(AmendmentFileType),
  fileName: z.string().min(1, 'File name is required').max(255),
  originalName: z.string().min(1, 'Original name is required').max(255),
  blobName: z.string().optional(),
  storageUrl: z.string().url().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().min(0).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  extractedText: z.string().optional(),
  extractedMetadata: z.record(z.unknown()).optional(),
  linkedDraftId: z.string().uuid().optional(),
  parentFileId: z.string().uuid().optional(),
});

/**
 * Resolve tenant ID from amendment project  
 * Note: Using raw query to avoid potential Prisma model issues
 */
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { amendmentProjectId } = req.query;
  
  if (!prisma) {
    throw new ApplicationError(ErrorCode.DB_CONNECTION_ERROR, 'Database client not available');
  }
  
  try {
    const result = await prisma.$queryRaw<Array<{ tenantId: string }>>`
      SELECT tenantId FROM amendment_projects WHERE id = ${String(amendmentProjectId)}
    `;
    
    return result.length > 0 ? result[0].tenantId : null;
  } catch (error) {
    logger.error('Failed to resolve tenant from amendment project', { amendmentProjectId, error });
    return null;
  }
};

/**
 * Main API handler for amendment project files
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { amendmentProjectId } = pathParamsSchema.parse(req.query);
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  switch (req.method) {
    case 'GET':
      return handleGetFiles(req, res, amendmentProjectId, tenantId);
    
    case 'POST':
      return handleCreateFile(req, res, amendmentProjectId, userId, tenantId);
    
    default:
      return apiResponse.methodNotAllowed(res, ['GET', 'POST']);
  }
}

/**
 * Handle GET request - list files for amendment project
 */
async function handleGetFiles(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  amendmentProjectId: string,
  tenantId: string
) {
  try {
    const queryParams = getQuerySchema.parse(req.query);
    
    const {
      fileType,
      status,
      search,
      page = 1,
      limit = 20,
      includeStats = false,
      includeRelations = false,
    } = queryParams;

    // Build filters
    const filters = {
      amendmentProjectId,
      ...(fileType && { fileType }),
      ...(status && { status }),
      ...(search && { search }),
    };

    // Build options
    const options = {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: 'createdAt' as const,
      orderDirection: 'desc' as const,
      includeRelations,
    };

    // Fetch files and stats in parallel if requested
    const [filesResult, stats] = await Promise.all([
      findAmendmentProjectFiles(filters, options),
      includeStats ? getAmendmentProjectFileStats(amendmentProjectId) : Promise.resolve(null),
    ]);

    const { files, total } = filesResult;

    // Build pagination info
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    apiLogger.info('Amendment project files retrieved', {
      amendmentProjectId,
      fileCount: files.length,
      total,
      filters,
    });

    return apiResponse.ok(res, {
      success: true,
      data: {
        files,
        total,
        pagination,
        ...(stats && { stats }),
      },
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to retrieve amendment project files', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to retrieve amendment project files'
    );
  }
}

/**
 * Handle POST request - create new file record
 */
async function handleCreateFile(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  amendmentProjectId: string,
  userId: string,
  tenantId: string
) {
  try {
    const fileData = createFileSchema.parse(req.body);

    const createData: CreateAmendmentProjectFileData = {
      amendmentProjectId,
      tenantId,
      uploadedBy: userId,
      ...fileData,
    };

    const newFile = await createAmendmentProjectFile(createData);

    apiLogger.info('Amendment project file created', {
      fileId: newFile.id,
      amendmentProjectId,
      fileType: newFile.fileType,
      fileName: newFile.fileName,
    });

    return apiResponse.created(res, {
      success: true,
      data: { file: newFile },
    });

  } catch (error) {
    apiLogger.errorSafe('Failed to create amendment project file', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to create amendment project file'
    );
  }
}

// SECURITY: This endpoint is tenant-protected using amendment project-based resolution
// Users can only access/create files for amendment projects within their own tenant
export default SecurePresets.tenantProtected(
  resolveTenantId,
  handler,
  {
    validate: {
      query: getQuerySchema, // Only validate actual query params, not path params
      body: createFileSchema,
      bodyMethods: ['POST'],
    },
    rateLimit: 'api',
  }
); 