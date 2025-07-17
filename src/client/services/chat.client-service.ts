/**
 * Client-side API service for chat operations.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { API_ROUTES } from '@/constants/apiRoutes';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LastAction {
  type:
    | 'claim-revised'
    | 'claim-added'
    | 'claim-deleted'
    | 'claims-mirrored'
    | 'claims-reordered';
  claimNumber?: number;
  claimNumbers?: number[];
  details?: string;
}

class ChatClientService {
  async postMessage(
    projectId: string,
    message: string,
    history: ChatMessage[],
    pageContext?: 'technology' | 'claim-refinement' | 'patent',
    lastAction?: LastAction,
    sessionId?: string,
    attachedDocumentIds?: string[]
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      // The messages array should already include the new message
      // from the calling code (useChatStream)
      const messages: ChatMessage[] = history;

      const response = await apiFetch(API_ROUTES.PROJECTS.CHAT_STREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          messages,
          pageContext,
          lastAction,
          sessionId,
          attachedDocumentIds,
        }),
      });

      if (!response.ok || !response.body) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to get chat response.'
        );
      }
      return response.body;
    } catch (error) {
      logger.error('[ChatClientService] Failed to post message', { error });
      throw error;
    }
  }

  async clearHistory(
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiFetch(API_ROUTES.PROJECTS.CHAT(projectId), {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to clear chat history.'
        );
      }
      return await response.json();
    } catch (error) {
      logger.error('[ChatClientService] Failed to clear history', {
        projectId,
        error,
      });
      throw error;
    }
  }
}

// Export the class for context-based instantiation
export { ChatClientService };

// REMOVED: Singleton export that could cause session isolation issues
