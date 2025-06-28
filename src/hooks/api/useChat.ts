import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { chatClientService } from '@/client/services/chat.client-service';
import { PageContext, ProjectData } from '@/features/chat/types';
import { getInitialMessage } from '@/features/chat/utils/chatHelpers';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useMemo } from 'react';
import { STALE_TIME, GC_TIME } from '@/constants/time';
import { chatKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { delay } from '@/utils/delay';
import { emitDraftDocumentEvent } from '@/features/patent-application/utils/draftDocumentEvents';
import { emitClaimUpdateEvent } from '@/features/claim-refinement/utils/claimUpdateEvents';
import { unstable_batchedUpdates } from 'react-dom';

export const useChatHistoryQuery = (
  projectId: string,
  pageContext: PageContext,
  _projectData: ProjectData | null
) => {
  // Memoize the query key to prevent unnecessary re-fetches
  const queryKey = useMemo(
    () => chatKeys.history(projectId, pageContext.toString()),
    [projectId, pageContext]
  );

  return useApiQuery<{ messages: any[] }>([...queryKey], {
    url: projectId ? API_ROUTES.PROJECTS.CHAT(projectId) : '',
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT, // Use standard stale time
    gcTime: GC_TIME.DEFAULT,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
    retry: false, // Don't retry to avoid overwriting optimistic updates
  });
};

/**
 * Mutation for sending a chat message with optimistic updates
 * Follows the same pattern as useAddClaimMutation
 */
export const useSendChatMessageMutation = (
  projectId: string,
  pageContext: PageContext
) => {
  const queryClient = useQueryClient();
  const queryKey = [...chatKeys.history(projectId, pageContext.toString())];

  return useApiMutation<{ role: string; content: string }, { content: string }>(
    {
      mutationFn: async ({ content }) => {
        // Get the latest messages from the cache including the optimistic update
        const currentData = queryClient.getQueryData<{ messages: any[] }>(
          queryKey
        );
        const allMessages = currentData?.messages || [];

        // Get the last action context if available
        const contextData = queryClient.getQueryData<{ lastAction?: any }>(
          [...chatKeys.context(projectId)]
        );
        const lastAction = contextData?.lastAction;

        logger.debug('[ChatMutation] Sending messages to API', {
          messageCount: allMessages.length,
          lastMessage: allMessages[allMessages.length - 1],
          lastAction,
          allMessages: allMessages.map(m => ({
            role: m.role,
            content: m.content.substring(0, 50),
          })),
        });

        // Call the chat stream endpoint with all messages
        const response = await chatClientService.postMessage(
          projectId,
          content,
          allMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          pageContext,
          lastAction
        );

        // Clear the last action after using it
        if (lastAction) {
          queryClient.setQueryData([...chatKeys.context(projectId)], {});
        }

        // Process the stream to get the assistant response
        const reader = response.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';
        let receivedThinkingEvent = false;
        let isBuilding = false;
        let hasUpdatedFinalMessage = false; // Track if we've already updated the final message

        // Create a temporary message ID for the streaming message
        const tempMessageId = `temp-${Date.now()}`;
        
        // Add a placeholder assistant message for streaming
        queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
          if (!old || !old.messages) return old;
          
          return {
            ...old,
            messages: [
              ...old.messages,
              {
                id: tempMessageId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true,
              },
            ],
          };
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete SSE messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parse event type
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              const nextLine = lines[i + 1];
              
              if (eventType === 'thinking' && nextLine?.startsWith('data: ')) {
                receivedThinkingEvent = true;
                logger.debug('[ChatMutation] Received thinking event');
                i++; // Skip the data line
                continue;
              }
              
              if (eventType === 'done') {
                logger.debug('[ChatMutation] Stream completed');
                isBuilding = false;
                i++; // Skip any data line
                continue;
              }
              
              if (eventType === 'error' && nextLine?.startsWith('data: ')) {
                const errorData = JSON.parse(nextLine.slice(6));
                throw new ApplicationError(
                  ErrorCode.API_INVALID_RESPONSE,
                  errorData.error || 'Stream error'
                );
              }
            }
            
            // Parse data messages
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (!data || data === '{}') continue;
              
              try {
                const parsed = JSON.parse(data);
                
                // Handle partial tokens
                if (parsed.isPartial && parsed.content) {
                  isBuilding = true;
                  fullResponse += parsed.content;
                  
                  // Update the streaming message with partial content
                  queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
                    if (!old || !old.messages) return old;
                    
                    // Use immer-style update to only modify the streaming message
                    const messages = old.messages.map(msg => 
                      msg.id === tempMessageId 
                        ? { ...msg, content: fullResponse }
                        : msg
                    );
                    
                    return { ...old, messages };
                  });
                }
                
                // Handle complete message
                if (parsed.isComplete && parsed.content && !hasUpdatedFinalMessage) {
                  fullResponse = parsed.content;
                  isBuilding = false;
                  hasUpdatedFinalMessage = true;
                  
                  // Defer the final update to avoid blocking the UI
                  requestAnimationFrame(() => {
                    unstable_batchedUpdates(() => {
                      queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
                        if (!old || !old.messages) return old;
                        
                        // Find the streaming message
                        const tempIndex = old.messages.findIndex(m => m.id === tempMessageId);
                        if (tempIndex === -1) return old;
                        
                        // Update to final state
                        const messages = [...old.messages];
                        messages[tempIndex] = {
                          ...messages[tempIndex],
                          content: fullResponse,
                          isStreaming: false,
                          timestamp: messages[tempIndex].timestamp || new Date().toISOString(),
                        };
                        
                        return { ...old, messages };
                      });
                    });
                  });
                }
              } catch (e) {
                logger.error('[ChatMutation] Failed to parse response', {
                  data,
                  error: e,
                });
              }
            }
          }
        }

        // Only update if we haven't already updated with isComplete
        if (!hasUpdatedFinalMessage && fullResponse) {
          unstable_batchedUpdates(() => {
            queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
              if (!old || !old.messages) return old;
              
              // Find the index of the temporary message
              const tempIndex = old.messages.findIndex(m => m.id === tempMessageId);
              if (tempIndex === -1) return old;
              
              // Create a new array with the streaming message replaced
              const messages = [...old.messages];
              messages[tempIndex] = {
                ...messages[tempIndex],
                content: fullResponse,
                isStreaming: false,
                timestamp: messages[tempIndex].timestamp || new Date().toISOString(),
              };
              
              return { ...old, messages };
            });
          });
        }

        if (!fullResponse) {
          throw new ApplicationError(
            ErrorCode.API_INVALID_RESPONSE,
            'No response from assistant'
          );
        }

        return {
          role: 'assistant',
          content: fullResponse,
        };
      },
      onMutate: async ({ content }) => {
        logger.debug('[ChatMutation] onMutate starting');

        // Cancel any in-flight queries
        await queryClient.cancelQueries({ queryKey });

        // Get the current data
        const previousData = queryClient.getQueryData<{ messages: any[] }>(
          queryKey
        );
        logger.debug('[ChatMutation] Previous data', {
          messageCount: previousData?.messages?.length || 0,
        });

        // Create the user message
        const userMessage = {
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        };

        // Optimistically update with the user message
        queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
          if (!old || !old.messages || old.messages.length === 0) {
            // If no messages yet, include initial assistant message
            const initialMessage = getInitialMessage(pageContext, null);
            return {
              messages: [
                {
                  role: 'assistant',
                  content: initialMessage,
                  timestamp: new Date().toISOString(),
                },
                userMessage,
              ],
            };
          }

          const updated = {
            ...old,
            messages: [...old.messages, userMessage],
          };

          logger.debug('[ChatMutation] Updated cache in onMutate', {
            newMessageCount: updated.messages.length,
            lastMessage: updated.messages[updated.messages.length - 1],
          });

          return updated;
        });

        return { previousData, userMessage };
      },
      onSuccess: async (assistantResponse, _variables, context) => {
        // Defer expensive operations to avoid UI freezing
        const performPostProcessing = () => {
          // Check if the response contains the draft document update marker
          if (assistantResponse.content.includes('<!-- DRAFT_DOCUMENT_UPDATED -->')) {
            // Emit the draft document update event
            logger.info('[ChatMutation] Draft document update detected, emitting event', {
              projectId,
            });
            
            emitDraftDocumentEvent({
              projectId,
              type: 'FULL_CONTENT',
              action: 'section-enhanced',
            });
          }
          
          // Check if the response contains the claims update marker
          if (assistantResponse.content.includes('<!-- CLAIMS_UPDATED -->')) {
            // Emit the claim update event
            logger.info('[ChatMutation] Claims update detected, emitting event', {
              projectId,
            });
            
            // Try to determine the action from the response content
            let action: 'added' | 'edited' | 'deleted' | 'reordered' | 'mirrored' = 'edited';
            const content = assistantResponse.content.toLowerCase();
            if (content.includes('added') || content.includes('created')) {
              action = 'added';
            } else if (content.includes('deleted') || content.includes('removed')) {
              action = 'deleted';
            } else if (content.includes('reordered') || content.includes('swapped')) {
              action = 'reordered';
            } else if (content.includes('mirrored')) {
              action = 'mirrored';
            }
            
            emitClaimUpdateEvent({
              projectId,
              action,
            });
          }
          
          // Clean up any markers from the existing streaming message
          if (assistantResponse.content.includes('<!-- DRAFT_DOCUMENT_UPDATED -->') || 
              assistantResponse.content.includes('<!-- CLAIMS_UPDATED -->')) {
            unstable_batchedUpdates(() => {
              queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
                if (!old || !old.messages) return old;
                
                // Find the last assistant message (which should be our streaming message)
                let lastAssistantIndex = -1;
                for (let i = old.messages.length - 1; i >= 0; i--) {
                  if (old.messages[i].role === 'assistant') {
                    lastAssistantIndex = i;
                    break;
                  }
                }
                
                if (lastAssistantIndex === -1) return old;
                
                // Clean the content by removing markers
                const messages = [...old.messages];
                messages[lastAssistantIndex] = {
                  ...messages[lastAssistantIndex],
                  content: messages[lastAssistantIndex].content
                    .replace('<!-- DRAFT_DOCUMENT_UPDATED -->', '')
                    .replace('<!-- CLAIMS_UPDATED -->', '')
                    .trim(),
                };
                
                return { ...old, messages };
              });
            });
          }
        };

        // Use requestIdleCallback to perform post-processing when the browser is idle
        const winAny = window as any;
        if (typeof winAny.requestIdleCallback === 'function') {
          winAny.requestIdleCallback(performPostProcessing, { timeout: 500 });
        } else {
          // Fallback for browsers that don't support requestIdleCallback
          setTimeout(performPostProcessing, 0);
        }
        
        // NOTE: Automatic refetch of the entire chat history after every message
        // caused a noticeable UI freeze once the history grew large because it
        // forces markdown parsing for hundreds of messages. Until we have an
        // incremental "fetch new messages since last id" endpoint, we disable
        // this background sync. The client already has the final assistant
        // message so the local cache is accurate.
      },
      onError: (_err, _variables, context) => {
        // Rollback on error
        const ctx = context as { previousData?: any; userMessage?: any };
        if (ctx?.previousData) {
          queryClient.setQueryData(queryKey, ctx.previousData);
        } else {
          // If we don't have previous data, at least try to remove any streaming messages
          queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
            if (!old || !old.messages) return old;
            
            // Remove any messages that are still marked as streaming
            const messages = old.messages.filter(m => !m.isStreaming);
            
            return { ...old, messages };
          });
        }
      },
    }
  );
};

export const useClearChatHistoryMutation = (
  projectId: string,
  pageContext: PageContext,
  projectData: ProjectData | null
) => {
  const queryClient = useQueryClient();

  return useApiMutation<{ success: boolean; message: string }, void>({
    mutationFn: () => chatClientService.clearHistory(projectId),
    onSuccess: () => {
      const initialMessage = getInitialMessage(pageContext, projectData);
      queryClient.setQueryData<{ messages: any[] }>(
        [...chatKeys.history(projectId, pageContext.toString())],
        {
          messages: [
            {
              role: 'assistant',
              content: initialMessage,
              timestamp: new Date().toISOString(),
            },
          ],
        }
      );
      queryClient.invalidateQueries({
        queryKey: chatKeys.all,
      });
    },
  });
};
