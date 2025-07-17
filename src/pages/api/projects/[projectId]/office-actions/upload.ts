import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { createOfficeAction } from '@/repositories/officeActionRepository';
import { StorageServerService } from '@/server/services/storage.server-service';

const apiLogger = createApiLogger('office-actions/upload');

// Query schema for project ID validation
const querySchema = z.object({
  projectId: z.string().uuid('Project ID must be a valid UUID'),
});

// Form data schema (optional metadata)
const metadataSchema = z.object({
  oaNumber: z.string().optional(),
  dateIssued: z.string().optional(),
  examinerId: z.string().optional(),
  artUnit: z.string().optional(),
}).optional();

// Supported file types for Office Actions
const SUPPORTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

/**
 * Office Action Upload Handler
 * Handles file upload and creates Office Action record
 * Follows existing file upload patterns from ProjectFigure uploads
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'POST') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    // Validate query parameters
    const { projectId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user!;

    // Parse multipart form data
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
      maxFiles: 1,
    });

    const [fields, files] = await form.parse(req);
    
    // Get the uploaded file
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!uploadedFile) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'No file uploaded'
      );
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(uploadedFile.mimetype || '')) {
      await fs.unlink(uploadedFile.filepath); // Clean up temp file
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'File must be PDF or DOCX format'
      );
    }

    // Parse optional metadata
    let metadata = {};
    if (fields.metadata) {
      const metadataString = Array.isArray(fields.metadata) ? fields.metadata[0] : fields.metadata;
      try {
        const parsedMetadata = JSON.parse(metadataString);
        metadata = metadataSchema.parse(parsedMetadata) || {};
      } catch (error) {
        apiLogger.warn('Invalid metadata provided, using defaults', { error });
      }
    }

    // Upload file using the existing storage service pattern
    apiLogger.debug('Uploading Office Action to blob storage', {
      projectId,
      fileSize: uploadedFile.size,
    });

    const uploadResult = await StorageServerService.uploadPatentDocument(
      uploadedFile,
      {
        userId,
        tenantId: tenantId!,
      }
    );

    // Create Office Action record in database
    const officeActionData = {
      projectId,
      blobName: uploadResult.blobName,
      originalFileName: uploadResult.fileName,
      mimeType: uploadResult.mimeType,
      sizeBytes: uploadResult.size,
      ...metadata,
    };

    const officeAction = await createOfficeAction(
      officeActionData,
      tenantId!,
      userId
    );

    // Temp file cleanup is handled by StorageServerService

    apiLogger.info('Office Action uploaded successfully', {
      id: officeAction.id,
      projectId,
      blobName: uploadResult.blobName,
      userId,
    });

    return apiResponse.ok(res, {
      success: true,
      officeAction: {
        id: officeAction.id,
        status: officeAction.status,
        originalFileName: officeAction.originalFileName,
        createdAt: officeAction.createdAt,
      },
    });

  } catch (error) {
    // Clean up temp file on error if it exists
    if (req.body?.filepath) {
      try {
        await fs.unlink(req.body.filepath);
      } catch (cleanupError) {
        apiLogger.warn('Failed to clean up temp file', { cleanupError });
      }
    }

    apiLogger.errorSafe('Office Action upload failed', error as Error);
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      'Failed to upload Office Action'
    );
  }
}

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only upload Office Actions for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
    rateLimit: 'api',
  }
); 