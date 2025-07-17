import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/server/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { getInventionContextForChat } from '@/repositories/chatRepository';
import { sendSafeErrorResponse } from '@/utils/secureErrorResponse';
import { apiResponse } from '@/utils/api/responses';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';

const apiLogger = createApiLogger('debug-tools/chat-context');

/**
 * Debug endpoint to fetch complete chat context for a project
 * This mimics what the ChatContext would load
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  const { projectId } = req.query;
  const tenantId = req.user!.tenantId!;

  if (!projectId || typeof projectId !== 'string') {
    return apiResponse.badRequest(res, 'projectId is required');
  }

  try {
    const context = await getInventionContextForChat(projectId, tenantId);

    if (!context) {
      return apiResponse.notFound(res, 'No context found');
    }

    // Return detailed information about what the chat agent sees
    const summary = {
      project: {
        id: context.project.id,
        name: context.project.name,
        status: context.project.status,
      },
      invention: {
        exists: !!context.invention,
        id: context.invention?.id,
        title: context.invention?.title,
        hasParsedElements: context.invention?.parsedClaimElements?.length || 0,
      },
      claims: {
        count: context.claims.length,
        numbers: context.claims.map(c => c.number),
        preview: context.claims.slice(0, 2).map(c => ({
          number: c.number,
          textPreview: c.text.substring(0, 100) + '...',
        })),
      },
      savedPriorArt: {
        count: context.savedPriorArt.length,
      },
      figures: {
        count: context.figures.length,
      },
    };

    logger.info('[DebugChatContext] Context retrieved', summary);

    return apiResponse.ok(res, {
      summary,
      fullContext: context,
    });
  } catch (error) {
    logger.error('[DebugChatContext] Error', { error });
    sendSafeErrorResponse(
      res,
      error,
      500,
      'Failed to retrieve chat context. Check server logs for details.'
    );
  }
}

// SECURITY: This is an admin debug endpoint
// Only admin users can access chat context information
export default SecurePresets.adminTenant(TenantResolvers.fromUser, handler);
