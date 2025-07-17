/**
 * React Query hooks for tool invocation operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { ToolInvocationService } from '@/services/api/toolInvocationService';
import { chatKeys } from '@/lib/queryKeys';
import { logger } from '@/utils/clientLogger';
import {
  ToolInvocation,
  ToolStatus,
  ToolInvocationMessage,
} from '@/features/chat/types/tool-invocation';

// Query key factory for tool invocations
export const toolInvocationKeys = {
  all: (projectId: string) =>
    [...chatKeys.all, projectId, 'tool-invocations'] as const,
  byId: (projectId: string, invocationId: string) =>
    [...toolInvocationKeys.all(projectId), invocationId] as const,
};

/**
 * Hook to get a specific tool invocation
 */
export function useToolInvocation(
  projectId: string,
  invocationId: string,
  enabled = true
) {
  return useQuery({
    queryKey: toolInvocationKeys.byId(projectId, invocationId),
    queryFn: () =>
      ToolInvocationService.getToolInvocation(projectId, invocationId),
    enabled: enabled && !!projectId && !!invocationId,
  });
}

/**
 * Hook to create a new tool invocation
 */
export function useCreateToolInvocation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      toolName,
      parameters,
    }: {
      toolName: string;
      parameters?: Record<string, any>;
    }) =>
      ToolInvocationService.createToolInvocation(
        projectId,
        toolName,
        parameters
      ),

    onSuccess: data => {
      // Update query cache
      queryClient.setQueryData(
        toolInvocationKeys.byId(projectId, data.id),
        data
      );

      logger.info('[useCreateToolInvocation] Tool invocation created', {
        projectId,
        invocationId: data.id,
        toolName: data.toolName,
      });
    },

    onError: error => {
      logger.error(
        '[useCreateToolInvocation] Failed to create tool invocation',
        {
          projectId,
          error,
        }
      );
    },
  });
}

/**
 * Hook to execute a tool invocation
 */
export function useExecuteToolInvocation(projectId: string) {
  return useMutation({
    mutationFn: ({
      toolName,
      parameters,
    }: {
      toolName: string;
      parameters?: Record<string, any>;
    }) =>
      ToolInvocationService.executeToolInvocation(
        projectId,
        toolName,
        parameters
      ),

    onSuccess: data => {
      logger.info('[useExecuteToolInvocation] Tool invocation executed', {
        projectId,
        invocationId: data.id,
        toolName: data.toolName,
        status: data.status,
      });
    },

    onError: error => {
      logger.error(
        '[useExecuteToolInvocation] Failed to execute tool invocation',
        {
          projectId,
          error,
        }
      );
    },
  });
}

/**
 * Hook to update tool invocation status
 */
export function useUpdateToolInvocationStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invocationId,
      status,
      result,
      error,
    }: {
      invocationId: string;
      status: ToolStatus;
      result?: any;
      error?: string;
    }) =>
      ToolInvocationService.updateToolInvocationStatus(
        projectId,
        invocationId,
        status,
        result,
        error
      ),

    onMutate: async ({ invocationId, status }) => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: toolInvocationKeys.byId(projectId, invocationId),
      });

      // Optimistically update the status
      const previousData = queryClient.getQueryData<ToolInvocation>(
        toolInvocationKeys.byId(projectId, invocationId)
      );

      if (previousData) {
        queryClient.setQueryData(
          toolInvocationKeys.byId(projectId, invocationId),
          {
            ...previousData,
            status,
            endTime:
              status === 'completed' || status === 'failed'
                ? Date.now()
                : previousData.endTime,
          }
        );
      }

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          toolInvocationKeys.byId(projectId, variables.invocationId),
          context.previousData
        );
      }

      logger.error('[useUpdateToolInvocationStatus] Failed to update status', {
        projectId,
        invocationId: variables.invocationId,
        error,
      });
    },

    onSuccess: data => {
      queryClient.setQueryData(
        toolInvocationKeys.byId(projectId, data.id),
        data
      );
    },
  });
}

/**
 * Hook to subscribe to tool invocation updates via SSE
 */
export function useToolInvocationUpdates(
  projectId: string,
  messageId: string,
  onUpdate: (invocation: ToolInvocation) => void,
  enabled = true
) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !projectId || !messageId) {
      return;
    }

    logger.info('[useToolInvocationUpdates] Subscribing to updates', {
      projectId,
      messageId,
    });

    cleanupRef.current = ToolInvocationService.subscribeToToolUpdates(
      projectId,
      messageId,
      update => {
        logger.debug('[useToolInvocationUpdates] Received update', {
          invocationId: update.invocation.id,
          status: update.invocation.status,
        });
        onUpdate(update.invocation);
      },
      error => {
        logger.error('[useToolInvocationUpdates] SSE error', {
          projectId,
          messageId,
          error,
        });
      }
    );

    return () => {
      logger.info('[useToolInvocationUpdates] Unsubscribing from updates', {
        projectId,
        messageId,
      });
      cleanupRef.current?.();
    };
  }, [projectId, messageId, onUpdate, enabled]);
}

/**
 * Hook to manage tool invocations in a chat message
 */
export function useChatToolInvocations(projectId: string, messageId: string) {
  const queryClient = useQueryClient();
  const createMutation = useCreateToolInvocation(projectId);
  const updateMutation = useUpdateToolInvocationStatus(projectId);

  // Subscribe to real-time updates
  useToolInvocationUpdates(projectId, messageId, invocation => {
    // Update the specific invocation in cache
    queryClient.setQueryData(
      toolInvocationKeys.byId(projectId, invocation.id),
      invocation
    );

    // Also update it in the chat message if needed
    const chatKey = [...chatKeys.history(projectId, 'technology')]; // You might need to pass pageContext
    const chatData = queryClient.getQueryData<{ messages: any[] }>(chatKey);

    if (chatData?.messages) {
      const updatedMessages = chatData.messages.map(msg => {
        if (msg.id === messageId && msg.toolInvocations) {
          return {
            ...msg,
            toolInvocations: msg.toolInvocations.map((inv: ToolInvocation) =>
              inv.id === invocation.id ? invocation : inv
            ),
          };
        }
        return msg;
      });

      queryClient.setQueryData(chatKey, {
        ...chatData,
        messages: updatedMessages,
      });
    }
  });

  return {
    createToolInvocation: createMutation.mutate,
    updateToolStatus: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
