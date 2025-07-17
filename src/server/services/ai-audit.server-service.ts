/**
 * AI Audit Service
 *
 * Wraps AI service calls to provide comprehensive auditing for USPTO compliance.
 * Tracks all AI requests and responses for transparency and regulatory requirements.
 */

import { OpenaiServerService } from './openai.server-service';
// eslint-disable-next-line no-restricted-imports -- Server service needs repository access
import { aiAuditLogRepository } from '@/repositories/aiAuditLogRepository';
// eslint-disable-next-line no-restricted-imports -- Server service needs logger
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type { TokenUsage, AIServiceResponse } from './openai.server-service';

export interface AuditedAIRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  model?: string;
  fallbackModel?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
  // Audit context
  operation: string;
  toolName?: string;
  projectId: string;
  tenantId: string;
  userId: string;
}

export interface AuditedAIResponse extends AIServiceResponse {
  auditLogId: string;
}

export class AIAuditService {
  /**
   * Makes an AI request with full audit logging
   */
  static async makeAuditedRequest(
    params: AuditedAIRequest
  ): Promise<AuditedAIResponse> {
    const startTime = Date.now();
    let auditLogId: string | undefined;

    try {
      // Create audit log entry before making request
      const auditLog = await aiAuditLogRepository.create({
        projectId: params.projectId,
        tenantId: params.tenantId,
        userId: params.userId,
        operation: params.operation,
        toolName: params.toolName,
        model: params.model || 'gpt-4.1',
        prompt: JSON.stringify(params.messages),
        status: 'pending',
      });

      auditLogId = auditLog.id;

      // Make the actual AI request
      const response = await OpenaiServerService.getChatCompletion({
        messages: params.messages,
        model: params.model,
        fallbackModel: params.fallbackModel,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        response_format: params.response_format,
      });

      // Update audit log with successful response
      await aiAuditLogRepository.update(auditLogId, {
        response: response.content,
        tokenUsage: { ...response.usage },
        status: 'success',
      });

      logger.info('[AIAuditService] Successfully audited AI request', {
        auditLogId,
        operation: params.operation,
        executionTime: Date.now() - startTime,
        tokens: response.usage.total_tokens,
      });

      return {
        ...response,
        auditLogId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // Update audit log with error
      if (auditLogId) {
        await aiAuditLogRepository
          .update(auditLogId, {
            status: 'error',
            errorMessage,
          })
          .catch((updateError: unknown) => {
            logger.error(
              '[AIAuditService] Failed to update audit log with error',
              {
                auditLogId,
                updateError,
              }
            );
          });
      }

      logger.error('[AIAuditService] AI request failed', {
        error: errorObj,
        operation: params.operation,
        auditLogId,
      });

      throw errorObj;
    }
  }

  /**
   * Makes an AI request with streaming and audit logging
   */
  static async makeAuditedStreamingRequest(
    params: AuditedAIRequest,
    onChunk: (chunk: string) => void
  ): Promise<AuditedAIResponse> {
    const startTime = Date.now();
    let auditLogId: string | undefined;
    let fullResponse = '';

    try {
      // Create audit log entry before making request
      const auditLog = await aiAuditLogRepository.create({
        projectId: params.projectId,
        tenantId: params.tenantId,
        userId: params.userId,
        operation: params.operation,
        toolName: params.toolName,
        model: params.model || 'gpt-4.1',
        prompt: JSON.stringify(params.messages),
        status: 'pending',
      });

      auditLogId = auditLog.id;

      // Make the streaming request
      const response = await OpenaiServerService.getChatCompletionStream({
        messages: params.messages,
        model: params.model,
        fallbackModel: params.fallbackModel,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        response_format: params.response_format,
      });

      // Collect chunks for audit
      const wrappedOnChunk = (chunk: string) => {
        fullResponse += chunk;
        onChunk(chunk);
      };

      // Consume the stream
      let usage: TokenUsage | undefined;

      for await (const chunk of response) {
        if (chunk.token) {
          wrappedOnChunk(chunk.token);
        }
        if (chunk.usage) {
          usage = chunk.usage;
        }
        if (chunk.done) {
          break;
        }
      }

      // Create the final response with usage data
      const finalResponse = {
        usage: usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          estimated_cost: 0,
        },
      };

      // Update audit log with successful response
      await aiAuditLogRepository.update(auditLogId, {
        response: fullResponse,
        tokenUsage: { ...finalResponse.usage },
        status: 'success',
      });

      logger.info(
        '[AIAuditService] Successfully audited streaming AI request',
        {
          auditLogId,
          operation: params.operation,
          executionTime: Date.now() - startTime,
          tokens: finalResponse.usage.total_tokens,
        }
      );

      return {
        content: fullResponse,
        usage: finalResponse.usage,
        auditLogId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // Update audit log with error
      if (auditLogId) {
        await aiAuditLogRepository
          .update(auditLogId, {
            status: 'error',
            errorMessage,
            response: fullResponse || undefined,
          })
          .catch((updateError: unknown) => {
            logger.error(
              '[AIAuditService] Failed to update audit log with error',
              {
                auditLogId,
                updateError,
              }
            );
          });
      }

      logger.error('[AIAuditService] Streaming AI request failed', {
        error: errorObj,
        operation: params.operation,
        auditLogId,
      });

      throw errorObj;
    }
  }

  /**
   * Compatibility wrapper for processWithOpenAI with auditing
   */
  static async processWithAudit(
    prompt: string,
    systemMessage: string,
    context: {
      operation: string;
      toolName?: string;
      projectId: string;
      tenantId: string;
      userId: string;
    },
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      response_format?: { type: 'json_object' | 'text' };
    }
  ): Promise<AuditedAIResponse> {
    return this.makeAuditedRequest({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      ...context,
      model: options?.model,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      response_format: options?.response_format,
    });
  }

  /**
   * Mark an audit log as reviewed by a human
   */
  static async markAsReviewed(
    auditLogId: string,
    tenantId: string,
    reviewerId: string
  ): Promise<void> {
    try {
      await aiAuditLogRepository.markAsReviewed(
        auditLogId,
        tenantId,
        reviewerId
      );
      logger.info('[AIAuditService] Marked audit log as reviewed', {
        auditLogId,
        reviewerId,
      });
    } catch (error) {
      logger.error('[AIAuditService] Failed to mark as reviewed', {
        error,
        auditLogId,
      });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to mark AI audit log as reviewed'
      );
    }
  }

  /**
   * Get audit logs for USPTO compliance export
   */
  static async getAuditLogsForExport(
    projectId: string,
    tenantId: string
  ): Promise<
    Array<{
      id: string;
      timestamp: Date;
      operation: string;
      model: string;
      prompt: unknown;
      response: string;
      tokenUsage: unknown;
      humanReviewed: boolean;
      reviewedBy: string | null;
      reviewedAt: Date | null;
    }>
  > {
    try {
      const logs = await aiAuditLogRepository.getForExport(projectId, tenantId);

      // Transform for export format
      return logs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        operation: log.operation,
        model: log.model,
        prompt: JSON.parse(log.prompt) as unknown,
        response: log.response,
        tokenUsage: log.tokenUsage
          ? (JSON.parse(log.tokenUsage) as unknown)
          : null,
        humanReviewed: log.humanReviewed,
        reviewedBy: log.reviewedBy,
        reviewedAt: log.reviewedAt,
      }));
    } catch (error) {
      logger.error('[AIAuditService] Failed to get audit logs for export', {
        error,
        projectId,
      });
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        'Failed to retrieve AI audit logs for export'
      );
    }
  }
}
