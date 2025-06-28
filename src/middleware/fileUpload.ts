import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { fileGuard, FileGuardOptions } from '@/lib/security/fileGuard';
import { ApiHandler, AuthenticatedRequest } from '@/types/middleware';

const apiLogger = createApiLogger('file-upload-middleware');

export interface FileUploadRequest extends AuthenticatedRequest {
  file: File;
}

/**
 * Middleware to handle file uploads using formidable.
 * It parses the request, validates the file, and attaches it to the request object.
 * It also ensures temporary files are cleaned up.
 *
 * @param fileOptions - Options for file validation (e.g., accepted types, max size).
 * @param handler - The next handler in the chain.
 */
export const withFileUpload = (
  fileOptions: FileGuardOptions,
  handler: ApiHandler<FileUploadRequest>
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Disable Next.js body parser for this route
    // This must be configured in the page's `export const config`
    const form = formidable({
      maxFileSize: fileOptions.maxSize,
      keepExtensions: true,
    });

    let tempFilePath: string | undefined;

    try {
      const [fields, files] = await form.parse(req);
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
};
