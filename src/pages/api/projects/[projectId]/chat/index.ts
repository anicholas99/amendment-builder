import type { NextApiResponse, NextApiRequest } from 'next';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import {
  getRecentMessages,
  deleteProjectHistory,
} from '@/repositories/chatRepository';
import { logger } from '@/server/logger';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { apiResponse } from '@/utils/api/responses';

interface EmptyBody {}

const querySchema = z.object({
  projectId: z.string().uuid(),
});

async function baseHandler(
  req: CustomApiRequest<EmptyBody>,
  res: NextApiResponse
): Promise<void> {
  // Query parameters are validated by middleware
  const { projectId } = (req as any).validatedQuery as z.infer<
    typeof querySchema
  >;

  switch (req.method) {
    case 'GET': {
      const messages = await getRecentMessages(projectId, 50);
      return apiResponse.ok(res, { messages });
    }
    case 'DELETE': {
      await deleteProjectHistory(projectId);
      return apiResponse.ok(res, { success: true });
    }
    default:
      return apiResponse.methodNotAllowed(res, ['GET', 'DELETE']);
  }
}

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  baseHandler,
  {
    validate: {
      query: querySchema, // Always validate the projectId parameter
    },
  }
);
