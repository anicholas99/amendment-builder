import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

export interface DocumentUpdate {
  documentId: string;
  content: string;
}

export interface BatchUpdateResponse {
  success: boolean;
  updatedCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

class DocumentClientService {
  async batchUpdate(updates: DocumentUpdate[]): Promise<BatchUpdateResponse> {
    try {
      const response = await apiFetch(API_ROUTES.DOCUMENTS.BATCH_UPDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          errorData.error || 'Failed to batch update documents.'
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[DocumentClientService] Error in batchUpdate', { error });
      throw error;
    }
  }
}

export const documentClientService = new DocumentClientService();
