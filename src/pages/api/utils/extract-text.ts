import { NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import formidable from 'formidable';
import {
  validateFileMetadata,
  FILE_SIZE_LIMITS,
  type DocumentUploadData,
} from '@/lib/validation/schemas/fileUploadSchemas';

const apiLogger = createApiLogger('extract-text');

// Disable Next.js body parsing to allow formidable to handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  apiLogger.logRequest(req);

  try {
    // Pre-validate the request using formidable with strict limits
    const form = formidable({
      maxFileSize: FILE_SIZE_LIMITS.DOCUMENT,
      maxFiles: 1,
      allowEmptyFiles: false,
      keepExtensions: true,
    });

    apiLogger.info('Parsing multipart form data for text extraction');

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file provided for text extraction'
      );
    }

    // Validate file metadata using our Zod schema
    apiLogger.info('Validating document file for text extraction', {
      filename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    });

    try {
      validateFileMetadata(file, 'document');
    } catch (validationError) {
      apiLogger.warn('Document validation failed for text extraction', {
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

    // Validation passed, proceed with text extraction
    apiLogger.info('Document validation passed, extracting text', {
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
    });

    // StorageServerService will perform additional security checks
    const extractedText = await StorageServerService.extractTextFromFile(file);

    apiLogger.logResponse(200, { textLength: extractedText.length });
    return res.status(200).json({
      success: true,
      data: { text: extractedText },
    });
  } catch (error) {
    apiLogger.error('Text extraction failed', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message,
      });
    }

    // Don't leak internal errors
    return res.status(500).json({
      error: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to extract text from document. Please try again.',
    });
  }
}

// SECURITY: This endpoint is tenant-protected using the user's tenant
// Text extraction is performed within the user's tenant context
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    rateLimit: 'upload', // Use upload rate limit for file operations
  }
);
