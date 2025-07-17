import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES, buildApiUrl } from '@/constants/apiRoutes';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { z } from 'zod';

// Response schemas
const AIAuditLogSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  operation: z.string(),
  toolName: z.string().nullable().optional(),
  model: z.string(),
  prompt: z.string(),
  response: z.string(),
  tokenUsage: z.string().nullable().optional(),
  status: z.string(),
  errorMessage: z.string().nullable().optional(),
  humanReviewed: z.boolean(),
  reviewedBy: z.string().nullable().optional(),
  reviewedAt: z.string().nullable().optional(),
  exportedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  project: z
    .object({
      name: z.string(),
    })
    .optional(),
  user: z
    .object({
      name: z.string().nullable().optional(),
      email: z.string(),
    })
    .optional(),
});

const AIAuditLogsResponseSchema = z.object({
  logs: z.array(AIAuditLogSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

const AIAuditExportResponseSchema = z.object({
  logs: z.array(
    z.object({
      id: z.string(),
      timestamp: z.string(),
      operation: z.string(),
      model: z.string(),
      prompt: z.array(
        z.object({
          role: z.string(),
          content: z.string(),
        })
      ),
      response: z.string(),
      tokenUsage: z
        .object({
          prompt_tokens: z.number(),
          completion_tokens: z.number(),
          total_tokens: z.number(),
          estimated_cost: z.number(),
        })
        .nullable()
        .optional(),
      humanReviewed: z.boolean(),
      reviewedBy: z.string().nullable().optional(),
      reviewedAt: z.string().nullable().optional(),
    })
  ),
  exportedAt: z.string(),
  projectName: z.string(),
});

export type AIAuditLog = z.infer<typeof AIAuditLogSchema>;
export type AIAuditLogsResponse = z.infer<typeof AIAuditLogsResponseSchema>;
export type AIAuditExportResponse = z.infer<typeof AIAuditExportResponseSchema>;

export interface AIAuditLogsQueryParams {
  projectId?: string;
  page?: number;
  limit?: number;
  operation?: string;
  humanReviewed?: boolean;
  startDate?: string;
  endDate?: string;
}

export const AIAuditApiService = {
  /**
   * Get AI audit logs with filtering
   */
  async getAuditLogs({
    projectId,
    page = 1,
    limit = 50,
    operation,
    humanReviewed,
    startDate,
    endDate,
  }: AIAuditLogsQueryParams): Promise<AIAuditLogsResponse> {
    const url = buildApiUrl(API_ROUTES.AI.AUDIT.LOGS, {
      ...(projectId && { projectId }),
      page,
      limit,
      ...(operation && { operation }),
      ...(humanReviewed !== undefined && { humanReviewed }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    const response = await apiFetch(url);
    const json = await response.json();
    return validateApiResponse(json, AIAuditLogsResponseSchema);
  },

  /**
   * Get a single AI audit log by ID
   */
  async getAuditLog(auditLogId: string): Promise<AIAuditLog> {
    if (!auditLogId) {
      throw new Error('Audit log ID is required');
    }

    const response = await apiFetch(API_ROUTES.AI.AUDIT.LOG_BY_ID(auditLogId));
    const json = await response.json();
    return validateApiResponse(json, AIAuditLogSchema);
  },

  /**
   * Mark an AI audit log as reviewed
   */
  async markAsReviewed(auditLogId: string): Promise<AIAuditLog> {
    if (!auditLogId) {
      throw new Error('Audit log ID is required');
    }

    const response = await apiFetch(
      API_ROUTES.AI.AUDIT.MARK_REVIEWED(auditLogId),
      {
        method: 'POST',
      }
    );

    const json = await response.json();
    return validateApiResponse(json, AIAuditLogSchema);
  },

  /**
   * Export AI audit logs for a project (USPTO compliance)
   */
  async exportAuditLogs(projectId: string): Promise<AIAuditExportResponse> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await apiFetch(API_ROUTES.AI.AUDIT.EXPORT(projectId), {
      method: 'GET',
    });

    const json = await response.json();
    return validateApiResponse(json, AIAuditExportResponseSchema);
  },

  /**
   * Download audit logs as a file
   */
  async downloadAuditLogs(
    projectId: string,
    format: 'pdf' | 'json' = 'pdf'
  ): Promise<Blob> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await apiFetch(
      `${API_ROUTES.AI.AUDIT.EXPORT_DOWNLOAD(projectId)}?format=${format}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download audit logs');
    }

    return response.blob();
  },

  /**
   * Get audit statistics for a project
   */
  async getAuditStats(projectId: string): Promise<{
    totalLogs: number;
    reviewedLogs: number;
    reviewPercentage: number;
    byOperation: Record<string, number>;
    byModel: Record<string, number>;
    totalTokens: number;
    totalCost: number;
  }> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await apiFetch(API_ROUTES.AI.AUDIT.STATS(projectId));
    const json = await response.json();

    return json;
  },
};
