/**
 * Office Action Upload API Endpoint
 * 
 * Handles secure upload of Office Action documents with:
 * - File validation and security scanning
 * - Text extraction and parsing
 * - Database record creation
 * - Tenant isolation and access control
 */

import { NextApiResponse } from 'next';
import formidable from 'formidable';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { FILE_SIZE_LIMITS } from '@/lib/validation/schemas/fileUploadSchemas';
import { StorageServerService } from '@/server/services/storage.server-service';
import { EnhancedTextExtractionService } from '@/server/services/enhanced-text-extraction.server-service';
import { AmendmentServerService } from '@/server/services/amendment.server-service';
import { createOfficeAction } from '@/repositories/officeActionRepository';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { prisma } from '@/lib/prisma';

const apiLogger = createApiLogger('office-actions/upload');

// ============ VALIDATION SCHEMAS ============

const querySchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
});

const metadataSchema = z.object({
  applicationNumber: z.string().optional(),
  mailingDate: z.string().optional(),
  examinerName: z.string().optional(),
}).optional();

// Schema for test text requests
const testTextSchema = z.object({
  testText: z.string().min(1, 'Test text cannot be empty'),
  metadata: metadataSchema,
});

// ============ CONSTANTS ============

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
];

const MAX_FILE_SIZE = FILE_SIZE_LIMITS.DOCUMENT; // 50MB limit

// ============ HANDLER ============

/**
 * Office Action Upload Handler
 * Handles file upload, text extraction, and initial parsing
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

    if (!tenantId) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required'
      );
    }

    // Check if this is a test text request (JSON) or file upload (multipart)
    const contentType = req.headers['content-type'] || '';
    
    let extractedText = '';
    let textExtractionWarning = '';
    let uploadResult: any = null;
    let metadata: any = {};

    if (contentType.includes('application/json')) {
      // Handle test text request - manually parse JSON since bodyParser is disabled
      let requestBody;
      try {
        // Read the raw body and parse JSON manually
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf8');
        requestBody = JSON.parse(rawBody);
      } catch (error) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'Invalid JSON in request body'
        );
      }

      const testData = testTextSchema.parse(requestBody);
      extractedText = testData.testText;
      metadata = testData.metadata || {};
      
      apiLogger.info('Processing test Office Action text', {
        projectId,
        textLength: extractedText.length,
      });
      
    } else {
      // Handle file upload
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
          'No Office Action file uploaded'
        );
      }

      // Validate file type
      if (!SUPPORTED_TYPES.includes(uploadedFile.mimetype || '')) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'Office Action must be PDF or DOCX format'
        );
      }

      // Parse optional metadata
      if (fields.metadata) {
        const metadataString = Array.isArray(fields.metadata) ? fields.metadata[0] : fields.metadata;
        try {
          const parsedMetadata = JSON.parse(metadataString);
          metadata = metadataSchema.parse(parsedMetadata) || {};
        } catch (error) {
          apiLogger.warn('Invalid metadata provided, using defaults', { error });
        }
      }

      apiLogger.info('Processing Office Action upload', {
        projectId,
        fileName: uploadedFile.originalFilename,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
      });

            // Extract text from the uploaded file using enhanced extraction    
      try {
        // Try enhanced text extraction first (with OCR support)
        extractedText = await EnhancedTextExtractionService.extractTextFromFile(uploadedFile);
        
        // Log warning for documents with very little text (likely scanned)
        const textLength = extractedText.trim().length;
        if (textLength < 50) {
          textExtractionWarning = 'Document appears to contain minimal text content - may be a scanned or image-based document';
          apiLogger.warn('Office Action uploaded with minimal text content', {
            projectId,
            fileName: uploadedFile.originalFilename,
            extractedTextLength: textLength,
            possibleScannedDocument: true,
          });
        } else if (textLength < 200) {
          textExtractionWarning = 'Document contains limited text content';
          apiLogger.warn('Office Action uploaded with limited text content', {
            projectId,
            fileName: uploadedFile.originalFilename,
            extractedTextLength: textLength,
          });
        }
      } catch (enhancedExtractionError) {
        // Fall back to original extraction method
        apiLogger.warn('Enhanced text extraction failed, trying fallback method', {
          projectId,
          fileName: uploadedFile.originalFilename,
          error: enhancedExtractionError instanceof Error ? enhancedExtractionError.message : String(enhancedExtractionError),
        });
        
        try {
          extractedText = await StorageServerService.extractTextFromFile(uploadedFile);
          textExtractionWarning = 'Basic text extraction used - document may have limited OCR capabilities';
        } catch (fallbackError) {
          // Allow upload to proceed even if all text extraction fails
          textExtractionWarning = 'Text extraction failed - document may be scanned, password-protected, or corrupted';
          apiLogger.warn('All text extraction methods failed, proceeding with upload', {
            projectId,
            fileName: uploadedFile.originalFilename,
            enhancedError: enhancedExtractionError instanceof Error ? enhancedExtractionError.message : String(enhancedExtractionError),
            fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
          
          // Set minimal placeholder text to indicate extraction failure
          extractedText = '[Text extraction failed - manual review required]';
        }
      }

      // Upload file to secure storage
      uploadResult = await StorageServerService.uploadPatentDocument(
        uploadedFile,
        {
          userId,
          tenantId,
        }
      );
    }

    // Create Office Action record in database
    const officeActionData = uploadResult ? {
      // File upload case
      projectId,
      blobName: uploadResult.blobName,
      originalFileName: uploadResult.fileName,
      mimeType: uploadResult.mimeType,
      sizeBytes: uploadResult.size,
      extractedText,
      ...metadata,
    } : {
      // Test text case
      projectId,
      blobName: null,
      originalFileName: 'test-office-action.txt',
      mimeType: 'text/plain',
      sizeBytes: extractedText.length,
      extractedText,
      ...metadata,
    };

    const officeAction = await createOfficeAction(
      officeActionData,
      tenantId,
      userId
    );

    // Start background parsing process
    try {
      await AmendmentServerService.parseOfficeAction(
        extractedText,
        tenantId,
        userId
      );
    } catch (parseError) {
      // Log parsing error but don't fail the upload
      apiLogger.warn('Office Action parsing failed during upload', {
        officeActionId: officeAction.id,
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
    }

    apiLogger.info('Office Action processed successfully', {
      id: officeAction.id,
      projectId,
      fileName: officeAction.originalFileName,
      extractedTextLength: extractedText.length,
      isTestText: !uploadResult,
    });

    return apiResponse.ok(res, {
      success: true,
      officeAction: {
        id: officeAction.id,
        fileName: officeAction.originalFileName,
        status: officeAction.status,
        rejectionCount: 0, // Will be updated after parsing
        createdAt: officeAction.createdAt,
        isTestText: !uploadResult,
      },
      warning: textExtractionWarning || undefined,
    });

  } catch (error) {
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

// ============ EXPORT WITH SECURITY ============

// Security configuration following existing patterns
const resolveTenantId = async (req: any): Promise<string | null> => {
  const { projectId } = req.query as { projectId: string };
  
  if (!prisma) {
    return null;
  }
  
  try {
    // Resolve tenant ID from the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { tenantId: true }
    });
    return project?.tenantId || null;
  } catch (error) {
    return null;
  }
};

const guardedHandler = withTenantGuard(resolveTenantId)(handler);
export default withAuth(guardedHandler as any);

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}; 