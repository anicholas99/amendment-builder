import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';
import { SecurePresets } from '@/server/api/securePresets';
import { ProjectSharingService } from '@/server/services/project-sharing.server-service';

const updateRoleSchema = z.object({
  role: z.enum(['viewer', 'editor', 'admin']),
});

/**
 * @swagger
 * /api/projects/{projectId}/collaborators/{userId}:
 *   delete:
 *     summary: Remove a collaborator
 *     description: Remove a collaborator from a project
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to remove
 *     responses:
 *       204:
 *         description: Collaborator removed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   patch:
 *     summary: Update collaborator role
 *     description: Update the role of a collaborator
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
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [viewer, editor, admin]
 *                 description: New role for the collaborator
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;
  const { projectId, userId: targetUserId } = req.query;

  // Cast to get typed request
  const authReq = req as AuthenticatedRequest & RequestWithServices;

  // User is guaranteed by middleware
  if (!authReq.user) {
    throw new Error('User is required but was not provided by middleware');
  }
  const { id: currentUserId } = authReq.user;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Project ID is required',
    });
  }

  if (!targetUserId || typeof targetUserId !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'User ID is required',
    });
  }

  if (!['DELETE', 'PATCH'].includes(method || '')) {
    res.setHeader('Allow', ['DELETE', 'PATCH']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Only DELETE and PATCH requests are accepted.`,
    });
  }

  if (method === 'DELETE') {
    try {
      const removed = await ProjectSharingService.removeCollaborator(
        projectId,
        targetUserId,
        currentUserId,
        authReq
      );

      if (removed) {
        res.status(204).end();
      } else {
        res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Collaborator not found',
        });
      }
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to remove collaborator',
      });
    }
    return;
  }

  if (method === 'PATCH') {
    const { role } = req.body;

    try {
      const updated = await ProjectSharingService.updateCollaboratorRole(
        {
          projectId,
          userId: targetUserId,
          role,
        },
        currentUserId,
        authReq
      );

      res.status(200).json(updated);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to update collaborator role',
      });
    }
    return;
  }
};

// SECURITY: Collaborator management requires tenant validation
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
    body: updateRoleSchema,
    bodyMethods: ['PATCH'],
  },
  rateLimit: 'api',
});
