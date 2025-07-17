/**
 * Tool Invocation Service
 * Handles tool/function calls from the AI chat interface
 */

import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import {
  ToolInvocation,
  ToolStatus,
  ToolInvocationMessage,
} from '@/features/chat/types/tool-invocation';
import { z } from 'zod';
import { validateApiResponse } from '@/lib/validation/apiValidation';

// Response schemas
const ToolInvocationResponseSchema = z.object({
  id: z.string(),
  toolName: z.string(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  parameters: z
    .array(
      z.object({
        name: z.string(),
        value: z.unknown().optional(),
        type: z.string().optional(),
      })
    )
    .optional(),
  result: z.unknown().optional(),
  error: z.string().optional(),
  startTime: z.number(),
  endTime: z.number().optional(),
  icon: z.string().optional(),
});

const ToolInvocationUpdateSchema = z.object({
  invocation: ToolInvocationResponseSchema,
  messageId: z.string(),
});

export type ToolInvocationResponse = z.infer<
  typeof ToolInvocationResponseSchema
>;
export type ToolInvocationUpdate = z.infer<typeof ToolInvocationUpdateSchema>;

// Tool invocation API routes
const getToolInvocationRoute = (projectId: string) =>
  `/api/projects/${projectId}/tool-invocations`;

export class ToolInvocationService {
  /**
   * Create a new tool invocation
   */
  static async createToolInvocation(
    projectId: string,
    toolName: string,
    parameters?: Record<string, unknown>
  ): Promise<ToolInvocation> {
    try {
      const response = await apiFetch(getToolInvocationRoute(projectId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, parameters }),
      });

      const data = await response.json();
      const validated = validateApiResponse(data, ToolInvocationResponseSchema);

      logger.info('[ToolInvocationService] Created tool invocation', {
        projectId,
        toolName,
        invocationId: validated.id,
      });

      return validated;
    } catch (error) {
      logger.error('[ToolInvocationService] Failed to create tool invocation', {
        projectId,
        toolName,
        error,
      });
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Failed to create tool invocation'
      );
    }
  }

  /**
   * Update tool invocation status
   */
  static async updateToolInvocationStatus(
    projectId: string,
    invocationId: string,
    status: ToolStatus,
    result?: unknown,
    error?: string
  ): Promise<ToolInvocation> {
    try {
      const response = await apiFetch(
        `${getToolInvocationRoute(projectId)}/${invocationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            result,
            error,
            endTime:
              status === 'completed' || status === 'failed'
                ? Date.now()
                : undefined,
          }),
        }
      );

      const data = await response.json();
      const validated = validateApiResponse(data, ToolInvocationResponseSchema);

      logger.info('[ToolInvocationService] Updated tool invocation status', {
        projectId,
        invocationId,
        status,
      });

      return validated;
    } catch (error) {
      logger.error('[ToolInvocationService] Failed to update tool invocation', {
        projectId,
        invocationId,
        status,
        error,
      });
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Failed to update tool invocation'
      );
    }
  }

  /**
   * Get tool invocation by ID
   */
  static async getToolInvocation(
    projectId: string,
    invocationId: string
  ): Promise<ToolInvocation> {
    try {
      const response = await apiFetch(
        `${getToolInvocationRoute(projectId)}/${invocationId}`
      );

      const data = await response.json();
      const validated = validateApiResponse(data, ToolInvocationResponseSchema);

      return validated;
    } catch (error) {
      logger.error('[ToolInvocationService] Failed to get tool invocation', {
        projectId,
        invocationId,
        error,
      });
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Failed to get tool invocation'
      );
    }
  }

  /**
   * Execute a tool and get results
   */
  static async executeToolInvocation(
    projectId: string,
    toolName: string,
    parameters?: Record<string, unknown>
  ): Promise<ToolInvocation> {
    try {
      const response = await apiFetch(
        `${getToolInvocationRoute(projectId)}/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolName, parameters }),
        }
      );

      const data = await response.json();
      const validated = validateApiResponse(data, ToolInvocationResponseSchema);

      logger.info('[ToolInvocationService] Executed tool invocation', {
        projectId,
        toolName,
        status: validated.status,
        duration: validated.endTime
          ? validated.endTime - validated.startTime
          : 'running',
      });

      return validated;
    } catch (error) {
      logger.error(
        '[ToolInvocationService] Failed to execute tool invocation',
        {
          projectId,
          toolName,
          parameters,
          error,
        }
      );
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Failed to execute tool invocation'
      );
    }
  }

  /**
   * Stream tool invocation updates via SSE
   */
  static subscribeToToolUpdates(
    projectId: string,
    messageId: string,
    onUpdate: (update: ToolInvocationUpdate) => void,
    onError?: (error: Error) => void
  ): () => void {
    const eventSource = new EventSource(
      `${getToolInvocationRoute(projectId)}/stream/${messageId}`
    );

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        const validated = validateApiResponse(data, ToolInvocationUpdateSchema);
        onUpdate(validated);
      } catch (error) {
        logger.error('[ToolInvocationService] Failed to parse SSE update', {
          error,
          data: event.data,
        });
        onError?.(error as Error);
      }
    };

    eventSource.onerror = error => {
      logger.error('[ToolInvocationService] SSE connection error', { error });
      onError?.(new Error('Tool update stream disconnected'));
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }
}
