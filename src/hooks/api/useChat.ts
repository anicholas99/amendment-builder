import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useChatService } from '@/contexts/ClientServicesContext';
import { PageContext, ProjectData } from '@/features/chat/types';
import { getInitialMessage } from '@/features/chat/utils/chatHelpers';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useMemo } from 'react';
import { STALE_TIME, GC_TIME } from '@/constants/time';
import { chatKeys, projectKeys } from '@/lib/queryKeys';
import { claimQueryKeys } from '@/hooks/api/useClaims';
import { logger } from '@/utils/clientLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { delay } from '@/utils/delay';
import { emitDraftDocumentEvent } from '@/features/patent-application/utils/draftDocumentEvents';
import { emitClaimUpdateEvent } from '@/features/claim-refinement/utils/claimUpdateEvents';
import { unstable_batchedUpdates } from 'react-dom';
import { queryKeys } from '@/config/reactQueryConfig';
import { ChatClientService } from '@/client/services/chat.client-service';
import { useMutation } from '@tanstack/react-query';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';

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
  const queryKey = chatKeys.history(projectId, pageContext);

  return useMutation<
    { role: string; content: string },
    Error,
    { content: string; sessionId?: string; attachedDocumentIds?: string[] }
  >({
    mutationFn: async ({ content, sessionId, attachedDocumentIds }) => {
      if (!projectId) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_REQUIRED_FIELD,
          'Project ID is required'
        );
      }

      const chatService = new ChatClientService();

      // Get all current messages from cache
      const data = queryClient.getQueryData<{ messages: any[] }>(queryKey);
      const previousMessages = data?.messages || [];
      const allMessages = [
        ...previousMessages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        { role: 'user' as const, content },
      ];

      // Get the last action context if available
      const contextData = queryClient.getQueryData<{ lastAction?: any }>([
        ...chatKeys.context(projectId),
      ]);
      const lastAction = contextData?.lastAction;

      logger.debug('[ChatMutation] Sending messages to API', {
        messageCount: allMessages.length,
        lastMessage: allMessages[allMessages.length - 1],
        lastAction,
        sessionId,
        attachedDocumentIds,
        allMessages: allMessages.map(m => ({
          role: m.role,
          content: m.content.substring(0, 50),
        })),
      });

      // Call the chat stream endpoint with all messages
      const response = await chatService.postMessage(
        projectId,
        content,
        allMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        pageContext,
        lastAction,
        sessionId,
        attachedDocumentIds
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

            if (eventType === 'tool' && nextLine?.startsWith('data: ')) {
              const toolData = JSON.parse(nextLine.slice(6));
              logger.debug(
                '[ChatMutation] Received tool invocation event',
                toolData
              );

              // Add tool invocation message to the query cache
              queryClient.setQueryData<{ messages: any[] }>(queryKey, old => {
                if (!old || !old.messages) return old;

                // Create a tool invocation message
                const toolMessage = {
                  id: `tool-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  role: 'tool',
                  content: '',
                  timestamp: new Date().toISOString(),
                  toolInvocations: [toolData.toolInvocation],
                };

                // Check if we already have a tool message with this invocation ID
                const existingToolMessageIndex = old.messages.findIndex(
                  msg =>
                    msg.role === 'tool' &&
                    msg.toolInvocations?.some(
                      (inv: any) => inv.id === toolData.toolInvocation.id
                    )
                );

                if (existingToolMessageIndex !== -1) {
                  // Update existing tool invocation
                  const messages = [...old.messages];
                  const existingMessage = messages[existingToolMessageIndex];
                  const updatedInvocations =
                    existingMessage.toolInvocations.map((inv: any) =>
                      inv.id === toolData.toolInvocation.id
                        ? toolData.toolInvocation
                        : inv
                    );

                  messages[existingToolMessageIndex] = {
                    ...existingMessage,
                    toolInvocations: updatedInvocations,
                  };

                  return { ...old, messages };
                } else {
                  // Insert tool message before the streaming assistant message
                  const messages = [...old.messages];

                  // Find the last streaming assistant message
                  let streamingIndex = -1;
                  for (let i = messages.length - 1; i >= 0; i--) {
                    if (
                      messages[i].role === 'assistant' &&
                      messages[i].isStreaming
                    ) {
                      streamingIndex = i;
                      break;
                    }
                  }

                  if (streamingIndex !== -1) {
                    // Insert before the streaming message
                    messages.splice(streamingIndex, 0, toolMessage);
                  } else {
                    // No streaming message, append at end
                    messages.push(toolMessage);
                  }

                  return {
                    ...old,
                    messages,
                  };
                }
              });

              i++; // Skip the data line
              continue;
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
              if (
                parsed.isComplete &&
                parsed.content &&
                !hasUpdatedFinalMessage
              ) {
                fullResponse = parsed.content;
                isBuilding = false;
                hasUpdatedFinalMessage = true;

                // Defer the final update to avoid blocking the UI
                requestAnimationFrame(() => {
                  unstable_batchedUpdates(() => {
                    queryClient.setQueryData<{ messages: any[] }>(
                      queryKey,
                      old => {
                        if (!old || !old.messages) return old;

                        // Find the streaming message
                        const tempIndex = old.messages.findIndex(
                          m => m.id === tempMessageId
                        );
                        if (tempIndex === -1) return old;

                        // Update to final state
                        const messages = [...old.messages];
                        messages[tempIndex] = {
                          ...messages[tempIndex],
                          content: fullResponse,
                          isStreaming: false,
                          timestamp:
                            messages[tempIndex].timestamp ||
                            new Date().toISOString(),
                        };

                        return { ...old, messages };
                      }
                    );
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
            const tempIndex = old.messages.findIndex(
              m => m.id === tempMessageId
            );
            if (tempIndex === -1) return old;

            // Create a new array with the streaming message replaced
            const messages = [...old.messages];
            messages[tempIndex] = {
              ...messages[tempIndex],
              content: fullResponse,
              isStreaming: false,
              timestamp:
                messages[tempIndex].timestamp || new Date().toISOString(),
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
      // Log the response for debugging
      logger.debug('[ChatMutation] Assistant response received', {
        contentLength: assistantResponse.content?.length || 0,
        hasClaimsUpdateMarker: assistantResponse.content.includes(
          '<!-- CLAIMS_UPDATED -->'
        ),
        hasClaimsAddedMarker:
          assistantResponse.content.includes('<!-- CLAIMS_ADDED:'),
        hasDraftDocumentMarker: assistantResponse.content.includes(
          '<!-- DRAFT_DOCUMENT_UPDATED -->'
        ),
        hasInventionMarker: assistantResponse.content.includes(
          '<!-- INVENTION_UPDATED -->'
        ),
        hasFiguresMarker: assistantResponse.content.includes(
          '<!-- FIGURES_UPDATED -->'
        ),
        hasPatentSectionMarker: assistantResponse.content.includes(
          '<!-- PATENT_SECTION_UPDATED:'
        ),
        responsePreview: assistantResponse.content.substring(0, 200) + '...',
      });

      // Check if the response contains the patent section update marker
      if (assistantResponse.content.includes('<!-- PATENT_SECTION_UPDATED:')) {
        logger.info(
          '[ChatMutation] Patent section update detected via marker, triggering UI sync',
          {
            projectId,
          }
        );

        // Parse ALL sync trigger data (multiple markers for batch updates)
        const patentSectionMatches = assistantResponse.content.matchAll(
          /<!-- PATENT_SECTION_UPDATED:({.*?}) -->/g
        );

        // Collect all sync triggers first
        const syncTriggers: any[] = [];
        for (const match of patentSectionMatches) {
          if (match[1]) {
            try {
              const syncTrigger = JSON.parse(match[1]);
              syncTriggers.push(syncTrigger);
            } catch (error) {
              logger.error('[ChatMutation] Failed to parse sync trigger', {
                error,
                match: match[1],
              });
            }
          }
        }

        // Direct cache update approach instead of events to avoid HMR race conditions
        for (let i = 0; i < syncTriggers.length; i++) {
          const syncTrigger = syncTriggers[i];
          logger.info('[ChatMutation] Processing patent section update directly', {
            syncTrigger,
            index: i,
            total: syncTriggers.length,
            syncTriggerKeys: Object.keys(syncTrigger),
            hasUpdatedContent: !!syncTrigger.updatedContent,
            updatedContentLength: syncTrigger.updatedContent ? syncTrigger.updatedContent.length : 0,
          });

          // Use direct editor event to bypass header protection
          try {
            if (syncTrigger.projectId === projectId) {
              // First invalidate and refetch to get the updated content
              queryClient.invalidateQueries({
                queryKey: [...draftQueryKeys.all(projectId)],
                exact: false,
              });
              
                             await queryClient.refetchQueries({
                 queryKey: [...draftQueryKeys.all(projectId), 'with-content'],
                 exact: true,
               });
               
               // Get the rebuilt content from the cache after refetch
               const refetchedData = queryClient.getQueryData([...draftQueryKeys.all(projectId), 'with-content']) as any;
               const rebuiltContent = refetchedData?.content;
              
              if (rebuiltContent) {
                // Dispatch direct editor event to bypass header protection
                window.dispatchEvent(new CustomEvent('directEditorContentUpdate', {
                  detail: {
                    projectId,
                    content: rebuiltContent,
                    source: 'section-enhancement',
                  }
                }));
                
                logger.info('[ChatMutation] Dispatched direct editor update after section enhancement', {
                  projectId,
                  sectionType: syncTrigger.sectionType,
                  contentLength: rebuiltContent.length,
                });
              } else {
                logger.warn('[ChatMutation] No rebuilt content found after refetch', {
                  projectId,
                  sectionType: syncTrigger.sectionType,
                });
              }
            }
            
          } catch (error) {
            logger.error('[ChatMutation] Error updating patent content cache', {
              error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
              } : error,
              syncTrigger,
              index: i,
            });
          }
        }

        // Also check for batch update marker for additional handling if needed
        const batchMatch = assistantResponse.content.match(
          /<!-- PATENT_BATCH_UPDATED:({.*?}) -->/
        );
        if (batchMatch && batchMatch[1]) {
          try {
            const batchData = JSON.parse(batchMatch[1]);
            logger.info('[ChatMutation] Parsed patent batch update', {
              sections: batchData.sections,
              triggerCount: batchData.syncTriggers?.length || 0,
            });
          } catch (error) {
            logger.error('[ChatMutation] Failed to parse batch data', {
              error,
            });
          }
        }

        // DISABLED: Cache invalidation replaced with direct content application in editor
        /*
        // Invalidate draft documents to trigger UI refresh
        await queryClient.invalidateQueries({
          queryKey: ['draftDocuments', projectId],
          exact: false,
          refetchType: 'active',
        });

        // Also invalidate the patent application content
        await queryClient.invalidateQueries({
          queryKey: ['patentContent', projectId],
          exact: false,
          refetchType: 'active',
        });

        logger.info('[ChatMutation] Patent section caches invalidated', {
          projectId,
        });
        */
      }

      // Check if the response contains the claims update marker
      if (assistantResponse.content.includes('<!-- CLAIMS_UPDATED -->')) {
        logger.info(
          '[ChatMutation] Claims update detected via marker, emitting event immediately',
          {
            projectId,
          }
        );

        // Try to determine the action from the response content
        let action: 'added' | 'edited' | 'deleted' | 'reordered' | 'mirrored' =
          'edited';
        const content = assistantResponse.content.toLowerCase();
        if (content.includes('added') || content.includes('created')) {
          action = 'added';
        } else if (content.includes('deleted') || content.includes('removed')) {
          action = 'deleted';
        } else if (
          content.includes('reordered') ||
          content.includes('swapped')
        ) {
          action = 'reordered';
        } else if (content.includes('mirrored')) {
          action = 'mirrored';
        }

        // Parse claim numbers if they were added
        let claimNumbers: number[] | undefined;
        const claimsAddedMatch = assistantResponse.content.match(
          /<!-- CLAIMS_ADDED:([0-9,]+) -->/
        );
        if (claimsAddedMatch && claimsAddedMatch[1]) {
          claimNumbers = claimsAddedMatch[1]
            .split(',')
            .map(n => parseInt(n, 10));
          logger.info('[ChatMutation] Parsed added claim numbers', {
            claimNumbers,
          });
        }

        // Emit event for real-time updates
        emitClaimUpdateEvent({
          projectId,
          action,
          claimCount: claimNumbers?.length,
          claimNumbers,
        });

        // Add a small delay to ensure database transaction is committed
        // before invalidating cache to prevent race conditions
        logger.info(
          '[ChatMutation] Waiting for database commit before cache invalidation',
          {
            projectId,
          }
        );

        await new Promise(resolve => setTimeout(resolve, 150));

        // Simple, reliable cache invalidation (now works because staleTime=0)
        logger.info(
          '[ChatMutation] Invalidating claims cache for immediate refresh',
          {
            projectId,
          }
        );

        await queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(projectId),
          exact: false,
          refetchType: 'active',
        });

        logger.info('[ChatMutation] Claims cache invalidated successfully', {
          projectId,
        });

        // Fallback: If the data still appears stale after a brief moment,
        // force another invalidation to ensure UI consistency
        setTimeout(async () => {
          try {
            const currentData = queryClient.getQueryData(claimQueryKeys.list(projectId));
            logger.debug('[ChatMutation] Fallback check - validating claims data freshness', {
              projectId,
              hasData: !!currentData,
              dataType: typeof currentData,
            });

            // Force one more invalidation to catch any edge cases
            await queryClient.invalidateQueries({
              queryKey: claimQueryKeys.list(projectId),
              exact: false,
              refetchType: 'active',
            });

            logger.debug('[ChatMutation] Fallback invalidation completed', {
              projectId,
            });
          } catch (error) {
            logger.warn('[ChatMutation] Fallback invalidation failed', {
              projectId,
              error,
            });
          }
        }, 500);
      }

      // Defer other expensive operations to avoid UI freezing
      const performPostProcessing = () => {
        // Check if the response contains the draft document update marker
        if (
          assistantResponse.content.includes('<!-- DRAFT_DOCUMENT_UPDATED -->')
        ) {
          // Emit the draft document update event
          logger.info(
            '[ChatMutation] Draft document update detected, emitting event',
            {
              projectId,
            }
          );

          emitDraftDocumentEvent({
            projectId,
            type: 'FULL_CONTENT',
            action: 'section-enhanced',
          });
        }

        // Check if the response contains the invention update marker
        if (assistantResponse.content.includes('<!-- INVENTION_UPDATED -->')) {
          logger.info(
            '[ChatMutation] Invention update detected, invalidating queries',
            {
              projectId,
            }
          );

          // Invalidate invention-related queries to refresh the data
          queryClient.invalidateQueries({
            queryKey: [...projectKeys.detail(projectId), 'invention'],
            exact: false,
            refetchType: 'active',
          });

          // Also invalidate project detail to refresh everything
          queryClient.invalidateQueries({
            queryKey: projectKeys.detail(projectId),
            exact: false,
            refetchType: 'active',
          });

          // Invalidate project lists to update modified time
          queryClient.invalidateQueries({
            queryKey: projectKeys.lists(),
            exact: false,
            refetchType: 'active',
          });
        }

        // Check if the response contains the figures update marker
        if (assistantResponse.content.includes('<!-- FIGURES_UPDATED -->')) {
          logger.info(
            '[ChatMutation] Figures update detected, invalidating queries',
            {
              projectId,
            }
          );

          // Invalidate figure-related queries to refresh the data
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.figures(projectId),
            exact: false,
            refetchType: 'active',
          });

          // Also invalidate the figure elements query
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.projects.figures(projectId), 'elements'],
            exact: false,
            refetchType: 'active',
          });

          // Invalidate project detail to ensure UI consistency
          queryClient.invalidateQueries({
            queryKey: projectKeys.detail(projectId),
            exact: false,
            refetchType: 'active',
          });
        }

        // Clean up any markers from the existing streaming message
        if (
          assistantResponse.content.includes(
            '<!-- DRAFT_DOCUMENT_UPDATED -->'
          ) ||
          assistantResponse.content.includes('<!-- CLAIMS_UPDATED -->') ||
          assistantResponse.content.includes('<!-- INVENTION_UPDATED -->') ||
          assistantResponse.content.includes('<!-- CLAIMS_ADDED:') ||
          assistantResponse.content.includes('<!-- FIGURES_UPDATED -->') ||
          assistantResponse.content.includes('<!-- PATENT_SECTION_UPDATED:') ||
          assistantResponse.content.includes('<!-- PATENT_BATCH_UPDATED:')
        ) {
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
                  .replace('<!-- INVENTION_UPDATED -->', '')
                  .replace(/<!-- CLAIMS_ADDED:[0-9,]+ -->/g, '')
                  .replace('<!-- FIGURES_UPDATED -->', '')
                  .replace(/<!-- PATENT_SECTION_UPDATED:{.*?} -->/g, '')
                  .replace(/<!-- PATENT_BATCH_UPDATED:{.*?} -->/g, '')
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
  });
};

export const useClearChatHistoryMutation = (
  projectId: string,
  pageContext: PageContext,
  projectData: ProjectData | null
) => {
  const queryClient = useQueryClient();
  const chatService = useChatService();

  return useApiMutation<{ success: boolean; message: string }, void>({
    mutationFn: () => chatService.clearHistory(projectId),
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
