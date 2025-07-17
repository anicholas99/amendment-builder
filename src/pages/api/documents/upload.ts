import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import formidable from 'formidable';
import { apiResponse } from '@/utils/api/responses';
import {
  validateFileMetadata,
  FILE_SIZE_LIMITS,
  type InventionUploadRequest,
} from '@/lib/validation/schemas/fileUploadSchemas';
import { AuthenticatedRequest } from '@/types/middleware';

const apiLogger = createApiLogger('upload-invention');

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  // Only allow POST method
  if (req.method !== 'POST') {
    return apiResponse.methodNotAllowed(res, ['POST']);
  }

  try {
    // Pre-validate the request using formidable with strict limits
    const form = formidable({
      maxFileSize: FILE_SIZE_LIMITS.DOCUMENT,
      maxFiles: 1,
      allowEmptyFiles: false,
      keepExtensions: true,
    });

    apiLogger.info('Parsing multipart form data for document upload');

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file provided in upload request'
      );
    }

    // Validate file metadata using our Zod schema
    apiLogger.info('Validating document file metadata', {
      filename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    });

    try {
      validateFileMetadata(file, 'document');
    } catch (validationError) {
      apiLogger.warn('Document validation failed', {
        filename: file.originalFilename,
        error:
          validationError instanceof Error
            ? validationError.message
            : String(validationError),
      });

      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        validationError instanceof Error
          ? validationError.message
          : 'Invalid file format'
      );
    }

    // Validation passed, proceed with secure upload
    apiLogger.info('Document validation passed, proceeding with upload', {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
    });

    // StorageServerService will perform additional security checks (fileGuard, malware scan)
    const response = await StorageServerService.uploadInvention(req);

    apiLogger.logResponse(200, response);
    return apiResponse.ok(res, response);
  } catch (error) {
    apiLogger.error('Document upload failed', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return apiResponse.badRequest(res, error.message);
    }

    // Don't leak internal errors
    return apiResponse.serverError(
      res,
      new Error('Failed to upload document. Please try again.')
    );
  }
}

// SECURITY: This endpoint is tenant-protected using the user's tenant
// File uploads are scoped to the authenticated user's tenant
// Input validation is performed before processing
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    rateLimit: 'upload',
  }
);
