import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';
import { saveChatMessage } from '@/repositories/chatRepository';
import { ChatAgentService } from '@/server/services/chat-agent.server-service';
import { logger } from '@/lib/monitoring/logger';

const bodySchema = z.object({
  projectId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  pageContext: z.enum(['technology', 'claim-refinement', 'patent']).optional(),
  lastAction: z.object({
    type: z.enum(['claim-revised', 'claim-added', 'claim-deleted', 'claims-mirrored', 'claims-reordered']),
    claimNumber: z.number().optional(),
    claimNumbers: z.array(z.number()).optional(),
    details: z.string().optional(),
  }).optional(),
});

type StreamBody = z.infer<typeof bodySchema>;

async function handler(
  req: AuthenticatedRequest & { body: StreamBody },
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { projectId, messages, pageContext, lastAction } = req.body;
  const userMessage = messages[messages.length - 1];
  // Get tenantId from the authenticated user (withTenantGuard validates but doesn't set req.tenantId)
  const tenantId = req.user?.tenantId;

  // Debug logging
  logger.info('[ChatStream] Request received', {
    projectId,
    tenantId,
    hasProjectId: !!projectId,
    hasTenantId: !!tenantId,
    userId: req.user?.id,
    messageCount: messages.length,
    pageContext,
  });

  try {
    // Persist user message
    await saveChatMessage({
      projectId,
      role: 'user',
      content: userMessage.content,
    });

    // Send immediate thinking event to prevent UI freeze
    res.write('event: thinking\n');
    res.write('data: {"status": "thinking"}\n\n');
    
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    // Use streaming response generation
    const responseStream = ChatAgentService.generateResponseStream({
      projectId,
      messages,
      tenantId,
      pageContext,
      lastAction,
    });

    let fullResponse = '';
    
    // Stream tokens as they're generated
    for await (const chunk of responseStream) {
      if (chunk.error) {
        logger.error('[ChatStream] Error in response stream', { error: chunk.error });
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
        res.end();
        return;
      }
      
      if (chunk.token) {
        fullResponse += chunk.token;
        // Send token to client
        res.write(`data: ${JSON.stringify({ 
          role: 'assistant', 
          content: chunk.token,
          isPartial: true 
        })}\n\n`);
        
        // Flush periodically for better real-time experience
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }
      
      if (chunk.done) {
        // Persist the complete assistant message
        await saveChatMessage({
          projectId,
          role: 'assistant',
          content: fullResponse,
        });
        
        // Send final complete message
        res.write(`data: ${JSON.stringify({ 
          role: 'assistant', 
          content: fullResponse,
          isComplete: true 
        })}\n\n`);
      }
    }

    // Notify client we are done
    res.write('event: done\n');
    res.write('data: {}\n\n');

    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }

    res.end();
  } catch (error) {
    logger.error('[ChatStream] Internal error generating chat', { error });
    res.write('event: error\n');
    res.write(
      `data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`
    );
    res.end();
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromBodyField('projectId'),
  handler,
  {
    validate: {
      body: bodySchema,
    },
  }
);
