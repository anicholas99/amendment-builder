/**
 * Amendment API Service
 * 
 * API service layer for office action and amendment operations
 * Follows established patterns: service layer handles validation, errors, and type safety
 */

import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import type { 
  OfficeAction, 
  OfficeActionWithRelations,
  ParsedOfficeActionData,
  Rejection 
} from '@/types/amendment';

// ============ VALIDATION SCHEMAS ============

const OfficeActionResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: z.string(),
    projectId: z.string(),
    oaNumber: z.string().nullable(),
    dateIssued: z.string().nullable(),
    examinerId: z.string().nullable(),
    artUnit: z.string().nullable(),
    originalFileName: z.string().nullable(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  meta: z.object({
    total: z.number(),
    projectId: z.string(),
  }),
});

const OfficeActionDetailResponseSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  oaNumber: z.string().nullable(),
  dateIssued: z.string().nullable(),
  examinerId: z.string().nullable(),
  artUnit: z.string().nullable(),
  originalFileName: z.string().nullable(),
  status: z.string(),
  parsedJson: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Include metadata and examiner fields from API response
  metadata: z.object({
    applicationNumber: z.string().nullable().optional(),
    mailingDate: z.string().nullable().optional(),
    examinerName: z.string().nullable().optional(),
    artUnit: z.string().nullable().optional(),
  }).nullable().optional(),
  examiner: z.object({
    name: z.string().nullable().optional(),
    id: z.string().nullable().optional(),
    artUnit: z.string().nullable().optional(),
  }).nullable().optional(),
  rejections: z.array(z.object({
    id: z.string(),
    type: z.string(),
    claimNumbers: z.string().nullable(), // JSON string that can be null
    citedPriorArt: z.string().nullable(),
    examinerText: z.string(),
    displayOrder: z.number(),
  })).optional(),
});

const UploadResponseSchema = z.object({
  success: z.boolean(),
  officeAction: z.object({
    id: z.string(),
    fileName: z.string(),
    status: z.string(),
    rejectionCount: z.number(),
    createdAt: z.string(),
    isTestText: z.boolean().optional(),
  }),
  warning: z.string().optional(),
});

const ResponseShellResponseSchema = z.object({
  responseShell: z.object({
    id: z.string(),
    sections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      rejectionIds: z.array(z.string()),
    })),
    metadata: z.object({
      totalRejections: z.number(),
      templateStyle: z.string(),
    }),
  }),
  message: z.string(),
});

// ============ PROCESSED TYPES ============

export interface ProcessedOfficeAction {
  id: string;
  projectId: string;
  fileName: string;
  status: 'UPLOADED' | 'PARSED' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  oaNumber?: string;
  dateIssued?: Date;
  examiner?: {
    id?: string;
    name?: string;
    artUnit?: string;
  };
  rejections: ProcessedRejection[];
  metadata?: ParsedOfficeActionData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedRejection {
  id: string;
  type: string;
  claimNumbers: string[];
  citedPriorArt: string[];
  examinerText: string;
  displayOrder: number;
  parsedElements?: Record<string, any>;
}

export interface UploadResult {
  id: string;
  fileName: string;
  status: string;
  rejectionCount: number;
  createdAt: string;
  isTestText?: boolean;
  warning?: string;
}

export interface ResponseShell {
  id: string;
  sections: Array<{
    title: string;
    content: string;
    rejectionIds: string[];
  }>;
  metadata: {
    totalRejections: number;
    templateStyle: string;
  };
}

// ============ SERVICE CLASS ============

export class AmendmentApiService {
  /**
   * Get all office actions for a project
   */
  static async getOfficeActions(projectId: string): Promise<ProcessedOfficeAction[]> {
    logger.debug('[AmendmentApiService] Fetching office actions', { projectId });

    try {
      const response = await apiFetch(`/api/projects/${projectId}/office-actions`);
      const rawData = await response.json();
      
      // Unwrap the data if it's wrapped by apiResponse.ok()
      const data = rawData.data || rawData;
      
      const validated = OfficeActionResponseSchema.parse(data);
      
      return validated.data.map(oa => ({
        id: oa.id,
        projectId: oa.projectId,
        fileName: oa.originalFileName || 'Unknown File',
        status: oa.status as ProcessedOfficeAction['status'],
        oaNumber: oa.oaNumber || undefined,
        dateIssued: oa.dateIssued ? new Date(oa.dateIssued) : undefined,
        examiner: {
          id: oa.examinerId || undefined,
          artUnit: oa.artUnit || undefined,
        },
        rejections: [], // Will be populated by getOfficeActionDetail
        createdAt: new Date(oa.createdAt),
        updatedAt: new Date(oa.updatedAt),
      }));
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to fetch office actions', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to fetch office actions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get detailed office action with rejections
   */
  static async getOfficeActionDetail(officeActionId: string): Promise<ProcessedOfficeAction> {
    logger.debug('[AmendmentApiService] Fetching office action detail', { officeActionId });

    try {
      const response = await apiFetch(`/api/office-actions/${officeActionId}`);
      const rawData = await response.json();
      
      // Unwrap the data if it's wrapped by apiResponse.ok()
      const data = rawData.data || rawData;
      
      const validated = OfficeActionDetailResponseSchema.parse(data);
      
      // Parse metadata from JSON string
      let metadata: ParsedOfficeActionData | undefined;
      if (validated.parsedJson) {
        try {
          metadata = JSON.parse(validated.parsedJson);
        } catch (e) {
          logger.warn('[AmendmentApiService] Failed to parse office action metadata', {
            officeActionId,
            error: e,
          });
        }
      }

      // Process rejections
      const rejections: ProcessedRejection[] = (validated.rejections || []).map(r => ({
        id: r.id,
        type: r.type,
        claimNumbers: r.claimNumbers ? JSON.parse(r.claimNumbers) : [],
        citedPriorArt: r.citedPriorArt ? JSON.parse(r.citedPriorArt) : [],
        examinerText: r.examinerText,
        displayOrder: r.displayOrder,
      }));

      return {
        id: validated.id,
        projectId: validated.projectId,
        fileName: validated.originalFileName || 'Unknown File',
        status: validated.status as ProcessedOfficeAction['status'],
        oaNumber: validated.oaNumber || undefined,
        dateIssued: validated.dateIssued ? new Date(validated.dateIssued) : undefined,
        examiner: {
          id: validated.examinerId || validated.examiner?.id || undefined,
          name: validated.examiner?.name || validated.metadata?.examinerName || undefined,
          artUnit: validated.artUnit || validated.examiner?.artUnit || validated.metadata?.artUnit || undefined,
        },
        rejections,
        metadata: {
          // Create UI-compatible metadata structure
          applicationNumber: validated.metadata?.applicationNumber || metadata?.applicationNumber || undefined,
          mailingDate: validated.metadata?.mailingDate || metadata?.dateIssued || undefined,
          examinerName: validated.metadata?.examinerName || validated.examiner?.name || metadata?.examiner?.name || undefined,
          artUnit: validated.metadata?.artUnit || validated.examiner?.artUnit || metadata?.examiner?.artUnit || undefined,
        } as any, // Type assertion to avoid conflicts with ParsedOfficeActionData
        createdAt: new Date(validated.createdAt),
        updatedAt: new Date(validated.updatedAt),
      };
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to fetch office action detail', {
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to fetch office action detail: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload office action file
   */
  static async uploadOfficeAction(
    projectId: string,
    file: File,
    metadata?: {
      applicationNumber?: string;
      mailingDate?: string;
      examinerName?: string;
    }
  ): Promise<UploadResult> {
    logger.info('[AmendmentApiService] Uploading office action', {
      projectId,
      fileName: file.name,
      fileSize: file.size,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      const validated = UploadResponseSchema.parse(data);

      logger.info('[AmendmentApiService] Office action uploaded successfully', {
        projectId,
        officeActionId: validated.officeAction.id,
      });

      return {
        id: validated.officeAction.id,
        fileName: validated.officeAction.fileName,
        status: validated.officeAction.status,
        rejectionCount: validated.officeAction.rejectionCount,
        createdAt: validated.officeAction.createdAt,
        isTestText: validated.officeAction.isTestText,
        warning: validated.warning,
      };
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to upload office action', {
        projectId,
        fileName: file.name,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to upload office action: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload test text as office action
   */
  static async uploadTestText(
    projectId: string,
    testText: string,
    metadata?: {
      applicationNumber?: string;
      mailingDate?: string;
      examinerName?: string;
    }
  ): Promise<UploadResult> {
    logger.info('[AmendmentApiService] Uploading test text', {
      projectId,
      textLength: testText.length,
    });

    try {
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testText,
            metadata,
          }),
        }
      );

      const data = await response.json();
      const validated = UploadResponseSchema.parse(data);

      logger.info('[AmendmentApiService] Test text uploaded successfully', {
        projectId,
        officeActionId: validated.officeAction.id,
      });

      return {
        id: validated.officeAction.id,
        fileName: validated.officeAction.fileName,
        status: validated.officeAction.status,
        rejectionCount: validated.officeAction.rejectionCount,
        createdAt: validated.officeAction.createdAt,
        isTestText: validated.officeAction.isTestText,
        warning: validated.warning,
      };
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to upload test text', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to upload test text: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate response shell for office action
   */
  static async generateResponseShell(
    projectId: string,
    officeActionId: string,
    options?: {
      templateStyle?: 'formal' | 'standard' | 'concise';
      includeBoilerplate?: boolean;
      firmName?: string;
    }
  ): Promise<ResponseShell> {
    logger.info('[AmendmentApiService] Generating response shell', {
      projectId,
      officeActionId,
      templateStyle: options?.templateStyle,
    });

    try {
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/generate-response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateStyle: options?.templateStyle || 'standard',
            includeBoilerplate: options?.includeBoilerplate ?? true,
            firmName: options?.firmName,
          }),
        }
      );

      const data = await response.json();
      const validated = ResponseShellResponseSchema.parse(data);

      logger.info('[AmendmentApiService] Response shell generated successfully', {
        projectId,
        officeActionId,
        sectionCount: validated.responseShell.sections.length,
      });

      return validated.responseShell;
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to generate response shell', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to generate response shell: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============ DRAFT OPERATIONS ============

  /**
   * Save amendment draft content
   */
  static async saveAmendmentDraft(
    projectId: string,
    officeActionId: string,
    draftContent: {
      title: string;
      responseType: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
      claimAmendments: any[];
      argumentSections: any[];
    }
  ): Promise<{ success: boolean; lastSaved: Date }> {
    logger.info('[AmendmentApiService] Saving amendment draft', {
      projectId,
      officeActionId,
      claimCount: draftContent.claimAmendments.length,
      argumentCount: draftContent.argumentSections.length,
    });

    try {
      // Use the existing draft document system with amendment-specific type
      const draftType = `AMENDMENT_DRAFT_${officeActionId}`;
      const content = JSON.stringify({
        ...draftContent,
        lastSaved: new Date().toISOString(),
        officeActionId,
      });

      const response = await apiFetch(`/api/projects/${projectId}/draft`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: draftType,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      const data = await response.json();

      logger.info('[AmendmentApiService] Amendment draft saved successfully', {
        projectId,
        officeActionId,
        documentId: data.id,
      });

      return {
        success: true,
        lastSaved: new Date(),
      };
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to save amendment draft', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to save amendment draft: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Load amendment draft content
   */
  static async loadAmendmentDraft(
    projectId: string,
    officeActionId: string
  ): Promise<any | null> {
    logger.debug('[AmendmentApiService] Loading amendment draft', {
      projectId,
      officeActionId,
    });

    try {
      const draftType = `AMENDMENT_DRAFT_${officeActionId}`;
      
      const response = await apiFetch(
        `/api/projects/${projectId}/draft?type=${draftType}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No draft exists yet
        }
        throw new Error(`Load failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.content) {
        const draftContent = JSON.parse(data.content);
        
        logger.info('[AmendmentApiService] Amendment draft loaded successfully', {
          projectId,
          officeActionId,
          hasContent: !!draftContent,
        });

        return draftContent;
      }

      return null;
    } catch (error) {
      logger.error('[AmendmentApiService] Failed to load amendment draft', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Don't throw for load errors - just return null and let UI handle it
      return null;
    }
  }
} 