import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { transformProject, CreateProjectData } from '@/types/project';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { VALIDATION_LIMITS } from '@/constants/validation';
import { AuditService } from '@/server/services/audit.server-service';
import { logger } from '@/server/logger';

const createProjectSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME.MIN, 'Project name is required')
    .max(
      VALIDATION_LIMITS.NAME.MAX,
      `Project name must be less than ${VALIDATION_LIMITS.NAME.MAX} characters`
    )
    .trim(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
  textInput: z
    .string()
    .max(
      VALIDATION_LIMITS.INVENTION_TEXT.MAX,
      `Text input is too long (max ${VALIDATION_LIMITS.INVENTION_TEXT.MAX} characters)`
    )
    .optional(),
});

const getProjectsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z
    .string()
    .optional()
    .default(String(VALIDATION_LIMITS.DEFAULT_PAGE_SIZE))
    .transform(val => {
      const num = parseInt(val, 10);
      const capped = Math.min(num, VALIDATION_LIMITS.MAX_PAGE_SIZE);
      return String(capped);
    }),
  search: z
    .string()
    .max(
      VALIDATION_LIMITS.SEARCH_QUERY.MAX,
      `Search query is too long (max ${VALIDATION_LIMITS.SEARCH_QUERY.MAX} characters)`
    )
    .optional(),
  filterBy: z
    .enum(['all', 'recent', 'complete', 'in-progress', 'draft'])
    .optional()
    .default('all'),
  sortBy: z
    .enum(['name', 'created', 'modified', 'recent'])
    .optional()
    .default('modified'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects
 *     description: Retrieve all projects for the authenticated user within the specified tenant with filtering and sorting
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: header
 *         name: x-tenant-slug
 *         schema:
 *           type: string
 *           default: development
 *         required: false
 *         description: Tenant slug to filter projects
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter projects by name
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: string
 *           enum: [all, recent, complete, in-progress, draft]
 *           default: all
 *         description: Filter projects by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, created, modified, recent]
 *           default: modified
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     total:
 *                       type: integer
 *                       description: Total number of projects
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Whether there is a next page
 *                     hasPrevPage:
 *                       type: boolean
 *                       description: Whether there is a previous page
 *                     nextCursor:
 *                       type: string
 *                       description: Cursor to fetch the next page
 *             example:
 *               projects:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   title: "Smart Home Security System"
 *                   description: "IoT-based security system with AI detection"
 *                   status: "active"
 *                   patentType: "utility"
 *                   createdAt: "2024-01-20T10:30:00Z"
 *                   updatedAt: "2024-01-20T10:30:00Z"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 45
 *                 totalPages: 3
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *                 nextCursor: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create a new project
 *     description: Create a new patent project within the specified tenant
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *       - csrfToken: []
 *     parameters:
 *       - in: header
 *         name: x-tenant-slug
 *         schema:
 *           type: string
 *           default: development
 *         required: false
 *         description: Tenant slug for the new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 description: Project name
 *                 example: "Smart Home Security System"
 *               status:
 *                 type: string
 *                 enum: [draft, active, archived]
 *                 default: draft
 *                 description: Initial project status
 *               textInput:
 *                 type: string
 *                 description: Initial text description of the invention
 *                 example: "A system that uses AI to detect intruders..."

 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  // Cast to get typed request with services
  const authReq = req as AuthenticatedRequest & RequestWithServices;

  // User and tenant are guaranteed by middleware
  if (!authReq.user) {
    throw new Error('User is required but was not provided by middleware');
  }
  const { id: userId, tenantId } = authReq.user;

  // Get the request-scoped service
  const { projectService } = authReq.services;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  if (!['GET', 'POST'].includes(method || '')) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Only GET, POST requests are accepted.`,
    });
  }

  if (method === 'GET') {
    // SecurePresets middleware adds validatedQuery to the request
    interface RequestWithValidatedQuery extends AuthenticatedRequest {
      validatedQuery?: z.infer<typeof getProjectsQuerySchema>;
    }
    const reqWithQuery = req as RequestWithValidatedQuery;

    if (!reqWithQuery.validatedQuery) {
      throw new Error(
        'Validated query is required but was not provided by middleware'
      );
    }

    const {
      page: pageStr,
      limit: limitStr,
      search,
      filterBy,
      sortBy,
      sortOrder,
    } = reqWithQuery.validatedQuery;

    const page = parseInt(pageStr);
    const limit = parseInt(limitStr);

    // Call the service with proper pagination and filtering
    const result = await projectService.getProjectsForUserPaginated(
      userId,
      tenantId,
      {
        page,
        limit,
        search,
        filterBy,
        sortBy,
        sortOrder,
      }
    );

    const transformedProjects = result.projects.map(transformProject);

    // Debug logging to check hasProcessedInvention
    logger.debug('[API /projects] Projects response', {
      totalProjects: result.projects.length,
      projectsWithProcessedInvention: result.projects.filter(
        p => p.hasProcessedInvention
      ).length,
      firstProject: result.projects[0]
        ? {
            id: result.projects[0].id,
            name: result.projects[0].name,
            hasProcessedInvention: result.projects[0].hasProcessedInvention,
          }
        : null,
    });

    res.status(200).json({
      projects: transformedProjects,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextCursor: result.hasNextPage ? page + 1 : undefined,
      },
    });
    return;
  }

  if (method === 'POST') {
    const projectData = req.body as CreateProjectData;
    const newProject = await projectService.createProject(
      {
        name: projectData.name,
        status: projectData.status,
        textInput: projectData.textInput,
      },
      userId,
      tenantId
    );

    const transformedProject = transformProject(newProject);

    // Audit log the project creation
    await AuditService.logProjectAction(authReq, 'create', newProject.id, {
      projectName: newProject.name,
      status: newProject.status,
      hasTextInput: !!projectData.textInput,
    });

    res.status(201).json(transformedProject);
    return;
  }
};

// SECURITY: This endpoint is tenant-protected using the user's tenant
// Users can only list/create projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromUser,
  handler,
  {
    validate: {
      query: getProjectsQuerySchema,
      body: createProjectSchema,
      bodyMethods: ['POST'], // Only POST needs body validation
    },
    rateLimit: 'api',
  }
);
