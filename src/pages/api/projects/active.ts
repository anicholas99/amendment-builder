import { NextApiResponse, NextApiRequest } from 'next';
import { z } from 'zod';
import { CustomApiRequest } from '@/types/api';
import { logger } from '@/server/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  getUserPreference,
  setUserPreference,
  deleteUserPreference,
} from '../../../repositories/userPreferenceRepository';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  findMostRecentProjectIdForTenantUser,
  findProjectByIdForTenantUser,
  getProjectTenantId,
} from '../../../repositories/project';
import { SecurePresets } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

// Validation schema for PUT request
const putBodySchema = z.object({
  activeProjectId: z.string().uuid('Invalid project ID format'),
});

// Define request body type for PUT requests
interface ActiveProjectBody {
  activeProjectId: string;
}

const baseHandler = async (
  req: CustomApiRequest<ActiveProjectBody> & AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  // User and tenant are guaranteed by middleware
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  // Handle different HTTP methods
  switch (method) {
    case 'GET':
      // First attempt to get the user's active project preference using repository
      const activeProjectIdPreference = await getUserPreference(
        userId,
        'activeProject'
      );

      // If we found a preference with an active project, return it
      if (activeProjectIdPreference) {
        // Optionally, verify this project still exists and belongs to the user/tenant
        const preferredProject = await findProjectByIdForTenantUser(
          activeProjectIdPreference,
          userId,
          tenantId
        );
        if (preferredProject) {
          return apiResponse.ok(res, {
            activeProjectId: activeProjectIdPreference,
          });
        }
        // If preferred project not found/accessible, clear the preference and fall through
        logger.warn(
          `[projects/active] Preferred active project ${activeProjectIdPreference} no longer accessible for user ${userId}, tenant ${tenantId}. Clearing preference.`
        );
        await deleteUserPreference(userId, 'activeProject');
      }

      // Otherwise fall back to the most recently updated project using repository
      const recentProjectId = await findMostRecentProjectIdForTenantUser(
        userId,
        tenantId
      );

      if (!recentProjectId) {
        return apiResponse.ok(res, { activeProjectId: null });
      }

      // Return the project ID of the most recent project
      return apiResponse.ok(res, {
        activeProjectId: recentProjectId,
      });

    case 'PUT':
      // Body is already validated by withValidation middleware
      const { activeProjectId } = req.body;

      // Verify the project exists and belongs to the user and tenant using repository
      const project = await findProjectByIdForTenantUser(
        activeProjectId,
        userId,
        tenantId
      );

      if (!project) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Project not found or not accessible by user in this tenant'
        );
      }

      // Update or create the user preference using repository
      const setResult = await setUserPreference(
        userId,
        'activeProject',
        activeProjectId
      );

      if (!setResult) {
        logger.error(
          `Failed to set active project preference for user ${userId}`
        );
        throw new ApplicationError(
          ErrorCode.DB_QUERY_ERROR,
          'Failed to set active project preference'
        );
      }

      return apiResponse.ok(res, { success: true });

    case 'DELETE':
      // Remove the active project preference using repository
      await deleteUserPreference(userId, 'activeProject');
      // Ignore return value, as we don't care if it existed or not
      logger.info(
        `Removed active project preference for user ${userId} if it existed.`
      );

      return apiResponse.ok(res, { success: true });

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Method ${method} Not Allowed`
      );
  }
};

// Custom tenant resolver for this endpoint
const activeProjectTenantResolver = async (
  req: AuthenticatedRequest
): Promise<string | null> => {
  // For all methods, use the user's tenant since this is a user preference
  // The user should only be able to set projects from their current tenant as active
  return req.user?.tenantId || null;
};

// SECURITY: This endpoint uses a custom tenant resolver
// - GET/DELETE: Uses user's tenant for preferences
// - PUT: Validates the project belongs to user's tenant before setting as active
export default SecurePresets.tenantProtected(
  activeProjectTenantResolver,
  baseHandler,
  {
    validate: {
      body: putBodySchema,
      bodyMethods: ['PUT'], // Only PUT needs body validation
    },
    rateLimit: 'api',
  }
);
