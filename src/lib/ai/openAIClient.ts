import OpenAI from 'openai';
import { logger } from '@/lib/monitoring/logger';
import { env } from '@/config/env';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '../error';

// Import the chat completion type from OpenAI
import type { ChatCompletion } from 'openai/resources/chat/completions';

// Determine AI provider and initialize OpenAI client
const aiProvider = env.AI_PROVIDER;
logger.log(`[DEBUG] AI_PROVIDER: ${aiProvider}`);
let openai: OpenAI;

if (aiProvider === 'azure') {
  logger.info('Initializing OpenAI client for Azure');
  const azureEndpoint = env.AZURE_OPENAI_ENDPOINT;
  const azureApiKey = env.AZURE_OPENAI_API_KEY;

  if (!azureEndpoint || !azureApiKey) {
    throw new ApplicationError(
      ErrorCode.AI_SERVICE_ERROR,
      'Azure OpenAI environment variables (ENDPOINT, API_KEY) are not fully configured.'
    );
  }
  // Ensure endpoint without trailing slash and add /openai/ path
  const endpoint = azureEndpoint.replace(/\/$/, '');
  const baseURL = `${endpoint}/openai/`; // Use the base path for Azure

  openai = new OpenAI({
    apiKey: azureApiKey,
    baseURL: baseURL, // Base URL for constructing manual fetch URLs
    defaultQuery: {
      'api-version': env.AZURE_OPENAI_API_VERSION,
    }, // Keep for reference if needed elsewhere, but not for SDK config
    defaultHeaders: { 'api-key': azureApiKey },
    // REMOVED azureOpenAIApiDeploymentName and azureOpenAIApiVersion as they cause errors
  });
} else {
  logger.info('Initializing OpenAI client for standard OpenAI');
  const openaiApiKey = env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new ApplicationError(
      ErrorCode.AI_SERVICE_ERROR,
      'Standard OpenAI API key (OPENAI_API_KEY) is not configured.'
    );
  }
  openai = new OpenAI({
    apiKey: openaiApiKey, // Use standard key
  });
}

// GPT-4 Turbo Preview cost per 1K tokens (as of March 2024)
const MODEL_PRICING: {
  [key: string]: { input: number; output: number };
} = {
  // Ensure Azure deployment names map to pricing if different from standard names
  // Using the actual deployment names we plan to use
  'gpt-4.1': {
    // Pricing for GPT-4.1 (same as GPT-4 Turbo)
    input: 0.01, // $0.01 per 1K input tokens
    output: 0.03, // $0.03 per 1K output tokens
  },
  'gpt-35-turbo': {
    // Pricing for your fallback gpt-35-turbo deployment
    input: 0.0005, // Example: $0.0005 per 1K input tokens (adjust based on actual Azure pricing)
    output: 0.0015, // Example: $0.0015 per 1K output tokens (adjust based on actual Azure pricing)
  },
  // Keep standard OpenAI pricing for comparison or if switching providers
  'gpt-4-turbo-preview': {
    input: 0.01, // $0.01 per 1K input tokens
    output: 0.03, // $0.03 per 1K output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.001, // $0.001 per 1K input tokens
    output: 0.002, // $0.002 per 1K output tokens
  },
  // Add other models as needed
};

// Token usage interface
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  used_fallback?: boolean;
  model?: string; // Can be OpenAI model or Azure deployment name
}

// OpenAI options interface
interface OpenAIOptions {
  model?: string; // Can be standard model or Azure deployment
  fallbackModel?: string; // Can be standard model or Azure deployment
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' | 'text' };
}

// AI service response interface
interface AIServiceResponse {
  content: string;
  usage: TokenUsage;
}

/**
 * Calculate cost in USD based on token usage and model/deployment name
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @param model The model or Azure deployment name used
 * @returns Calculated cost in USD
 */
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1'
): number {
  // Use the provided model name to find pricing, fallback to default if not found
  const defaultPricingModel = env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1';
  const pricing = MODEL_PRICING[model] || MODEL_PRICING[defaultPricingModel];
  if (!pricing) {
    logger.warn(
      `Pricing not found for model: ${model}. Using default ${defaultPricingModel} pricing.`
    );
    const defaultPricing =
      MODEL_PRICING[defaultPricingModel] || MODEL_PRICING['gpt-4.1']; // Fallback pricing lookup
    // Handle case where even default pricing isn't found (optional, maybe throw error or use 0)
    if (!defaultPricing) {
      logger.error(
        `FATAL: Default pricing model ${defaultPricingModel} not found in MODEL_PRICING map.`
      );
      return 0; // Or throw an error
    }
    return (
      (inputTokens / 1000) * defaultPricing.input +
      (outputTokens / 1000) * defaultPricing.output
    );
  }
  return (
    (inputTokens / 1000) * pricing.input +
    (outputTokens / 1000) * pricing.output
  );
}

/**
 * Process a request with the configured AI service (OpenAI or Azure), handling fallbacks and errors
 * @param prompt The user prompt
 * @param systemMessage The system message
 * @param options Additional options (model, temperature, etc.)
 * @returns The AI response content and usage details
 */
export async function processWithOpenAI(
  prompt: string,
  systemMessage: string,
  options: OpenAIOptions = {}
): Promise<AIServiceResponse> {
  // Validate API key based on provider
  if (aiProvider === 'azure') {
    if (!env.AZURE_OPENAI_API_KEY) {
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'Azure OpenAI API key is not configured'
      );
    }
  } else {
    if (!env.OPENAI_API_KEY) {
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        'OpenAI API key is not configured'
      );
    }
  }

  // Resolve the primary model/deployment name from env so we don't hard-code an (often outdated) default
  const defaultModel =
    aiProvider === 'azure'
      ? env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4.1' // Azure deployment name
      : environment.openai.model;

  // Define provider-specific fallback models
  const defaultFallbackModel =
    aiProvider === 'azure'
      ? env.AZURE_OPENAI_DEPLOYMENT_FALLBACK || 'gpt-35-turbo'
      : env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo';

  const {
    model = defaultModel,
    fallbackModel = defaultFallbackModel,
    temperature = environment.openai.temperature,
    maxTokens = environment.openai.maxTokens,
    responseFormat = { type: 'json_object' },
  } = options;

  const apiVersion = env.AZURE_OPENAI_API_VERSION;

  // Adjust messages for JSON format if needed
  const finalSystemMessage =
    responseFormat?.type === 'json_object'
      ? `${systemMessage} Respond in JSON format.`
      : systemMessage;

  const finalPrompt =
    responseFormat?.type === 'json_object' &&
    !prompt.toLowerCase().includes('json')
      ? `${prompt}\n\nPlease format your response as JSON.`
      : prompt;

  // Prepare messages array with proper typing for OpenAI SDK
  const messages = [
    { role: 'system' as const, content: finalSystemMessage },
    { role: 'user' as const, content: finalPrompt },
  ];

  logger.info(`Calling AI Service (${aiProvider}) with model: ${model}`, {
    promptLength: finalPrompt.length,
    model,
    responseFormat,
  });

  try {
    // Primary API call
    let completionResponse: ChatCompletion;
    const usedFallback = false;

    if (aiProvider === 'azure') {
      // Construct the full URL manually for Azure
      const azureUrl = `${openai.baseURL}deployments/${model}/chat/completions?api-version=${apiVersion}`;
      logger.debug('[processWithOpenAI] Azure Primary Call', {
        url: azureUrl,
        deployment: model,
      });
      const response = await fetch(azureUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.AZURE_OPENAI_API_KEY!,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: responseFormat,
        }),
      });

      if (!response.ok) {
        logger.error('[processWithOpenAI] Azure Primary Call Failed', {
          status: response.status,
          statusText: response.statusText,
        });
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          `Invalid response from AI service: ${response.statusText} (${response.status})`,
          response.status
        );
      }
      completionResponse = await response.json();
    } else {
      // Standard OpenAI call using SDK
      logger.debug('[processWithOpenAI] Standard OpenAI Primary Call', {
        model,
      });

      // Create a base configuration object
      const completionConfig = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      // Only add responseFormat if specified
      if (responseFormat) {
        completionResponse = await openai.chat.completions.create({
          ...completionConfig,
          response_format: responseFormat,
        });
      } else {
        completionResponse =
          await openai.chat.completions.create(completionConfig);
      }
    }

    logger.info(
      `Received response from AI Service (${aiProvider}) using model ${model}`
    );

    const usage: TokenUsage = {
      prompt_tokens: completionResponse.usage?.prompt_tokens || 0,
      completion_tokens: completionResponse.usage?.completion_tokens || 0,
      total_tokens: completionResponse.usage?.total_tokens || 0,
      estimated_cost: calculateCost(
        completionResponse.usage?.prompt_tokens || 0,
        completionResponse.usage?.completion_tokens || 0,
        model
      ),
      model,
    };

    const content = completionResponse.choices[0]?.message?.content || '';

    return {
      content,
      usage,
    };
  } catch (apiError) {
    logger.error(
      `Error calling AI Service (${aiProvider}) with model ${model}`,
      {
        error: apiError,
        model,
      }
    );

    // Check if a fallback model is configured
    if (!fallbackModel) {
      logger.warn(
        `Primary API call failed for model ${model} and no fallback model configured.`
      );
      // Re-throw the original error if no fallback is available
      if (apiError instanceof Error) {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          `AI Service error (${model}): ${apiError.message}`
        );
      } else {
        throw new ApplicationError(
          ErrorCode.AI_SERVICE_ERROR,
          `Failed to process request with AI service (no fallback): ${String(apiError)}`
        );
      }
    }

    // Try with fallback model
    logger.info(
      `Attempting AI Service (${aiProvider}) call with fallback model ${fallbackModel}`
    );
    try {
      let completionResponse: ChatCompletion;
      let usedFallback = false;

      if (aiProvider === 'azure') {
        // Construct the full fallback URL manually for Azure
        const azureFallbackUrl = `${openai.baseURL}deployments/${fallbackModel}/chat/completions?api-version=${apiVersion}`;
        logger.debug('[processWithOpenAI] Azure Fallback Call', {
          url: azureFallbackUrl,
          deployment: fallbackModel,
        });
        const response = await fetch(azureFallbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': env.AZURE_OPENAI_API_KEY!,
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages,
            temperature,
            max_tokens: maxTokens,
            response_format: responseFormat,
          }),
        });

        if (!response.ok) {
          logger.error('[processWithOpenAI] Azure Fallback Call Failed', {
            status: response.status,
            statusText: response.statusText,
          });
          throw new ApplicationError(
            ErrorCode.AI_INVALID_RESPONSE,
            `Invalid response from fallback AI service: ${response.statusText} (${response.status})`,
            response.status
          );
        }
        completionResponse = await response.json();
        usedFallback = true;
      } else {
        // Standard OpenAI fallback call using SDK
        logger.debug('[processWithOpenAI] Standard OpenAI Fallback Call', {
          model: fallbackModel,
        });

        // Create a base configuration object
        const fallbackConfig = {
          model: fallbackModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        };

        // Only add responseFormat if specified
        if (responseFormat) {
          completionResponse = await openai.chat.completions.create({
            ...fallbackConfig,
            response_format: responseFormat,
          });
        } else {
          completionResponse =
            await openai.chat.completions.create(fallbackConfig);
        }
        usedFallback = true;
      }

      logger.info(
        `Successfully received fallback response from AI Service (${aiProvider}) using model ${fallbackModel}`
      );

      const fallbackUsage: TokenUsage = {
        prompt_tokens: completionResponse.usage?.prompt_tokens || 0,
        completion_tokens: completionResponse.usage?.completion_tokens || 0,
        total_tokens: completionResponse.usage?.total_tokens || 0,
        estimated_cost: calculateCost(
          completionResponse.usage?.prompt_tokens || 0,
          completionResponse.usage?.completion_tokens || 0,
          fallbackModel
        ),
        model: fallbackModel,
        used_fallback: true,
      };

      return {
        content: completionResponse.choices[0]?.message?.content || '',
        usage: fallbackUsage,
      };
    } catch (fallbackError) {
      logger.error(
        `Error with AI Service (${aiProvider}) fallback model ${fallbackModel}`,
        {
          error: fallbackError,
          originalError: apiError,
        }
      );

      // Throw a comprehensive error that includes both primary and fallback errors
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `AI service failed for primary model (${model}) and fallback (${fallbackModel}). Primary error: ${String(apiError)}, Fallback error: ${String(fallbackError)}`
      );
    }
  }
}
