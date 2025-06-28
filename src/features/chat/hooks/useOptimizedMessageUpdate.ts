import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '@/lib/queryKeys';

interface UseOptimizedMessageUpdateOptions {
  projectId: string;
  pageContext: string;
  debounceMs?: number;
}

/**
 * Hook to optimize message updates during streaming by batching updates
 * This prevents excessive re-renders during rapid streaming updates
 */
export const useOptimizedMessageUpdate = ({
  projectId,
  pageContext,
  debounceMs = 50, // Batch updates every 50ms by default
}: UseOptimizedMessageUpdateOptions) => {
  const queryClient = useQueryClient();
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<{ messageId: string; content: string } | null>(null);
  
  const queryKey = [...chatKeys.history(projectId, pageContext)];

  const updateStreamingMessage = useCallback((messageId: string, content: string) => {
    // Store the pending update
    pendingUpdateRef.current = { messageId, content };

    // Clear any existing timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    // Set a new timer to batch the update
    updateTimerRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        const { messageId: id, content: updatedContent } = pendingUpdateRef.current;
        
        queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
          if (!old || !old.messages) return old;
          
          // Only update the specific message, not the entire array
          const messageIndex = old.messages.findIndex(m => m.id === id);
          if (messageIndex === -1) return old;
          
          // Create a new messages array with just the updated message
          const messages = [...old.messages];
          messages[messageIndex] = {
            ...messages[messageIndex],
            content: updatedContent,
          };
          
          return { ...old, messages };
        });
        
        pendingUpdateRef.current = null;
      }
    }, debounceMs);
  }, [queryClient, queryKey, debounceMs]);

  const flushPendingUpdates = useCallback(() => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
    }
    
    if (pendingUpdateRef.current) {
      const { messageId, content } = pendingUpdateRef.current;
      
      queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
        if (!old || !old.messages) return old;
        
        const messageIndex = old.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return old;
        
        const messages = [...old.messages];
        messages[messageIndex] = {
          ...messages[messageIndex],
          content,
        };
        
        return { ...old, messages };
      });
      
      pendingUpdateRef.current = null;
    }
  }, [queryClient, queryKey]);

  // Cleanup function to flush any pending updates
  const cleanup = useCallback(() => {
    flushPendingUpdates();
  }, [flushPendingUpdates]);

  return {
    updateStreamingMessage,
    flushPendingUpdates,
    cleanup,
  };
}; 