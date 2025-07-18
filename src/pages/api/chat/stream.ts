import type { NextApiResponse } from 'next';
import { z } from 'zod';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { saveChatMessage } from '@/repositories/chatRepository';
// MIGRATION: Switching to OpenAI Function Calling for better reliability
// To rollback: Uncomment the line below and comment out the new import
// import { ChatAgentService } from '@/server/services/chat-agent.server-service';
import { ChatAgentFunctionsService as ChatAgentService } from '@/server/services/chat-agent-functions.server-service';
import { logger } from '@/server/logger';
import { apiResponse } from '@/utils/api/responses';

// Message schemas supporting tool invocations
const userAssistantSystemSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const toolInvocationParam = z.object({
  name: z.string(),
  value: z.any(),
  type: z.string().optional(),
});

const toolInvocationSchema = z.object({
  id: z.string(),
  toolName: z.string(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  parameters: z.array(toolInvocationParam).optional(),
  result: z.any().optional(),
  error: z.string().optional(),
  startTime: z.number(),
  endTime: z.number().optional(),
  icon: z.string().optional(),
});

const toolMessageSchema = z
  .object({
    role: z.literal('tool'),
    content: z.string().optional().default(''),
    toolInvocations: z.array(toolInvocationSchema).optional(),
    toolInvocation: toolInvocationSchema.optional(),
  })
  .passthrough(); // allow other tracking fields like isStreaming, timestamp, id

const bodySchema = z.object({
  projectId: z.string(),
  messages: z.array(z.union([userAssistantSystemSchema, toolMessageSchema])),
  pageContext: z.enum(['technology', 'claim-refinement', 'patent']).optional(),
  sessionId: z.string().optional(),
  lastAction: z
    .object({
      type: z.enum([
        'claim-revised',
        'claim-added',
        'claim-deleted',
        'claims-mirrored',
        'claims-reordered',
      ]),
      claimNumber: z.number().optional(),
      claimNumbers: z.array(z.number()).optional(),
      details: z.string().optional(),
    })
    .optional(),
  selectedOfficeActionId: z.string().optional(),
});

type StreamBody = z.infer<typeof bodySchema>;

async function handler(
  req: AuthenticatedRequest & { body: StreamBody },
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    return apiResponse.methodNotAllowed(res, ['POST']);
  }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { projectId, messages, pageContext, lastAction, sessionId, selectedOfficeActionId } = req.body;
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
    selectedOfficeActionId,
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
      sessionId,
      officeActionId: selectedOfficeActionId,
    });

    let fullResponse = '';
    let hasReceivedContent = false;

    // Stream tokens as they're generated
    for await (const chunk of responseStream) {
      if (chunk.error) {
        logger.error('[ChatStream] Error in response stream', {
          error: chunk.error,
        });
        res.write('event: error\n');
        res.write(`data: ${JSON.stringify({ error: chunk.error })}\n\n`);
        res.end();
        return;
      }

      // Handle tool invocation events
      if (chunk.toolInvocation) {
        res.write('event: tool\n');
        res.write(
          `data: ${JSON.stringify({
            role: 'tool',
            toolInvocation: chunk.toolInvocation,
          })}\n\n`
        );

        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }

      if (chunk.token) {
        fullResponse += chunk.token;
        hasReceivedContent = true;
        // Send token to client
        res.write(
          `data: ${JSON.stringify({
            role: 'assistant',
            content: chunk.token,
            isPartial: true,
          })}\n\n`
        );

        // Flush periodically for better real-time experience
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }

      if (chunk.done) {
        // The stream has explicitly signaled completion
        break;
      }
    }

    // Always send the final complete message if we have content
    if (hasReceivedContent && fullResponse) {
      // Persist the complete assistant message
      await saveChatMessage({
        projectId,
        role: 'assistant',
        content: fullResponse,
      });

      // Send final complete message
      res.write(
        `data: ${JSON.stringify({
          role: 'assistant',
          content: fullResponse,
          isComplete: true,
        })}\n\n`
      );
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
