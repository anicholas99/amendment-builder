import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { StorageServerService } from '@/server/services/storage.server-service';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { figureRepository } from '@/repositories/figure';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import formidable from 'formidable';
import {
  validateFileMetadata,
  FILE_SIZE_LIMITS,
  figureUploadFieldsSchema,
  type FigureUploadFields,
} from '@/lib/validation/schemas/fileUploadSchemas';

const apiLogger = createApiLogger('projects/figures');

// Query validation for projectId
const querySchema = z.object({
  projectId: z.string(),
  includeElements: z.enum(['true', 'false']).optional(),
});

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  const { projectId } = req.query as z.infer<typeof querySchema>;

  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  try {
    if (req.method === 'GET') {
      // Check if the request wants elements included
      const includeElements = req.query.includeElements === 'true';

      if (includeElements) {
        // Get figures with their elements using the new normalized structure
        apiLogger.info('Getting figures with elements for project', {
          projectId,
        });

        const figures =
          await figureRepository.getFiguresWithElements(projectId);

        apiLogger.info('Successfully retrieved figures with elements', {
          projectId,
          figureCount: figures.length,
        });

        return res.status(200).json({ figures });
      } else {
        // Get figures for the project (legacy format)
        apiLogger.info('Getting figures for project', { projectId });

        // User and tenant are guaranteed by the secure preset
        const userId = req.user!.id;
        const tenantId = req.user!.tenantId!;

        // Import and use the repository
        const { listProjectFigures } = await import('@/repositories/figure');
        const figures = await listProjectFigures(projectId, userId, tenantId);

        // Transform to API response format
        const responseData = figures.map(figure => ({
          id: figure.id,
          status: (figure as any).status || 'UPLOADED', // Include status field, default to UPLOADED for backwards compatibility
          figureKey: figure.figureKey,
          fileName: figure.fileName,
          description: figure.description,
          url: `/api/projects/${projectId}/figures/${figure.id}/download`,
          uploadedAt: figure.createdAt,
          sizeBytes: figure.sizeBytes,
          mimeType: figure.mimeType,
        }));

        return res.status(200).json({ figures: responseData });
      }
    }

    if (req.method === 'POST') {
      // Upload new figure
      apiLogger.info('Starting figure upload for project', { projectId });

      // Pre-validate the request using formidable with strict limits
      const form = formidable({
        maxFileSize: FILE_SIZE_LIMITS.IMAGE,
        maxFiles: 1,
        allowEmptyFiles: false,
        keepExtensions: true,
      });

      apiLogger.info('Parsing multipart form data for figure upload');

      const [fields, files] = await form.parse(req);
      const file = files.file?.[0];

      if (!file) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'No file provided in upload request'
        );
      }

      // Validate file metadata using our Zod schema
      apiLogger.info('Validating figure file metadata', {
        filename: file.originalFilename,
        size: file.size,
        mimetype: file.mimetype,
      });

      try {
        validateFileMetadata(file, 'image');
      } catch (validationError) {
        apiLogger.warn('Figure validation failed', {
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
            : 'Invalid image format'
        );
      }

      // Validate form fields
      const fieldData: FigureUploadFields = {
        projectId: fields.projectId?.[0] || projectId,
        figureKey: fields.figureKey?.[0],
        description: fields.description?.[0],
      };

      try {
        figureUploadFieldsSchema.parse(fieldData);
      } catch (fieldError) {
        apiLogger.warn('Figure field validation failed', {
          fields: fieldData,
          error:
            fieldError instanceof Error
              ? fieldError.message
              : String(fieldError),
        });

        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'Invalid upload parameters'
        );
      }

      // Validation passed, proceed with secure upload
      apiLogger.info('Figure validation passed, proceeding with upload', {
        projectId,
        figureKey: fieldData.figureKey,
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
      });

      // Tenant ID is guaranteed by the secure preset
      const tenantId = req.user!.tenantId!;
      const userId = req.user!.id;

      // Call the storage service to handle the secure upload
      // StorageServerService will perform additional security checks (fileGuard, malware scan)
      const response = await StorageServerService.uploadFigure(
        file,
        {
          projectId,
          userId,
          figureKey: fieldData.figureKey,
        },
        tenantId
      );

      apiLogger.info('Figure uploaded successfully', {
        projectId,
        figureId: response.id,
        fileName: response.fileName,
        secureUrl: response.url,
      });

      apiLogger.logResponse(201, response);
      return res.status(201).json(response);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    apiLogger.error('Failed to handle figures request', {
      projectId,
      method: req.method,
      error: error instanceof Error ? error : String(error),
    });

    if (error instanceof ApplicationError) {
      sendSafeErrorResponse(res, error, error.statusCode || 500, error.message);
      return;
    }

    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to process request. Please try again later.'
    );
  }
}

// Use the new secure preset
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
