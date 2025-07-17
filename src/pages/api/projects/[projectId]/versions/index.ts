import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  findProjectForAccess,
  findApplicationVersionsByProject,
  findLatestApplicationVersionWithDocuments,
  createApplicationVersionWithDocuments,
  getProjectTenantId,
} from '@/repositories/project';
import { CustomApiRequest } from '@/types/api';
import { z, ZodError } from 'zod';
import {
  projectIdQuerySchema,
  latestQuerySchema,
} from '@/lib/validation/schemas/shared/querySchemas';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';

const apiLogger = createApiLogger('projects/versions');

// Define a flexible schema for version sections
const SectionSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  order: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Define validation schema for POST requests
const postSchema = z.object({
  name: z.string().min(1, 'Version name is required').max(255),
  sections: z.array(SectionSchema).optional(), // Now properly typed for flexibility
});

// Define request body type from schema
type CreateVersionBody = z.infer<typeof postSchema>;

// Combine query schemas for this endpoint
const querySchema = projectIdQuerySchema.merge(
  z.object({
    latest: z.coerce.boolean().optional().default(false),
  })
);

/**
 * Handles API requests for project versions
 * GET: Retrieves all versions for a project
 * POST: Creates a new version for a project
 */
async function handler(
  req: CustomApiRequest<CreateVersionBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req);

  // User is guaranteed by middleware
  const { id: userId } = (req as AuthenticatedRequest).user!;
  const { method } = req;
  // Query parameters are validated by middleware
  const { projectId, latest } = req.query;

  // Handle GET request - List versions
  if (method === 'GET') {
    try {
      // Check for 'latest' query param (no longer needed, validated above)
      const getLatest = latest;
      apiLogger.debug('Processing GET request', {
        projectId,
        getLatest,
        userId,
      });

      if (getLatest) {
        // Get the most recent version with its documents using repository
        const latestApplicationVersion =
          await findLatestApplicationVersionWithDocuments(String(projectId));

        if (!latestApplicationVersion) {
          apiLogger.info('No versions found', { projectId, userId });
          res.status(404).json({ error: 'No versions found' });
          return;
        }

        apiLogger.info('Latest version retrieved', {
          projectId,
          userId,
          versionId: latestApplicationVersion.id,
          documentCount: latestApplicationVersion.documents.length,
        });

        const response = latestApplicationVersion;
        apiLogger.logResponse(200, response);
        res.status(200).json(response);
        return;
      }

      // Regular version listing using repository
      const versions = await findApplicationVersionsByProject(
        String(projectId)
      );

      apiLogger.info('Versions retrieved', {
        projectId,
        userId,
        count: versions.length,
      });

      const response = versions;
      apiLogger.logResponse(200, response);
      res.status(200).json(response);
    } catch (caughtError: unknown) {
      const error =
        caughtError instanceof Error
          ? caughtError
          : new Error(String(caughtError));
      apiLogger.logError(error, {
        projectId: String(projectId),
        userId,
        operation: 'getVersions',
      });
      res.status(500).json({ error: 'Failed to fetch versions' });
    }
    return;
  }

  // Handle POST request - Create new version
  if (method === 'POST') {
    try {
      const { name, sections } = req.body;

      if (!name || typeof name !== 'string') {
        apiLogger.warn('Missing or invalid version name', {
          projectId,
          userId,
        });
        res.status(400).json({ error: 'Version name is required' });
        return;
      }

      apiLogger.debug('Creating new version', {
        projectId,
        userId,
        name,
        hasSections: !!sections,
      });

      // Create new version from draft documents
      const { createApplicationVersionFromDraft } = await import(
        '@/repositories/project'
      );

      const newVersion = await createApplicationVersionFromDraft(
        String(projectId),
        userId,
        name
      );

      apiLogger.info('Version created successfully', {
        projectId,
        userId,
        versionId: newVersion.id,
        documentCount: newVersion.documents.length,
      });

      const response = newVersion;
      apiLogger.logResponse(201, response);
      res.status(201).json(response);
    } catch (caughtError: unknown) {
      const error =
        caughtError instanceof Error
          ? caughtError
          : new Error(String(caughtError));
      apiLogger.logError(error, {
        projectId,
        userId,
        operation: 'createVersion',
      });
      res.status(500).json({ error: 'Failed to create version' });
    }
    return;
  }

  apiLogger.warn('Method not allowed', { method: req.method, userId });
  res.status(405).json({ error: 'Method not allowed' });
}

// Use the new secure preset, which applies tenant protection to all methods
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);
