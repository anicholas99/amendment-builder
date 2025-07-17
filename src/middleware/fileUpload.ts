import { NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { fileGuard, FileGuardOptions } from '@/lib/security/fileGuard';
import { ApiHandler, AuthenticatedRequest } from '@/types/middleware';

const apiLogger = createApiLogger('file-upload-middleware');

export interface FileUploadRequest extends AuthenticatedRequest {
  file: File;
}

interface UploadedFile {
  originalFilename: string;
  mimetype: string;
  size: number;
  filepath: string;
}

/**
 * Middleware to handle file uploads using formidable.
 * It parses the request, validates the file, and attaches it to the request object.
 * It also ensures temporary files are cleaned up.
 *
 * @param fileOptions - Options for file validation (e.g., accepted types, max size).
 * @param handler - The next handler in the chain.
 */
export function withFileUpload(
  fileOptions: FileGuardOptions,
  handler: ApiHandler
): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Disable Next.js body parser for this route
    // This must be configured in the page's `export const config`
    const form = formidable({
      maxFileSize: fileOptions.maxSize,
      keepExtensions: true,
    });

    let tempFilePath: string | undefined;

    try {
      const [_fields, files] = await form.parse(req);
      const file = files.file?.[0];

      if (!file) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'No file uploaded.'
        );
      }
      tempFilePath = file.filepath;

      // Validate the file using the provided options
      await fileGuard(file, fileOptions);

      // Attach the file to the request object for the handler
      (req as FileUploadRequest).file = file;

      return await handler(req as FileUploadRequest, res);
    } finally {
      // Cleanup the temporary file
      if (tempFilePath) {
        try {
          await fs.unlink(tempFilePath);
        } catch (cleanupError) {
          apiLogger.error('Failed to clean up temporary file', {
            error: cleanupError,
            path: tempFilePath,
          });
        }
      }
    }
  };
}

/**
 * Parse file uploads with formidable
 */
export async function parseFileUpload(
  req: AuthenticatedRequest,
  options: formidable.Options = {}
): Promise<{
  file: UploadedFile;
}> {
  const form = formidable({
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowEmptyFiles: false,
    multiples: false,
    ...options,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      const file = files.file?.[0];
      if (!file) {
        reject(
          new ApplicationError(ErrorCode.VALIDATION_FAILED, 'No file uploaded.')
        );
        return;
      }

      const uploadedFile: UploadedFile = {
        originalFilename: file.originalFilename || 'unknown',
        mimetype: file.mimetype || 'application/octet-stream',
        size: file.size,
        filepath: file.filepath,
      };

      resolve({ file: uploadedFile });
    });
  });
}
