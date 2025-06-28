import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { withMethod } from '@/middleware/method';
import { getInventionContextForChat } from '@/repositories/chatRepository';
import { logger } from '@/lib/monitoring/logger';
import { sendSafeErrorResponse } from '@/utils/secure-error-response';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const tenantId = (req as any).user?.tenantId;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'projectId is required' });
  }

  if (!tenantId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const context = await getInventionContextForChat(projectId, tenantId);

    if (!context) {
      return res.status(404).json({
        error: 'No context found',
        projectId,
        tenantId,
      });
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
    };

    logger.info('[DebugChatContext] Context retrieved', summary);

    return res.status(200).json({
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

export default withAuth(withMethod('GET', handler));
