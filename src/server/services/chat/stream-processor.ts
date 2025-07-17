/**
 * Stream Processor - Handles OpenAI streaming response processing
 *
 * This module manages:
 * - Parsing streaming responses
 * - Tool invocation handling
 * - Message accumulation
 * - Error handling during streaming
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { executeTool } from '@/server/tools/toolExecutor';
import { ToolResultProcessor } from './tool-result-processor';
import { ClaimMapper } from './claim-mapper';
import { OpenAIMessage } from './openai-adapter';

export interface StreamChunk {
  token?: string;
  done?: boolean;
  toolInvocation?: ToolInvocation;
}

export interface ToolInvocation {
  id: string;
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: Array<{ name: string; value: any }>;
  result?: any;
  error?: string;
  startTime: number;
  endTime?: number;
}

export interface IterationResult {
  chunks: AsyncGenerator<StreamChunk>;
  functionExecuted: boolean;
  error?: string;
  tokensUsed?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class StreamProcessor {
  // Tools that need special UI handling
  private static readonly CLAIM_OPERATION_TOOLS = [
    'addClaims',
    'editClaim',
    'deleteClaims',
    'reorderClaims',
    'mirrorClaims',
    'autoRenumberClaims',
    'updatePatentClaims',
    'setPatentClaimsDirectly',
  ];

  private static readonly PATENT_APPLICATION_TOOLS = [
    'enhancePatentSection',
    'batchEnhancePatentSections',
    'updatePatentClaims',
    'setPatentClaimsDirectly',
  ];

  private static readonly REVISION_TOOLS = [
    'proposeClaimRevision',
    'batchProposeRevisions',
  ];

  /**
   * Process a single iteration of the streaming response
   */
  static async processIterationStream(
    response: Response,
    projectId: string | undefined,
    tenantId: string | undefined,
    conversationMessages: OpenAIMessage[]
  ): Promise<IterationResult> {
    const chunks: StreamChunk[] = [];
    let functionExecuted = false;
    let error: string | undefined;
    let iterationTokens = 0;

    async function* processStream(): AsyncGenerator<StreamChunk> {
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          `OpenAI API error: ${response.status}`,
          response.status
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          'No response body available'
        );
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentFunctionCall: any = null;
      let currentFunctionName = '';
      let assistantMessage = '';
      let hasContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              logger.debug('[StreamProcessor] Stream done signal received');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              const finishReason = parsed.choices?.[0]?.finish_reason;

              if (delta?.content) {
                // Regular content - stream it and collect it
                hasContent = true;
                assistantMessage += delta.content;
                iterationTokens += Math.ceil(delta.content.length / 4); // Rough token estimate
                yield { token: delta.content };
              } else if (delta?.tool_calls) {
                // Function call detected
                const toolCall = delta.tool_calls[0];

                if (toolCall.function?.name) {
                  currentFunctionName = toolCall.function.name;
                  currentFunctionCall = '';
                }

                if (toolCall.function?.arguments) {
                  currentFunctionCall += toolCall.function.arguments;
                }
              }

              // Check if function call is complete
              if (
                finishReason === 'tool_calls' &&
                currentFunctionName &&
                currentFunctionCall
              ) {
                functionExecuted = true;

                // Add assistant's function call to conversation
                conversationMessages.push({
                  role: 'assistant',
                  content: '',
                  function_call: {
                    name: currentFunctionName,
                    arguments: currentFunctionCall,
                  },
                });

                // Process the function call
                const result = await StreamProcessor.executeFunction(
                  currentFunctionName,
                  currentFunctionCall,
                  projectId,
                  tenantId,
                  conversationMessages
                );

                if (result) {
                  for (const chunk of result) {
                    hasContent = true;
                    yield chunk;
                  }

                  // Some tools don't need another iteration
                  if (
                    result.some(
                      chunk => chunk.toolInvocation?.status === 'completed'
                    )
                  ) {
                    const needsAnotherIteration =
                      StreamProcessor.needsAnotherIteration(
                        currentFunctionName
                      );
                    if (!needsAnotherIteration) {
                      functionExecuted = false;
                    }
                  }
                }

                // Reset for next function
                currentFunctionCall = null;
                currentFunctionName = '';
              } else if (finishReason === 'stop' && assistantMessage) {
                // Normal completion with content
                conversationMessages.push({
                  role: 'assistant',
                  content: assistantMessage,
                });
              }
            } catch (e) {
              // Skip invalid JSON chunks
              logger.debug('[StreamProcessor] Skipping invalid chunk', {
                error: e,
              });
            }
          }
        }
      }

      // If we didn't get any content and didn't execute a function, provide fallback
      if (!hasContent && !functionExecuted) {
        logger.warn(
          '[StreamProcessor] No content or function execution in iteration'
        );
        yield {
          token:
            "I'm processing your request. Please try again if you don't see results.",
        };
      }
    }

    try {
      // Process the stream and collect results
      for await (const chunk of processStream()) {
        chunks.push(chunk);
      }
    } catch (e) {
      error =
        e instanceof Error
          ? e.message
          : 'Unknown error during stream processing';
      functionExecuted = false; // Stop loop on error
    }

    // Return async generator for the chunks
    async function* chunkGenerator() {
      for (const chunk of chunks) {
        yield chunk;
      }
    }

    return {
      chunks: chunkGenerator(),
      functionExecuted,
      error,
      tokensUsed:
        iterationTokens > 0
          ? {
              inputTokens: Math.ceil(
                conversationMessages.reduce(
                  (acc, msg) =>
                    acc +
                    (msg.content?.length || 0) +
                    (msg.function_call?.arguments?.length || 0),
                  0
                ) / 4
              ),
              outputTokens: iterationTokens,
            }
          : undefined,
    };
  }

  /**
   * Execute a function and yield results
   */
  private static async executeFunction(
    functionName: string,
    functionCall: string,
    projectId: string | undefined,
    tenantId: string | undefined,
    conversationMessages: OpenAIMessage[]
  ): Promise<StreamChunk[]> {
    const chunks: StreamChunk[] = [];
    const args = JSON.parse(functionCall);

    logger.info('[StreamProcessor] Executing function', {
      function: functionName,
      args,
      projectId,
      tenantId,
    });

    // Generate unique ID for this tool invocation
    const toolInvocationId = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Emit tool invocation pending event
    chunks.push({
      toolInvocation: {
        id: toolInvocationId,
        toolName: functionName,
        status: 'pending',
        parameters: Object.entries(args).map(([name, value]) => ({
          name,
          value,
        })),
        startTime,
      },
    });

    // Emit tool invocation running event
    chunks.push({
      toolInvocation: {
        id: toolInvocationId,
        toolName: functionName,
        status: 'running',
        parameters: Object.entries(args).map(([name, value]) => ({
          name,
          value,
        })),
        startTime,
      },
    });

    if (!projectId || !tenantId) {
      const errorMsg =
        "I need project context to execute tools. Please make sure you're working within a project.";

      // Emit tool invocation failed event
      chunks.push({
        toolInvocation: {
          id: toolInvocationId,
          toolName: functionName,
          status: 'failed',
          parameters: Object.entries(args).map(([name, value]) => ({
            name,
            value,
          })),
          error: errorMsg,
          startTime,
          endTime: Date.now(),
        },
      });

      chunks.push({ token: errorMsg });
      return chunks;
    }

    // Handle claim ID mapping if needed
    const mappingResult = await ClaimMapper.mapClaimArguments(
      functionName,
      args,
      projectId,
      tenantId
    );

    if (!mappingResult.success) {
      chunks.push({ token: mappingResult.error! });
      return chunks;
    }

    // Execute the tool with mapped arguments
    const result = await executeTool(functionName, {
      ...mappingResult.mappedArgs,
      projectId,
      tenantId,
    });

    logger.info('[StreamProcessor] Tool execution complete', {
      function: functionName,
      success: result.success,
      hasData: !!result.data,
    });

    // Emit tool invocation completed event
    chunks.push({
      toolInvocation: {
        id: toolInvocationId,
        toolName: functionName,
        status: result.success ? 'completed' : 'failed',
        parameters: Object.entries(args).map(([name, value]) => ({
          name,
          value,
        })),
        result: result.success ? result.data : undefined,
        error: result.success
          ? undefined
          : result.error || 'Tool execution failed',
        startTime,
        endTime: Date.now(),
      },
    });

    // Handle special tool results
    if (
      this.needsSpecialHandling(functionName) &&
      result.success &&
      result.data
    ) {
      logger.info(
        '[StreamProcessor] Processing tool result with special handling',
        {
          function: functionName,
          hasData: !!result.data,
          isClaimOperation: this.CLAIM_OPERATION_TOOLS.includes(functionName),
          isPatentTool: this.PATENT_APPLICATION_TOOLS.includes(functionName),
          isRevisionTool: this.REVISION_TOOLS.includes(functionName),
        }
      );

      // Format the result with HTML markers through ToolResultProcessor
      const formatted = ToolResultProcessor.processResult(
        functionName,
        result,
        args
      );

      logger.info('[StreamProcessor] Yielding formatted tool result', {
        functionName,
        formattedLength: formatted.length,
        hasClaimsUpdatedMarker: formatted.includes('<!-- CLAIMS_UPDATED -->'),
        hasClaimsAddedMarker: formatted.includes('<!-- CLAIMS_ADDED:'),
        hasPatentSectionMarker: formatted.includes('<!-- PATENT_SECTION_UPDATED:'),
        markerCount: (formatted.match(/<!--[^>]+-->/g) || []).length,
      });

      // Add function result to conversation for context
      const functionResultContent = result.success
        ? JSON.stringify(
            result.data || { message: 'Operation completed successfully' }
          )
        : JSON.stringify({ error: result.error || 'Unknown error' });

      conversationMessages.push({
        role: 'function',
        name: functionName,
        content: functionResultContent,
      });

      // Yield the formatted result
      chunks.push({ token: formatted });
    } else {
      logger.info('[StreamProcessor] Using default tool handling', {
        functionName,
        needsSpecialHandling: this.needsSpecialHandling(functionName),
        hasResult: result.success,
        hasData: !!result.data,
        reason: !this.needsSpecialHandling(functionName) 
          ? 'Not in special handling list'
          : !result.success
          ? 'Tool execution failed'
          : !result.data
          ? 'No result data'
          : 'Unknown',
      });

      // Default handling - add to conversation for next iteration
      const functionResultContent = result.success
        ? JSON.stringify(
            result.data || { message: 'Operation completed successfully' }
          )
        : JSON.stringify({ error: result.error || 'Unknown error' });

      conversationMessages.push({
        role: 'function',
        name: functionName,
        content: functionResultContent,
      });
    }

    return chunks;
  }

  /**
   * Check if a tool needs special handling
   */
  private static needsSpecialHandling(toolName: string): boolean {
    return (
      this.CLAIM_OPERATION_TOOLS.includes(toolName) ||
      this.PATENT_APPLICATION_TOOLS.includes(toolName) ||
      this.REVISION_TOOLS.includes(toolName)
    );
  }

  /**
   * Check if a tool needs another iteration after execution
   */
  private static needsAnotherIteration(toolName: string): boolean {
    // Tools with special handling typically don't need another iteration
    // because we format and yield their results immediately
    return !this.needsSpecialHandling(toolName);
  }
}
