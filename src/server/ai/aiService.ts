import { OpenaiServerService } from '@/server/services/openai.server-service';
import type {
  TokenUsage,
  AIServiceResponse,
} from '@/server/services/openai.server-service';

export type { TokenUsage };

/**
 * Compatibility wrapper for the old processWithOpenAI function
 * Maps old function signature to new OpenaiServerService
 */
export async function processWithOpenAI(
  prompt: string,
  systemMessage: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    response_format?: { type: 'json_object' | 'text' };
  }
): Promise<{ content: string; usage: TokenUsage }> {
  const response = await OpenaiServerService.getChatCompletion({
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ],
    model: options?.model,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
    response_format: options?.response_format,
  });

  return {
    content: response.content,
    usage: response.usage,
  };
}
