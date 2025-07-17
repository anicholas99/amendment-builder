// @ts-nocheck
/**
 * OpenAI Server Service
 *
 * This service is the single, centralized point for all interactions
 * with OpenAI, supporting both the standard API and Azure OpenAI.
 * It encapsulates API key management, provider-specific logic, fallbacks,
 * cost calculation, and standardized error handling.
 */
import OpenAI from 'openai';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { env } from '@/config/env';
import { environment } from '@/config/environment';
import { serverFetch } from '@/lib/api/serverFetch';
import { sanitizePrompt, validateAIResponse } from '@/utils/ai/promptSanitizer';

// Types
import type { ChatCompletion } from 'openai/resources/chat/completions';

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  used_fallback?: boolean;
  model?: string;
}

export interface AIServiceResponse {
  content: string;
  usage: TokenUsage;
}

interface ChatCompletionRequest {
  model?: string;
  fallbackModel?: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

// Pricing (cost per 1K tokens)
const MODEL_PRICING: { [key: string]: { input: number; output: number } } = {
  'gpt-4.1': { input: 0.002, output: 0.008 }, // $2.00/1M input, $8.00/1M output (July 2025)
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 }, // $0.40/1M input, $1.60/1M output
  'gpt-4.1-nano': { input: 0.0001, output: 0.0004 }, // $0.10/1M input, $0.40/1M output
  'gpt-35-turbo': { input: 0.0005, output: 0.0015 },
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
  'gpt-4o': { input: 0.005, output: 0.015 },
};

export class OpenaiServerService {
  private static openai: OpenAI;
  private static aiProvider: 'openai' | 'azure';

  /**
   * Initializes the OpenAI client based on environment variables.
   * This is called lazily on the first request to the service.
   */
  private static initializeClient(): void {
    if (this.openai) return;

    this.aiProvider = env.AI_PROVIDER;
    logger.info(
      `[OpenaiServerService] Initializing client for provider: ${this.aiProvider}`
    );

    if (this.aiProvider === 'azure') {
      const azureEndpoint = environment.azure.openai.endpoint;
      const azureApiKey = environment.azure.openai.apiKey;
      const apiVersion = environment.azure.openai.apiVersion;

      if (!azureEndpoint || !azureApiKey || !apiVersion) {
        throw new ApplicationError(
          ErrorCode.ENV_VAR_MISSING,
          'Missing required Azure OpenAI environment variables.'
        );
      }

      const endpoint = azureEndpoint.replace(/\/$/, '');
      const baseURL = `${endpoint}/openai/`;

      this.openai = new OpenAI({
        apiKey: azureApiKey,
        baseURL,
        defaultQuery: { 'api-version': apiVersion },
        defaultHeaders: { 'api-key': azureApiKey },
      });
    } else {
      const openaiApiKey = environment.openai.apiKey;
      if (!openaiApiKey) {
        throw new ApplicationError(
          ErrorCode.ENV_VAR_MISSING,
          'Missing required OPENAI_API_KEY environment variable.'
        );
      }
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
    }
  }

  /**
   * Calculates the estimated cost of a request.
   */
  private static calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
  ): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) {
      logger.warn(
        `[OpenaiServerService] Pricing not found for model: ${model}. Cost will be 0.`
      );
      return 0;
    }
    return (
      (inputTokens / 1000) * pricing.input +
      (outputTokens / 1000) * pricing.output
    );
  }

  /**
   * Performs a chat completion request to the configured AI provider.
   * Handles model fallbacks and includes token usage/cost in the response.
   *
   * @param request - The chat completion request payload.
   * @returns The content of the response and usage/cost details.
   */
  static async getChatCompletion(
    request: ChatCompletionRequest
  ): Promise<AIServiceResponse> {
    this.initializeClient();

    const {
      messages,
      temperature = 0.2,
      max_tokens = 4000,
      response_format,
    } = request;

    // Sanitize user messages to prevent prompt injection with context-aware limits
    const sanitizedMessages = messages.map(msg => {
      if (msg.role !== 'user') return msg;

      // Auto-detect prompt type for better context selection
      const content = msg.content.toLowerCase();
      let context: 'INVENTION' | 'CLAIMS' | 'PRIOR_ART' | 'CHAT' | 'DEFAULT' =
        'DEFAULT';

      if (content.includes('claim') && content.includes('prior art')) {
        context = 'PRIOR_ART';
      } else if (
        content.includes('invention') ||
        content.includes('disclosure') ||
        content.includes('embodiment')
      ) {
        context = 'INVENTION';
      } else if (
        content.includes('claim') &&
        (content.includes('independent') || content.includes('dependent'))
      ) {
        context = 'CLAIMS';
      } else if (content.length > 20000) {
        // Large prompts are likely invention or prior art related
        context = 'INVENTION';
      }

      return {
        ...msg,
        content: sanitizePrompt(msg.content, context),
      };
    });

    const primaryModel =
      request.model ||
      (this.aiProvider === 'azure'
        ? environment.azure.openai.deploymentName
        : environment.openai.model);

    const fallbackModel =
      request.fallbackModel ||
      (this.aiProvider === 'azure'
        ? env.AZURE_OPENAI_DEPLOYMENT_FALLBACK
        : env.OPENAI_FALLBACK_MODEL);

    try {
      return await this.executeRequest(
        primaryModel,
        sanitizedMessages,
        temperature,
        max_tokens,
        response_format
      );
    } catch (primaryError) {
      logger.error(
        `[OpenaiServerService] Primary model '${primaryModel}' failed.`,
        { error: primaryError }
      );
      if (fallbackModel) {
        logger.warn(
          `[OpenaiServerService] Attempting fallback to model '${fallbackModel}'.`
        );
        try {
          const fallbackResponse = await this.executeRequest(
            fallbackModel,
            messages,
            temperature,
            max_tokens,
            response_format
          );
          return {
            ...fallbackResponse,
            usage: { ...fallbackResponse.usage, used_fallback: true },
          };
        } catch (fallbackError) {
          logger.error(
            `[OpenaiServerService] Fallback model '${fallbackModel}' also failed.`,
            { error: fallbackError }
          );
          throw new ApplicationError(
            ErrorCode.AI_SERVICE_ERROR,
            `AI service failed for primary model (${primaryModel}) and fallback (${fallbackModel}).`
          );
        }
      }
      // Re-throw primary error if no fallback is available
      throw primaryError;
    }
  }

  /**
   * Executes the actual API request to the AI provider.
   */
  private static async executeRequest(
    model: string,
    messages: ChatCompletionRequest['messages'],
    temperature: number,
    max_tokens: number,
    response_format: ChatCompletionRequest['response_format']
  ): Promise<AIServiceResponse> {
    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens,
      response_format,
    };

    logger.debug(
      `[OpenaiServerService] Executing request to ${this.aiProvider} with model ${model}`
    );

    try {
      let completionResponse: ChatCompletion;
      if (this.aiProvider === 'azure') {
        const apiVersion = environment.azure.openai.apiVersion;
        const azureApiKey = environment.azure.openai.apiKey;
        const azureUrl = `${this.openai.baseURL}deployments/${model}/chat/completions?api-version=${apiVersion}`;
        const response = await serverFetch(azureUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': azureApiKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new ApplicationError(
            ErrorCode.AI_SERVICE_ERROR,
            `Azure OpenAI API error (${response.status}): ${errorText}`,
            response.status
          );
        }
        completionResponse = await response.json();
      } else {
        completionResponse =
          await this.openai.chat.completions.create(requestBody);
      }

      const content = completionResponse.choices[0]?.message?.content;
      if (!content) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'Received invalid or empty response from AI API.'
        );
      }

      // Validate AI response for security issues
      if (!validateAIResponse(content)) {
        logger.error('[OpenaiServerService] Suspicious AI response detected', {
          model,
          contentPreview: content.substring(0, 100),
        });
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI response failed security validation'
        );
      }

      const usage: TokenUsage = {
        prompt_tokens: completionResponse.usage?.prompt_tokens || 0,
        completion_tokens: completionResponse.usage?.completion_tokens || 0,
        total_tokens: completionResponse.usage?.total_tokens || 0,
        estimated_cost: this.calculateCost(
          completionResponse.usage?.prompt_tokens || 0,
          completionResponse.usage?.completion_tokens || 0,
          model
        ),
        model,
      };

      return { content, usage };
    } catch (error) {
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Failed to execute AI request with model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Performs a streaming chat completion request to the configured AI provider.
   * Yields tokens as they are generated for real-time UI updates.
   *
   * @param request - The chat completion request payload.
   * @returns An async generator that yields tokens and usage info
   */
  static async *getChatCompletionStream(
    request: ChatCompletionRequest
  ): AsyncGenerator<{ token?: string; usage?: TokenUsage; done?: boolean }> {
    this.initializeClient();

    const {
      messages,
      temperature = 0.2,
      max_tokens = 4000,
      response_format,
    } = request;

    // Sanitize user messages to prevent prompt injection with context-aware limits
    const sanitizedMessages = messages.map(msg => {
      if (msg.role !== 'user') return msg;

      // Auto-detect prompt type for better context selection
      const content = msg.content.toLowerCase();
      let context: 'INVENTION' | 'CLAIMS' | 'PRIOR_ART' | 'CHAT' | 'DEFAULT' =
        'DEFAULT';

      if (content.includes('claim') && content.includes('prior art')) {
        context = 'PRIOR_ART';
      } else if (
        content.includes('invention') ||
        content.includes('disclosure') ||
        content.includes('embodiment')
      ) {
        context = 'INVENTION';
      } else if (
        content.includes('claim') &&
        (content.includes('independent') || content.includes('dependent'))
      ) {
        context = 'CLAIMS';
      } else if (content.length > 20000) {
        // Large prompts are likely invention or prior art related
        context = 'INVENTION';
      }

      return {
        ...msg,
        content: sanitizePrompt(msg.content, context),
      };
    });

    const primaryModel =
      request.model ||
      (this.aiProvider === 'azure'
        ? environment.azure.openai.deploymentName
        : environment.openai.model);

    try {
      logger.debug(
        `[OpenaiServerService] Starting stream request to ${this.aiProvider} with model ${primaryModel}`
      );

      // For Azure, we need to handle streaming differently
      if (this.aiProvider === 'azure') {
        // Azure streaming implementation
        const apiVersion = environment.azure.openai.apiVersion;
        const azureApiKey = environment.azure.openai.apiKey;
        const azureUrl = `${this.openai.baseURL}deployments/${primaryModel}/chat/completions?api-version=${apiVersion}`;

        const response = await serverFetch(azureUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': azureApiKey,
          },
          body: JSON.stringify({
            model: primaryModel,
            messages: sanitizedMessages,
            temperature,
            max_tokens: max_tokens,
            response_format,
            stream: true, // Enable streaming
          }),
        });

        if (!response.ok) {
          throw new ApplicationError(
            ErrorCode.AI_SERVICE_ERROR,
            `Azure OpenAI API error (${response.status})`,
            response.status
          );
        }

        // Process the stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new ApplicationError(
            ErrorCode.AI_SERVICE_ERROR,
            'No response body available for streaming'
          );
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let totalTokens = 0;

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
                // Stream is complete
                yield { done: true };
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  totalTokens++;
                  yield { token: content };
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Estimate usage for streaming (rough approximation)
        const usage: TokenUsage = {
          prompt_tokens: Math.round(messages.join(' ').length / 4),
          completion_tokens: totalTokens,
          total_tokens: Math.round(messages.join(' ').length / 4) + totalTokens,
          estimated_cost: this.calculateCost(
            Math.round(messages.join(' ').length / 4),
            totalTokens,
            primaryModel
          ),
          model: primaryModel,
        };

        yield { usage };
      } else {
        // Standard OpenAI streaming
        const stream = await this.openai.chat.completions.create({
          model: primaryModel,
          messages: sanitizedMessages,
          temperature,
          max_tokens: max_tokens,
          response_format,
          stream: true,
        });

        let totalTokens = 0;
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            totalTokens++;
            yield { token: content };
          }
        }

        // Estimate usage for streaming
        const promptText = sanitizedMessages.map(m => m.content).join(' ');
        const estimatedPromptTokens = Math.round(promptText.length / 4);
        const usage: TokenUsage = {
          prompt_tokens: estimatedPromptTokens,
          completion_tokens: totalTokens,
          total_tokens: estimatedPromptTokens + totalTokens,
          estimated_cost: this.calculateCost(
            estimatedPromptTokens,
            totalTokens,
            primaryModel
          ),
          model: primaryModel,
        };

        yield { usage };
        yield { done: true };
      }
    } catch (error) {
      logger.error(
        `[OpenaiServerService] Stream failed for model '${primaryModel}'.`,
        { error }
      );
      throw error;
    }
  }
}
