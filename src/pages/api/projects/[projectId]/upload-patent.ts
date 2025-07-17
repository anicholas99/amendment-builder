import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import formidable from 'formidable';
import { z } from 'zod';
import {
  validateFileMetadata,
  FILE_SIZE_LIMITS,
} from '@/lib/validation/schemas/fileUploadSchemas';
import { StorageServerService } from '@/server/services/storage.server-service';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';
import { apiResponse } from '@/utils/api/responses';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

// Query params validation
const querySchema = z.object({
  projectId: z.string().uuid(),
});

// Form field validation (sent with the file)
const formFieldsSchema = z.object({
  linkToProject: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .optional()
    .default('true'),
  fileType: z
    .enum(['parent-patent', 'office-action', 'cited-reference', 'uploaded-doc'])
    .optional()
    .default('uploaded-doc'),
  sessionId: z.string().optional(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return apiResponse.methodNotAllowed(res, ['POST']);
  }

  try {
    const { projectId } = querySchema.parse(req.query);
    const { id: userId, tenantId } = req.user!;

    if (!tenantId) {
      throw new Error(
        'Tenant ID is required but was not provided by middleware'
      );
    }

    // Parse the multipart form
    const form = formidable({
      maxFileSize: FILE_SIZE_LIMITS.DOCUMENT,
      maxFiles: 1,
      allowEmptyFiles: false,
      keepExtensions: true,
    });

    logger.info('[UploadPatent] Parsing multipart form data', {
      projectId,
      userId,
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file provided in upload request'
      );
    }

    // Validate file
    try {
      validateFileMetadata(file, 'document');
    } catch (validationError) {
      logger.warn('[UploadPatent] File validation failed', {
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

    // Parse form fields
    const formData = formFieldsSchema.parse({
      linkToProject: fields.linkToProject?.[0],
      fileType: fields.fileType?.[0],
      sessionId: fields.sessionId?.[0],
    });

    // Extract text and metadata from the file BEFORE uploading
    const extractedData: { text: string | null; metadata: any } = {
      text: null,
      metadata: null,
    };

    try {
      // Extract text content BEFORE the file is deleted by upload
      logger.info('[UploadPatent] Extracting text from document', {
        filename: file.originalFilename,
        mimetype: file.mimetype,
      });

      const extractedText =
        await StorageServerService.extractTextFromFile(file);
      extractedData.text = extractedText;

      // Extract patent metadata if it's a PDF (basic extraction for MVP)
      if (file.mimetype === 'application/pdf' && extractedText) {
        const metadata: any = {};

        // Try to extract patent number
        const patentNumberMatch = extractedText.match(
          /US\s*(\d{1,2},?\d{3},?\d{3})\s*[A-Z]\d?/i
        );
        if (patentNumberMatch) {
          metadata.patentNumber = patentNumberMatch[0].replace(/\s/g, '');
        }

        // Try to extract title (usually after "Title:" or "(54)")
        const titleMatch = extractedText.match(
          /(?:Title:|(?:\(54\)))\s*([^\n]+)/i
        );
        if (titleMatch) {
          metadata.title = titleMatch[1].trim();
        }

        // Try to extract first claim
        const claim1Match = extractedText.match(
          /(?:What is claimed is:|Claims?:?)\s*1\.\s*([^2]+?)(?=\n\s*2\.|$)/i
        );
        if (claim1Match) {
          metadata.claim1 = claim1Match[1].trim();
        }

        extractedData.metadata = metadata;
      }

      logger.info('[UploadPatent] Text extracted successfully', {
        textLength: extractedText.length,
        hasMetadata: !!extractedData.metadata,
      });
    } catch (extractError) {
      logger.warn('[UploadPatent] Text extraction failed', {
        error:
          extractError instanceof Error
            ? extractError.message
            : String(extractError),
      });
      // Continue without extracted text
    }

    // Upload to blob storage AFTER text extraction
    logger.info('[UploadPatent] Uploading to blob storage', {
      userId,
      tenantId,
      linkToProject: formData.linkToProject,
    });

    // Upload to secure blob storage
    const uploadResult = await StorageServerService.uploadPatentDocument(file, {
      userId,
      tenantId,
    });

    // Save to the new ProjectDocument table
    const fileName = file.originalFilename || 'Untitled Document';

    logger.info('[UploadPatent] Saving to database', {
      projectId,
      fileName,
      fileType: formData.fileType,
    });

    const projectDocument = await projectDocumentRepository.create({
      project: { connect: { id: projectId } },
      fileName: fileName,
      originalName: fileName,
      fileType: formData.fileType,
      storageUrl: uploadResult.blobName,
      extractedText: extractedData.text,
      extractedMetadata: extractedData.metadata
        ? JSON.stringify(extractedData.metadata)
        : null,
      uploader: { connect: { id: userId } },
    });

    logger.info('[UploadPatent] Document saved successfully', {
      documentId: projectDocument.id,
      fileName: projectDocument.fileName,
      fileType: projectDocument.fileType,
    });

    return apiResponse.ok(res, {
      success: true,
      file: {
        id: projectDocument.id,
        type: formData.linkToProject ? 'linked' : 'referenced',
        fileType: formData.fileType,
        filename: projectDocument.fileName,
        storageUrl: uploadResult.blobName,
        projectId: formData.linkToProject ? projectId : null,
        sessionId: formData.sessionId,
        extractedMetadata: extractedData.metadata,
      },
    });
  } catch (error) {
    logger.error('[UploadPatent] Upload failed', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof ApplicationError) {
      return apiResponse.badRequest(res, error.message);
    }

    // Don't leak internal errors
    return apiResponse.serverError(
      res,
      new Error('Failed to upload patent document. Please try again.')
    );
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Files are scoped to the project's tenant
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
