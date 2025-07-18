import { NextApiRequest } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { fileGuard } from '@/lib/security/fileGuard';
import { logger } from '@/server/logger';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerClient,
} from '@azure/storage-blob';
import { env } from '@/config/env';
import { v4 as uuidv4 } from 'uuid';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { createProjectFigure, FigureUploadData } from '@/repositories/figure';
import { AuthenticatedRequest } from '@/types/middleware';
import { environment } from '@/config/environment';
import { scanFile } from '@/lib/security/malwareScanner';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_DOCUMENT_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/pdf',
  'text/plain',
];

const AZURE_STORAGE_CONNECTION_STRING = env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = env.AZURE_STORAGE_CONTAINER_NAME;
const INVENTION_CONTAINER_NAME = env.AZURE_STORAGE_INVENTION_CONTAINER_NAME;

// Private containers for secure storage
const FIGURES_CONTAINER = 'figures-private';
const PATENT_FILES_CONTAINER = 'patent-files-private';
const OFFICE_ACTIONS_CONTAINER = 'office-actions-private';

let blobServiceClient: BlobServiceClient;

function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
  }
  return blobServiceClient;
}

/**
 * Server-side service for handling all storage-related operations,
 * such as file parsing, validation, and uploading.
 */
export class StorageServerService {
  /**
   * Upload figure securely with database tracking and private storage
   */
  static async uploadFigure(
    file: formidable.File,
    fields: {
      projectId: string;
      userId: string;
      figureKey?: string;
    },
    tenantId: string
  ): Promise<{
    id: string;
    url: string;
    fileName: string;
    type: string | null;
  }> {
    logger.debug(
      '[StorageServerService] Starting secure figure upload process...'
    );

    const { projectId, userId, figureKey } = fields;

    if (!file) {
      logger.warn('[StorageServerService] No file found in form data');
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file uploaded'
      );
    }

    if (!projectId) {
      logger.warn('[StorageServerService] No projectId provided');
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    const originalFilename = file.originalFilename || 'unnamed-file';

    let guardResult;
    try {
      guardResult = await fileGuard(file, {
        acceptedTypes: ACCEPTED_IMAGE_TYPES,
        maxSize: MAX_FILE_SIZE,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
        sanitizeFilename: true,
      });
    } catch (guardError) {
      const err =
        guardError instanceof ApplicationError
          ? guardError
          : new ApplicationError(
              ErrorCode.VALIDATION_INVALID_FORMAT,
              `File validation failed: ${guardError instanceof Error ? guardError.message : String(guardError)}`
            );
      logger.warn('[StorageServerService] File validation failed', {
        filename: originalFilename,
        error: err.message,
      });
      throw err;
    }

    // Malware scanning (non-blocking for now)
    try {
      const scanResult = await scanFile(file, false); // false = don't block on threat
      logger.info('[StorageServerService] Malware scan completed', {
        filename: guardResult.sanitizedFilename,
        clean: scanResult.clean,
        scanner: scanResult.scanner,
      });
    } catch (scanError) {
      // Log but don't fail the upload
      logger.error('[StorageServerService] Malware scan failed', {
        filename: guardResult.sanitizedFilename,
        error: scanError,
      });
    }

    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    try {
      // Generate secure blob name with tenant isolation using sanitized filename
      const fileExtension = guardResult.extension || '';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const secureFileName = `${tenantId}/${projectId}/${uuidv4()}-${timestamp}-${guardResult.sanitizedFilename}`;
      const blobName = secureFileName;

      logger.debug('[StorageServerService] Generated blob name for upload', {
        originalFilename,
        blobName,
        tenantId,
        projectId,
        figureKey,
      });

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient =
        blobServiceClient.getContainerClient(FIGURES_CONTAINER);

      // Ensure private container exists
      await containerClient.createIfNotExists(); // No public access - private by default

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload to private blob storage
      await blockBlobClient.uploadFile(file.filepath, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype || 'application/octet-stream',
        },
        metadata: {
          originalName: originalFilename,
          uploadedBy: userId,
          projectId: projectId,
          tenantId: tenantId,
        },
      });

      logger.debug(
        '[StorageServerService] File uploaded to private blob storage',
        {
          blobName,
          originalFilename,
          container: FIGURES_CONTAINER,
          fileSize: file.size,
          mimeType: file.mimetype,
        }
      );

      // Store secure metadata in database
      const figureData: FigureUploadData = {
        projectId: projectId,
        fileName: originalFilename,
        originalName: originalFilename,
        blobName: blobName,
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size,
        figureKey: figureKey || undefined,
        uploadedBy: userId,
      };

      logger.info(
        '[StorageServerService] Creating/updating figure in database',
        {
          figureData,
        }
      );

      const figure = await createProjectFigure(figureData, tenantId);

      logger.debug('[StorageServerService] Secure figure upload completed', {
        figureId: figure.id,
        projectId: projectId,
        fileName: originalFilename,
        blobName: blobName,
        returnedBlobName: figure.blobName,
        status: figure.status,
      });

      // Return figure ID instead of direct blob URL for security
      return {
        id: figure.id,
        url: `/api/projects/${projectId}/figures/${figure.id}/download`, // Secure API endpoint
        fileName: originalFilename,
        type: file.mimetype,
      };
    } catch (error) {
      logger.error('[StorageServerService] Figure upload failed', {
        originalFilename,
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.STORAGE_UPLOAD_FAILED,
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      // Cleanup temp file
      try {
        const fs = await import('fs');
        await fs.promises.unlink(file.filepath);
        logger.debug('[StorageServerService] Cleaned up temp file', {
          filepath: file.filepath,
        });
      } catch (cleanupError) {
        logger.warn('[StorageServerService] Failed to cleanup temp file', {
          filepath: file.filepath,
          error: cleanupError,
        });
      }
    }
  }

  /**
   * Download figure with access control
   */
  static async downloadFigure(
    figureId: string,
    userId: string,
    tenantId: string
  ): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
    fileName: string;
  }> {
    logger.debug('[StorageServerService] Starting secure figure download', {
      figureId,
      userId,
      tenantId,
    });

    // Import repository function (will work after Prisma generation)
    const { getProjectFigure } = await import('@/repositories/figure');

    // Verify access control
    const figure = await getProjectFigure(figureId, userId, tenantId);
    if (!figure) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Figure not found or access denied'
      );
    }

    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    try {
      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient =
        blobServiceClient.getContainerClient(FIGURES_CONTAINER);
      const blockBlobClient = containerClient.getBlockBlobClient(
        figure.blobName
      );

      // Get download stream
      const downloadResponse = await blockBlobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new ApplicationError(
          ErrorCode.STORAGE_DOWNLOAD_FAILED,
          'Failed to get file stream'
        );
      }

      logger.debug('[StorageServerService] Figure download authorized', {
        figureId,
        fileName: figure.fileName,
        userId,
      });

      return {
        stream: downloadResponse.readableStreamBody,
        contentType: figure.mimeType,
        fileName: figure.fileName,
      };
    } catch (error) {
      logger.error('[StorageServerService] Figure download failed', {
        figureId,
        blobName: figure.blobName,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.STORAGE_DOWNLOAD_FAILED,
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Deletes a figure from blob storage.
   * @param url The URL of the figure to delete.
   */
  static async deleteFigure(url: string): Promise<void> {
    logger.debug('[StorageServerService] Starting figure deletion...', { url });

    if (!url) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Figure URL is required'
      );
    }

    try {
      const blobName = url.split('/').pop();
      if (!blobName) {
        throw new ApplicationError(
          ErrorCode.INVALID_INPUT,
          'Invalid blob URL provided.'
        );
      }

      const containerClient =
        getBlobServiceClient().getContainerClient(CONTAINER_NAME);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.delete();

      logger.info(
        '[StorageServerService] Successfully deleted figure from Azure Blob Storage',
        { url }
      );
    } catch (error) {
      logger.error('[StorageServerService] Failed to delete figure', {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to delete figure from storage'
      );
    }
  }

  /**
   * Extracts text content from an uploaded document (DOCX, PDF, TXT).
   * @param file The parsed formidable file object.
   * @returns The extracted text content as a string.
   */
  static async extractTextFromFile(file: formidable.File): Promise<string> {
    logger.debug('[StorageServerService] Starting text extraction process...');

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file uploaded'
      );
    }

    const { filepath, originalFilename, mimetype } = file;
    logger.info(
      `[StorageServerService] Processing file for text extraction: ${originalFilename}`
    );

    try {
      const guardResult = await fileGuard(file, {
        acceptedTypes: ACCEPTED_DOCUMENT_TYPES,
        maxSize: MAX_FILE_SIZE,
        allowedExtensions: ['.docx', '.pdf', '.txt'],
        sanitizeFilename: true,
      });

      logger.info('[StorageServerService] File validated successfully', {
        originalFilename,
        sanitizedFilename: guardResult.sanitizedFilename,
        detectedMimeType: guardResult.detectedMimeType,
      });

      // Malware scanning (non-blocking for now)
      try {
        const scanResult = await scanFile(file, false); // false = don't block on threat
        logger.info('[StorageServerService] Malware scan completed', {
          filename: guardResult.sanitizedFilename,
          clean: scanResult.clean,
          scanner: scanResult.scanner,
        });
      } catch (scanError) {
        // Log but don't fail the upload
        logger.error('[StorageServerService] Malware scan failed', {
          filename: guardResult.sanitizedFilename,
          error: scanError,
        });
      }

      let extractedText = '';

      // Add timeout wrapper for text extraction operations
      const extractWithTimeout = async (
        extractionFn: () => Promise<string>,
        timeoutMs: number = 30000
      ) => {
        return Promise.race([
          extractionFn(),
          new Promise<string>((_, reject) =>
            setTimeout(
              () => reject(new Error('Text extraction timeout')),
              timeoutMs
            )
          ),
        ]);
      };

      if (
        guardResult.detectedMimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        logger.info('[StorageServerService] Extracting text from DOCX file');
        extractedText = await extractWithTimeout(async () => {
          const result = await mammoth.extractRawText({ path: filepath });
          return result.value;
        });
      } else if (guardResult.detectedMimeType === 'application/pdf') {
        logger.info('[StorageServerService] Extracting text from PDF file');
        extractedText = await extractWithTimeout(async () => {
          const dataBuffer = await fs.readFile(filepath);
          const data = await pdfParse(dataBuffer);
          return data.text;
        });
      } else if (
        guardResult.detectedMimeType === 'text/plain' ||
        guardResult.extension === '.txt'
      ) {
        logger.info('[StorageServerService] Reading text from TXT file');
        extractedText = await extractWithTimeout(async () => {
          return await fs.readFile(filepath, 'utf-8');
        });
      }

      if (!extractedText) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          'No text could be extracted from the file.'
        );
      }

      logger.info(
        `[StorageServerService] Successfully extracted text. Length: ${extractedText.length}`
      );
      return extractedText;
    } catch (error) {
      logger.error('[StorageServerService] Text extraction failed', {
        originalFilename,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
    // Note: File cleanup is handled by the calling function (uploadPatentDocument)
    // to avoid double cleanup issues
  }

  /**
   * Upload patent document securely (private storage)
   */
  static async uploadPatentDocument(
    file: formidable.File,
    fields: {
      userId: string;
      tenantId: string;
    }
  ): Promise<{
    blobName: string;
    fileName: string;
    mimeType: string;
    size: number;
  }> {
    logger.debug('[StorageServerService] Starting patent document upload...');

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file provided'
      );
    }

    const originalFilename = file.originalFilename || 'unnamed-patent';

    // Validate file
    let guardResult;
    try {
      guardResult = await fileGuard(file, {
        acceptedTypes: ACCEPTED_DOCUMENT_TYPES,
        maxSize: MAX_FILE_SIZE,
        allowedExtensions: ['.pdf', '.docx', '.doc', '.txt'],
        sanitizeFilename: true,
      });
    } catch (guardError) {
      logger.warn('[StorageServerService] Patent file validation failed', {
        filename: originalFilename,
        error:
          guardError instanceof Error ? guardError.message : String(guardError),
      });
      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        guardError instanceof Error ? guardError.message : 'Invalid file format'
      );
    }

    // Malware scan
    try {
      const scanResult = await scanFile(file, false);
      logger.info('[StorageServerService] Malware scan completed', {
        filename: guardResult.sanitizedFilename,
        clean: scanResult.clean,
      });
    } catch (scanError) {
      logger.error('[StorageServerService] Malware scan failed', {
        filename: guardResult.sanitizedFilename,
        error: scanError,
      });
    }

    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    try {
      // Generate secure blob name with tenant isolation
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const blobName = `${fields.tenantId}/${fields.userId}/${uuidv4()}-${timestamp}-${guardResult.sanitizedFilename}`;

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(
        PATENT_FILES_CONTAINER
      );

      // Ensure private container exists
      await containerClient.createIfNotExists(); // Private by default

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload to private blob storage
      await blockBlobClient.uploadFile(file.filepath, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype || 'application/octet-stream',
        },
        metadata: {
          originalName: originalFilename,
          uploadedBy: fields.userId,
          tenantId: fields.tenantId,
          uploadedAt: new Date().toISOString(),
        },
      });

      logger.info(
        '[StorageServerService] Patent document uploaded successfully',
        {
          blobName,
          container: PATENT_FILES_CONTAINER,
          size: file.size,
        }
      );

      return {
        blobName,
        fileName: originalFilename,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size,
      };
    } catch (error) {
      logger.error('[StorageServerService] Patent upload failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError(
        ErrorCode.STORAGE_UPLOAD_FAILED,
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      // Cleanup temp file
      try {
        await fs.unlink(file.filepath);
        logger.debug('[StorageServerService] Cleaned up temp file');
      } catch (cleanupError) {
        logger.warn('[StorageServerService] Failed to cleanup temp file', {
          error: cleanupError,
        });
      }
    }
  }

  /**
   * Upload office action document to secure storage
   * @param file Formidable file object
   * @param fields Upload context with user and tenant info
   * @returns Upload result with blob info
   */
  static async uploadOfficeActionDocument(
    file: formidable.File,
    fields: {
      userId: string;
      tenantId: string;
    }
  ): Promise<{
    blobName: string;
    fileName: string;
    mimeType: string;
    size: number;
  }> {
    logger.debug('[StorageServerService] Starting office action document upload...');

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file provided'
      );
    }

    const originalFilename = file.originalFilename || 'unnamed-office-action';

    // Validate file
    let guardResult;
    try {
      guardResult = await fileGuard(file, {
        acceptedTypes: ACCEPTED_DOCUMENT_TYPES,
        maxSize: MAX_FILE_SIZE,
        allowedExtensions: ['.pdf', '.docx', '.doc'],
        sanitizeFilename: true,
      });
    } catch (guardError) {
      logger.warn('[StorageServerService] Office action file validation failed', {
        filename: originalFilename,
        error:
          guardError instanceof Error ? guardError.message : String(guardError),
      });
      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        guardError instanceof Error ? guardError.message : 'Invalid file format'
      );
    }

    // Malware scan
    try {
      const scanResult = await scanFile(file, false);
      logger.info('[StorageServerService] Malware scan completed', {
        filename: guardResult.sanitizedFilename,
        clean: scanResult.clean,
      });
    } catch (scanError) {
      logger.error('[StorageServerService] Malware scan failed', {
        filename: guardResult.sanitizedFilename,
        error: scanError,
      });
    }

    const connectionString = environment.azure.storageConnectionString;
    if (!connectionString) {
      throw new ApplicationError(
        ErrorCode.CONFIG_MISSING,
        'Azure Storage connection string not configured'
      );
    }

    try {
      // Generate secure blob name with tenant isolation
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const blobName = `${fields.tenantId}/${fields.userId}/${uuidv4()}-${timestamp}-${guardResult.sanitizedFilename}`;

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(
        OFFICE_ACTIONS_CONTAINER  // Upload to office-actions-private container
      );

      // Ensure private container exists
      await containerClient.createIfNotExists(); // Private by default

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload to private blob storage
      await blockBlobClient.uploadFile(file.filepath, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype || 'application/pdf',
        },
        metadata: {
          originalName: originalFilename,
          uploadedBy: fields.userId,
          tenantId: fields.tenantId,
          uploadedAt: new Date().toISOString(),
          documentType: 'office-action',
        },
      });

      logger.info(
        '[StorageServerService] Office action document uploaded successfully',
        {
          blobName,
          container: OFFICE_ACTIONS_CONTAINER,
          size: file.size,
        }
      );

      return {
        blobName,
        fileName: originalFilename,
        mimeType: file.mimetype || 'application/pdf',
        size: file.size,
      };
    } catch (error) {
      logger.error('[StorageServerService] Office action upload failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError(
        ErrorCode.STORAGE_UPLOAD_FAILED,
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      // Cleanup temp file
      try {
        await fs.unlink(file.filepath);
        logger.debug('[StorageServerService] Cleaned up temp file');
      } catch (cleanupError) {
        logger.warn('[StorageServerService] Failed to cleanup temp file', {
          error: cleanupError,
        });
      }
    }
  }

  static async uploadInvention(
    req: NextApiRequest
  ): Promise<{ url: string; fileName: string; type: string | null }> {
    logger.debug(
      '[StorageServerService] Starting invention document upload process...'
    );

    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
    });
    const [_fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      logger.warn('[StorageServerService] No invention file found');
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'No file uploaded'
      );
    }

    const originalFilename = file.originalFilename || 'unnamed-file';

    let guardResult;
    try {
      guardResult = await fileGuard(file, {
        acceptedTypes: ACCEPTED_DOCUMENT_TYPES,
        maxSize: MAX_FILE_SIZE,
        allowedExtensions: ['.docx', '.pdf', '.txt'],
        sanitizeFilename: true,
      });
    } catch (guardError) {
      const err =
        guardError instanceof Error
          ? guardError
          : new Error(String(guardError));
      logger.warn('[StorageServerService] Invention file validation failed', {
        error: err,
        originalFilename,
      });

      throw new ApplicationError(
        ErrorCode.STORAGE_INVALID_FILE_TYPE,
        guardError instanceof ApplicationError
          ? guardError.message
          : 'File validation failed'
      );
    }

    logger.debug(`[StorageServerService] Validated invention document`, {
      originalFilename,
      sanitizedFilename: guardResult.sanitizedFilename,
      detectedMimeType: guardResult.detectedMimeType,
    });

    // Malware scanning (non-blocking for now)
    try {
      const scanResult = await scanFile(file, false);
      logger.info(
        '[StorageServerService] Malware scan completed for invention',
        {
          filename: guardResult.sanitizedFilename,
          clean: scanResult.clean,
          scanner: scanResult.scanner,
        }
      );
    } catch (scanError) {
      logger.error('[StorageServerService] Malware scan failed for invention', {
        filename: guardResult.sanitizedFilename,
        error: scanError,
      });
    }

    const fileBuffer = await fs.readFile(file.filepath);

    // Use sanitized filename for blob storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blobName = `${uuidv4()}-${timestamp}-${guardResult.sanitizedFilename}`;
    const containerClient = getBlobServiceClient().getContainerClient(
      INVENTION_CONTAINER_NAME
    );
    await containerClient.createIfNotExists({ access: 'blob' });
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length);
    const url = blockBlobClient.url;

    logger.info(
      `[StorageServerService] Successfully uploaded invention document to Azure. URL: ${url}`
    );

    await fs.unlink(file.filepath);
    logger.debug(
      `[StorageServerService] Cleaned up temp invention file: ${file.filepath}`
    );

    return {
      url: url,
      fileName: originalFilename,
      type: file.mimetype,
    };
  }
}

/**
 * Get storage connection string for both app and figure containers
 */
export function getStorageConnectionString(): string {
  const connectionString = environment.azure.storageConnectionString;

  if (!connectionString) {
    throw new ApplicationError(
      ErrorCode.ENV_VAR_MISSING,
      'Azure Storage connection string not configured'
    );
  }

  return connectionString;
}

/**
 * Create figure container client
 */
export function createFigureContainerClient(): ContainerClient {
  const connectionString = environment.azure.storageConnectionString;

  if (!connectionString) {
    throw new ApplicationError(
      ErrorCode.ENV_VAR_MISSING,
      'Azure Storage connection string not configured for figures'
    );
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient('figures');
}
