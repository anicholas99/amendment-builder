import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { VALIDATION_LIMITS } from '@/constants/validation';
import { ProjectSharingService } from '@/server/services/project-sharing.server-service';

const shareProjectSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(VALIDATION_LIMITS.EMAIL.MAX, 'Email is too long'),
  role: z.enum(['viewer', 'editor', 'admin']).default('viewer'),
});

/**
 * @swagger
 * /api/projects/{projectId}/collaborators:
 *   get:
 *     summary: List project collaborators
 *     description: Get all collaborators for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: List of collaborators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collaborators:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [viewer, editor, admin]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           name:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   post:
 *     summary: Share project with user
 *     description: Add a collaborator to a project by email
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to share with
 *               role:
 *                 type: string
 *                 enum: [viewer, editor, admin]
 *                 default: viewer
 *                 description: Role to assign to the collaborator
 *     responses:
 *       201:
 *         description: Collaborator added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: User is already a collaborator
 */

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;
  const { projectId } = req.query;

  // Cast to get typed request
  const authReq = req as AuthenticatedRequest & RequestWithServices;

  // User is guaranteed by middleware
  if (!authReq.user) {
    throw new Error('User is required but was not provided by middleware');
  }
  const { id: userId } = authReq.user;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Project ID is required',
    });
  }

  if (!['GET', 'POST'].includes(method || '')) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Only GET and POST requests are accepted.`,
    });
  }

  if (method === 'GET') {
    try {
      const collaborators = await ProjectSharingService.getCollaborators(
        projectId,
        userId
      );

      res.status(200).json({ collaborators });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to get collaborators',
      });
    }
    return;
  }

  if (method === 'POST') {
    const { email, role } = req.body;

    try {
      const collaborator = await ProjectSharingService.shareProject(
        {
          projectId,
          userEmail: email,
          role: role || 'viewer',
        },
        userId,
        authReq
      );

      res.status(201).json(collaborator);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to share project',
      });
    }
    return;
  }
};

// SECURITY: Project sharing requires tenant validation
// The resolver ensures the project belongs to the user's tenant
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  if (!projectId || typeof projectId !== 'string') {
    return null;
  }

  const { prisma } = await import('@/lib/prisma');
  if (!prisma) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { tenantId: true },
  });

  return project?.tenantId || null;
};

export default SecurePresets.tenantProtected(resolveTenantId, handler, {
  validate: {
    body: shareProjectSchema,
    bodyMethods: ['POST'],
  },
  rateLimit: 'api',
});
