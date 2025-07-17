import { OpenaiServerService } from '@/server/services/openai.server-service';
import { logger } from '@/server/logger';
import { safeJsonParse } from '@/utils/jsonUtils';
import type { ChatToolCall, ChatToolChain } from '@/types/tools';
import { ToolChainProcessor } from './chat/tool-chain-processor';
import { ContextManager } from './chat/context-manager';

export interface ChatAgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateChatResponseParams {
  projectId?: string;
  messages: ChatAgentMessage[];
  tenantId?: string;
  pageContext?: 'technology' | 'claim-refinement' | 'patent';
  lastAction?: {
    type:
      | 'claim-revised'
      | 'claim-added'
      | 'claim-deleted'
      | 'claims-mirrored'
      | 'claims-reordered';
    claimNumber?: number;
    claimNumbers?: number[];
    details?: string;
  };
}

/**
 * ChatAgentService
 * --------------------------------------------------
 * Context-aware chat agent that loads full invention data before responding.
 * This ensures the AI has complete understanding of what the user is working on.
 *
 * SECURITY: Always validates tenant access before loading project data.
 *
 * The agent has access to:
 * - Project metadata and status
 * - Full invention details (title, summary, technical details)
 * - All claims (normalized)
 * - Saved prior art references
 * - Parsed claim elements and search queries
 *
 * Refactored to use modular components for better maintainability
 */
export class ChatAgentService {
  /**
   * Streaming version of generateResponse that yields tokens as they're generated
   * This prevents UI freezing by sending data immediately
   */
  static async *generateResponseStream({
    projectId,
    messages,
    tenantId,
    pageContext = 'technology',
    lastAction,
  }: GenerateChatResponseParams): AsyncGenerator<{
    token?: string;
    done?: boolean;
    error?: string;
  }> {
    try {
      // Load project context
      const inventionContext = await ContextManager.loadProjectContext(
        projectId,
        tenantId
      );

      // Generate system prompt
      const systemPrompt = ContextManager.generateSystemPrompt({
        pageContext,
        inventionContext,
        lastAction,
      });

      const openAiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
      ];

      logger.info('[ChatAgentService] Sending messages to OpenAI', {
        messageCount: openAiMessages.length,
        projectId,
        pageContext,
        hasInventionContext: !!inventionContext,
        hasLastAction: !!lastAction,
      });

      // Create the OpenAI stream
      const stream = OpenaiServerService.getChatCompletionStream({
        model: 'gpt-4o',
        messages: openAiMessages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      let responseBuffer = '';
      let isComplete = false;

      for await (const chunk of stream) {
        if (chunk.done) {
          isComplete = true;
          break;
        }

        if (chunk.token) {
          responseBuffer += chunk.token;
        }
      }

      // Now process the complete response
      if (responseBuffer.trim()) {
        // Check if the entire response is a tool call
        const trimmedResponse = responseBuffer.trim();

        // Simple check: if it starts with { and ends with }, it's likely JSON
        if (trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) {
          const toolCall = safeJsonParse<ChatToolCall | ChatToolChain>(
            trimmedResponse
          );

          if (toolCall && ('tool' in toolCall || 'tools' in toolCall)) {
            logger.info('[ChatAgentService] Tool call detected', {
              tool: 'tools' in toolCall ? 'chain' : toolCall.tool,
              projectId,
              tenantId,
            });

            try {
              if (!projectId || !tenantId) {
                yield {
                  token:
                    "I need project context to execute tools. Please make sure you're working within a project.",
                };
              } else {
                const toolResponse = await this.executeToolCall(
                  toolCall,
                  projectId,
                  tenantId
                );
                yield {
                  token: toolResponse || 'Operation completed successfully.',
                };
              }
            } catch (error) {
              logger.error('[ChatAgentService] Tool execution error', error);
              yield {
                token:
                  'I encountered an error while processing your request. Please try again.',
              };
            }
          } else {
            // JSON parsing failed or not a valid tool call
            logger.warn('[ChatAgentService] Invalid tool JSON received', {
              response: trimmedResponse.substring(0, 100),
            });
            yield {
              token:
                "I couldn't process that request properly. Please try again.",
            };
          }
        } else {
          // Normal text response - stream it
          for (const char of responseBuffer) {
            yield { token: char };
          }
        }
      }

      if (!isComplete) {
        yield { done: true };
      }
    } catch (error) {
      logger.error('[ChatAgentService] Stream error', error);
      yield {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Execute a tool call (single tool or tool chain)
   */
  private static async executeToolCall(
    toolCall: ChatToolCall | ChatToolChain,
    projectId: string,
    tenantId: string
  ): Promise<string> {
    // Check if it's a tool chain (multiple tools)
    if ('tools' in toolCall) {
      return ToolChainProcessor.processToolChain(toolCall, projectId, tenantId);
    } else {
      return ToolChainProcessor.processSingleTool(
        toolCall,
        projectId,
        tenantId
      );
    }
  }

  /**
   * Non-streaming version for backward compatibility
   */
  static async generateResponse(
    params: GenerateChatResponseParams
  ): Promise<string> {
    let fullResponse = '';

    for await (const chunk of this.generateResponseStream(params)) {
      if (chunk.token) {
        fullResponse += chunk.token;
      }
      if (chunk.error) {
        throw new Error(chunk.error);
      }
    }

    return fullResponse;
  }
}
