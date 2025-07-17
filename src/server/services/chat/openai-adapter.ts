/**
 * OpenAI Adapter - Handles OpenAI API interactions and formatting
 *
 * This module manages:
 * - Converting tools to OpenAI function format
 * - Making streaming requests to OpenAI/Azure
 * - Handling provider-specific configurations
 */

import { getAvailableTools } from '@/server/tools/toolExecutor';
import { ToolRegistry } from './tool-registry';
import { serverFetch } from '@/lib/api/serverFetch';
import { environment } from '@/config/environment';
import { env } from '@/config/env';
import { logger } from '@/server/logger';

export interface OpenAIFunction {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: { name: string; arguments: string };
}

export interface StreamRequestBody {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream: boolean;
  tools?: OpenAIFunction[];
  tool_choice?: 'auto' | 'none';
}

export class OpenAIAdapter {
  /**
   * Convert our tools to OpenAI function format
   */
  static getOpenAIFunctions(): OpenAIFunction[] {
    const tools = getAvailableTools();

    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: ToolRegistry.getToolParameters(tool.name),
      },
    }));
  }

  /**
   * Create streaming request to OpenAI/Azure
   */
  static async createStreamingRequest(
    requestBody: StreamRequestBody
  ): Promise<Response> {
    if (env.AI_PROVIDER === 'azure') {
      return this.createAzureRequest(requestBody);
    } else {
      return this.createOpenAIRequest(requestBody);
    }
  }

  /**
   * Create request to Azure OpenAI
   */
  private static async createAzureRequest(
    requestBody: StreamRequestBody
  ): Promise<Response> {
    const apiVersion = environment.azure.openai.apiVersion;
    const azureApiKey = environment.azure.openai.apiKey;
    const azureEndpoint = environment.azure.openai.endpoint;
    const deploymentName = requestBody.model;

    const azureUrl = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

    logger.debug('[OpenAIAdapter] Creating Azure request', {
      deploymentName,
      messageCount: requestBody.messages.length,
      hasTools: !!requestBody.tools?.length,
    });

    return serverFetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey,
      },
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Create request to OpenAI
   */
  private static async createOpenAIRequest(
    requestBody: StreamRequestBody
  ): Promise<Response> {
    const openaiApiKey = environment.openai.apiKey;

    logger.debug('[OpenAIAdapter] Creating OpenAI request', {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      hasTools: !!requestBody.tools?.length,
    });

    return serverFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Build request body with standard parameters
   */
  static buildRequestBody(
    model: string,
    messages: OpenAIMessage[],
    includeTools: boolean = true
  ): StreamRequestBody {
    const body: StreamRequestBody = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    };

    if (includeTools) {
      body.tools = this.getOpenAIFunctions();
      body.tool_choice = 'auto';
    }

    return body;
  }

  /**
   * Convert messages to OpenAI format, filtering out unsupported types
   */
  static formatMessages(
    messages: Array<{ role: string; content: string }>
  ): OpenAIMessage[] {
    return messages
      .filter(
        msg =>
          msg.role === 'user' ||
          msg.role === 'assistant' ||
          msg.role === 'system'
      )
      .map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));
  }
}
