import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ToolChainProcessor } from './chat/tool-chain-processor';
import { ToolResultProcessor } from './chat/tool-result-processor';
import { ContextManager } from './chat/context-manager';
import { executeTool, getAvailableTools } from '@/server/tools/toolExecutor';
import { serverFetch } from '@/lib/api/serverFetch';
import { environment } from '@/config/environment';
import { env } from '@/config/env';

// New modular imports
import { ToolRegistry } from './chat/tool-registry';
import { ModelSelector } from './chat/model-selector';
import { PatternDetector } from './chat/pattern-detector';
import { OpenAIAdapter, OpenAIMessage } from './chat/openai-adapter';
import { StreamProcessor } from './chat/stream-processor';
import { CostTracker } from './chat/cost-tracker';

export interface ChatAgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateChatResponseParams {
  projectId: string | undefined;
  messages: ChatAgentMessage[];
  tenantId: string | undefined;
  pageContext?: 'technology' | 'claim-refinement' | 'patent';
  sessionId?: string;
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
  officeActionId?: string | undefined;
}

/**
 * Modern ChatAgentService using OpenAI Function Calling
 * This is how ChatGPT, Claude, and other modern AI assistants work
 *
 * Benefits:
 * - No JSON parsing needed
 * - OpenAI handles all edge cases
 * - Structured, type-safe tool calls
 * - Industry standard approach
 */
export class ChatAgentFunctionsService {
  /**
   * Convert our tools to OpenAI function format
   * @deprecated Use OpenAIAdapter.getOpenAIFunctions instead
   */
  private static getOpenAIFunctions() {
    return OpenAIAdapter.getOpenAIFunctions();
  }

  /**
   * Determine optimal model based on the tools being used
   * @deprecated Use ModelSelector.getOptimalModel instead
   */
  private static getOptimalModel(toolNames: string[]): string {
    return ModelSelector.getOptimalModel(toolNames);
  }

  /**
   * Check if a user query matches a common tool chain pattern
   * @deprecated Use PatternDetector.detectToolChainPattern instead
   */
  private static detectToolChainPattern(userMessage: string): string | null {
    return PatternDetector.detectToolChainPattern(userMessage);
  }

  /**
   * Define parameters for each tool
   * @deprecated Use ToolRegistry.getToolParameters instead
   */
  private static getToolParameters(toolName: string): any {
    return ToolRegistry.getToolParameters(toolName);
  }

  /**
   * Streaming version using OpenAI Function Calling
   */
  static async *generateResponseStream({
    projectId,
    messages,
    tenantId,
    pageContext = 'technology',
    sessionId,
    lastAction,
    officeActionId,
  }: GenerateChatResponseParams): AsyncGenerator<{
    token?: string;
    done?: boolean;
    error?: string;
    toolInvocation?: {
      id: string;
      toolName: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      parameters?: Array<{ name: string; value: any }>;
      result?: any;
      error?: string;
      startTime: number;
      endTime?: number;
    };
  }> {
    try {
      // Load project context
      const inventionContext = await ContextManager.loadProjectContext(
        projectId,
        tenantId,
        sessionId,
        pageContext,
        officeActionId
      );

      // Generate system prompt
      const systemPrompt = ContextManager.generateSystemPrompt({
        pageContext,
        inventionContext,
        lastAction,
      }).replace(
        /## Tool Calling Instructions:[\s\S]*?## Important Instructions:/,
        '## Important Instructions:'
      ); // Remove old tool instructions since OpenAI handles it

      // Build initial message history – exclude client-side tool messages (not understood by OpenAI)
      const conversationMessages: OpenAIMessage[] = [
        { role: 'system' as const, content: systemPrompt },
        ...OpenAIAdapter.formatMessages(messages),
      ];

      logger.info(
        '[ChatAgentFunctions] Starting iterative function-enabled stream',
        {
          messageCount: conversationMessages.length,
          projectId,
          pageContext,
        }
      );

      // Iterative loop - max 15 iterations for safety
      // This limit balances between allowing complex multi-step operations
      // (e.g., analyze → fix issues → validate → visualize) while preventing
      // runaway loops. Most operations complete in 2-5 iterations, but complex
      // patent workflows may need 8-12. Monitor logs for patterns of hitting
      // the limit to determine if further adjustment is needed.
      // NOTE: Consider implementing cached input optimization for repeated
      // system prompts to leverage 75% discount on identical prompts.
      const MAX_ITERATIONS = 15;
      let iterations = 0;
      let continueLoop = true;

      // Track costs across iterations
      const costTracker = new CostTracker(ModelSelector.getDefaultModel());

      while (continueLoop && iterations < MAX_ITERATIONS) {
        iterations++;

        // Warn if we're using many iterations
        if (CostTracker.shouldWarnAboutIterations(iterations)) {
          logger.warn('[ChatAgentFunctions] High iteration count', {
            iteration: iterations,
            messageCount: conversationMessages.length,
            projectId,
            info: 'Consider if the task could be simplified or split',
          });
        }

        logger.info('[ChatAgentFunctions] Starting iteration', {
          iteration: iterations,
          messageCount: conversationMessages.length,
        });

        // Detect if user query matches a common pattern
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        const detectedPattern = this.detectToolChainPattern(lastUserMessage);

        // Track which tools might be used for model optimization
        let potentialTools: string[] = [];
        if (detectedPattern) {
          potentialTools = PatternDetector.getToolChain(detectedPattern) || [];
        }

        // Optimize model selection based on potential tools
        const optimalModel =
          potentialTools.length > 0
            ? this.getOptimalModel(potentialTools)
            : env.AI_PROVIDER === 'azure'
              ? environment.azure.openai.deploymentName
              : 'gpt-4.1';

        // Call OpenAI with current conversation state
        const requestBody = OpenAIAdapter.buildRequestBody(
          optimalModel,
          conversationMessages
        );

        logger.info('[ChatAgentFunctions] Using optimized model selection', {
          detectedPattern,
          optimalModel,
          potentialTools,
        });

        // Make the streaming request
        const response = await this.createStreamingRequest(requestBody);

        // Process this iteration's stream
        const iterationResult = await StreamProcessor.processIterationStream(
          response,
          projectId,
          tenantId,
          conversationMessages
        );

        // Yield any content tokens from this iteration
        for await (const chunk of iterationResult.chunks) {
          yield chunk;
        }

        // Update cost tracking for this iteration
        if (iterationResult.tokensUsed) {
          costTracker.addIteration(iterationResult.tokensUsed);
        }

        // Check if we should continue looping
        continueLoop = iterationResult.functionExecuted;

        if (iterationResult.error) {
          logger.error('[ChatAgentFunctions] Iteration error', {
            iteration: iterations,
            error: iterationResult.error,
          });
          yield { error: iterationResult.error };
          break;
        }
      }

      if (iterations >= MAX_ITERATIONS) {
        logger.warn('[ChatAgentFunctions] Max iterations reached', {
          iterations,
          maxIterations: MAX_ITERATIONS,
        });
      }

      // Log final cost summary
      costTracker.getSummary(projectId, sessionId);
    } catch (error) {
      logger.error('[ChatAgentFunctions] Stream error', error);
      yield {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }

    // Always send done signal
    yield { done: true };
  }

  /**
   * Create streaming request to OpenAI
   * @deprecated Use OpenAIAdapter.createStreamingRequest instead
   */
  private static async createStreamingRequest(
    requestBody: any
  ): Promise<Response> {
    return OpenAIAdapter.createStreamingRequest(requestBody);
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
