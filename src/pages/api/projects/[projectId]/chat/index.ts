import type { NextApiResponse, NextApiRequest } from 'next';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import {
  getRecentMessages,
  deleteProjectHistory,
} from '@/repositories/chatRepository';
import { logger } from '@/lib/monitoring/logger';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

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
      res.status(200).json({ messages });
      return;
    }
    case 'DELETE': {
      await deleteProjectHistory(projectId);
      res.status(200).json({ success: true });
      return;
    }
    default:
      res.setHeader('Allow', 'GET, DELETE');
      res.status(405).end('Method Not Allowed');
      return;
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
