import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { projectService } from '@/server/services/project.server-service';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { transformProject } from '@/types/project';
import { z } from 'zod';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { SavedPriorArt } from '@/features/search/types';
import { getProjectTenantId } from '@/repositories/project';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Define request body type for project updates
interface UpdateProjectBody {
  title?: string;
  description?: string;
  textInput?: string;
  status?: string;
  name?: string;
}

// Configure API route to accept larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase limit to 10MB
    },
  },
};

// Zod schema for project update
const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  textInput: z.string().optional(),
  status: z.string().optional(),
  name: z.string().optional(),
});

const apiLogger = createApiLogger('projects/[projectId]');

async function handler(
  req: CustomApiRequest<UpdateProjectBody>,
  res: NextApiResponse
): Promise<void> {
  apiLogger.logRequest(req); // Log request with logger

  const { method } = req;
  // Query parameters are validated by middleware
  const { projectId } = (req as any).validatedQuery as z.infer<
    typeof projectIdQuerySchema
  >;

  // Validate HTTP method
  if (!['GET', 'PUT', 'DELETE'].includes(method || '')) {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${method} Not Allowed`
    );
  }

  // User and tenant context guaranteed by middleware
  const { id: userId, tenantId } = (req as AuthenticatedRequest).user!;

  if (!projectId) {
    throw new ApplicationError(
      ErrorCode.PROJECT_ID_REQUIRED,
      'Project ID is required'
    );
  }

  try {
    if (method === 'GET') {
      // Use service layer to get project
      const project = await projectService.getProjectById(
        projectId,
        userId,
        tenantId!
      );

      if (!project) {
        throw new ApplicationError(
          ErrorCode.PROJECT_NOT_FOUND,
          'Project not found'
        );
      }

      // Map fields for savedPriorArtItems
      const mappedPriorArt: SavedPriorArt[] = project.savedPriorArtItems.map(
        (item: any) => {
          // Work with the item as it comes from the repository
          return {
            id: item.id,
            projectId: item.projectId,
            number: item.patentNumber,
            patentNumber: item.patentNumber,
            title: item.title || 'Untitled',
            relevance: 0,
            year: item.publicationDate || undefined,
            authors: item.authors || undefined,
            abstract: item.abstract || undefined,
            url: item.url || undefined,
            publicationDate: item.publicationDate || undefined,
            notes: item.notes || undefined,
            savedAt: item.savedAt,
            dateAdded: item.savedAt.toISOString(),
            claim1: item.claim1 || undefined,
            summary: item.summary || undefined,
          };
        }
      );

      const projectWithMappedPriorArt = {
        ...project,
        savedPriorArtItems: mappedPriorArt,
      };

      // Transform the project data for the frontend
      const transformedProject = transformProject(projectWithMappedPriorArt);
      res.status(200).json(transformedProject);
      return;
    }

    if (method === 'PUT') {
      apiLogger.debug('Raw request body', { body: req.body });

      // The validation is now part of the main middleware chain
      // and does not need a special wrapper.
      const updatedProject = await projectService.updateProject(
        projectId,
        {
          name: req.body.name || req.body.title, // Handle both name and title
          status: req.body.status as any, // Service will validate
          textInput: req.body.textInput,
        },
        userId,
        tenantId!
      );

      // No need to re-fetch, the service now returns the full object.
      // Transform for the response
      const transformedProject = transformProject(updatedProject);
      res.status(200).json(transformedProject);
      return;
    }

    if (method === 'DELETE') {
      // Use service layer to delete the project
      await projectService.deleteProject(projectId, userId, tenantId!);
      res.status(204).end();
      return;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    // Log the error and re-throw for the centralized error handler
    apiLogger.error('Error in project handler', {
      error: err,
      projectId,
      userId,
      tenantId,
    });
    throw error;
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only access/modify projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdQuerySchema, // Always validate the project ID parameter
      body: updateProjectSchema,
      bodyMethods: ['PUT'], // Only PUT needs body validation
    },
    rateLimit: 'api',
  }
);
