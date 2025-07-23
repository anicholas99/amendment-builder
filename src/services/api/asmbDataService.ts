/**
 * ASMB Data Service
 * 
 * Gathers all data required for generating Amendment Submission Boilerplate (ASMB)
 * - the first page/cover page of USPTO amendment submissions.
 * 
 * Sources data from:
 * - Project and Invention (title, inventors)
 * - PatentApplication (app number, filing date, examiner info)
 * - OfficeAction (examiner details, art unit)
 * - User and Tenant (attorney info, firm name)
 */

import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { z } from 'zod';

// ============ TYPES ============

export interface ASMBData {
  // Application Information
  applicationNumber?: string;
  filingDate?: Date;
  title?: string;
  inventors?: string[];
  
  // Examiner Information  
  examinerName?: string;
  examinerId?: string;
  artUnit?: string;
  
  // Office Action Information
  officeActionNumber?: string;
  mailingDate?: Date;
  responseDeadline?: Date;
  
  // Attorney/Firm Information
  attorneyName?: string;
  firmName?: string;
  customerNumber?: string;
  docketNumber?: string;
  
  // Submission Information
  submissionType: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
  submissionStatement: string;
  
  // Contact Information
  correspondenceAddress?: {
    name: string;
    address: string[];
    city: string;
    state: string;
    zipCode: string;
  };
}

const ASMBDataResponseSchema = z.object({
  applicationNumber: z.string().nullable().optional(),
  filingDate: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  inventors: z.array(z.string()).optional(),
  examinerName: z.string().nullable().optional(),
  examinerId: z.string().nullable().optional(),
  artUnit: z.string().nullable().optional(),
  officeActionNumber: z.string().nullable().optional(),
  mailingDate: z.string().nullable().optional(),
  responseDeadline: z.string().nullable().optional(),
  attorneyName: z.string().nullable().optional(),
  firmName: z.string().nullable().optional(),
  customerNumber: z.string().nullable().optional(),
  docketNumber: z.string().nullable().optional(),
  submissionType: z.enum(['AMENDMENT', 'CONTINUATION', 'RCE']),
  submissionStatement: z.string(),
  correspondenceAddress: z.object({
    name: z.string(),
    address: z.array(z.string()),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }).nullable().optional(),
});

// ============ SERVICE CLASS ============

export class ASMBDataService {
  /**
   * Get ASMB data for a specific project and office action
   */
  static async getASMBData(
    projectId: string,
    officeActionId: string,
    submissionType: 'AMENDMENT' | 'CONTINUATION' | 'RCE' = 'AMENDMENT'
  ): Promise<ASMBData> {
    logger.info('[ASMBDataService] Fetching ASMB data', {
      projectId,
      officeActionId,
      submissionType,
    });

    try {
      const response = await apiFetch(
        `/api/projects/${projectId}/office-actions/${officeActionId}/asmb-data?submissionType=${submissionType}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_NETWORK_ERROR,
          `Failed to fetch ASMB data: ${response.status}`
        );
      }

      const rawData = await response.json();
      
      // Unwrap data if it's wrapped by apiResponse.ok()
      const data = rawData.data || rawData;
      
      const validated = ASMBDataResponseSchema.parse(data);
      
      // Transform the data to the expected format
      const asmbData: ASMBData = {
        applicationNumber: validated.applicationNumber || undefined,
        filingDate: validated.filingDate ? new Date(validated.filingDate) : undefined,
        title: validated.title || undefined,
        inventors: validated.inventors || [],
        examinerName: validated.examinerName || undefined,
        examinerId: validated.examinerId || undefined,
        artUnit: validated.artUnit || undefined,
        officeActionNumber: validated.officeActionNumber || undefined,
        mailingDate: validated.mailingDate ? new Date(validated.mailingDate) : undefined,
        responseDeadline: validated.responseDeadline ? new Date(validated.responseDeadline) : undefined,
        attorneyName: validated.attorneyName || undefined,
        firmName: validated.firmName || undefined,
        customerNumber: validated.customerNumber || undefined,
        docketNumber: validated.docketNumber || undefined,
        submissionType: validated.submissionType,
        submissionStatement: validated.submissionStatement,
        correspondenceAddress: validated.correspondenceAddress || undefined,
      };

      logger.info('[ASMBDataService] ASMB data fetched successfully', {
        projectId,
        officeActionId,
        hasApplicationNumber: !!asmbData.applicationNumber,
        hasExaminer: !!asmbData.examinerName,
        hasAttorney: !!asmbData.attorneyName,
      });

      return asmbData;
    } catch (error) {
      logger.error('[ASMBDataService] Failed to fetch ASMB data', {
        projectId,
        officeActionId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        `Failed to fetch ASMB data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate the submission statement based on submission type
   */
  static generateSubmissionStatement(
    submissionType: 'AMENDMENT' | 'CONTINUATION' | 'RCE',
    officeActionDate?: Date
  ): string {
    const dateStr = officeActionDate 
      ? officeActionDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : '[DATE]';

    switch (submissionType) {
      case 'AMENDMENT':
        return `SUBMISSION ACCOMPANYING AMENDMENT IN RESPONSE TO OFFICE ACTION DATED ${dateStr.toUpperCase()}`;
      
      case 'RCE':
        return `SUBMISSION ACCOMPANYING REQUEST FOR CONTINUED EXAMINATION PURSUANT TO 37 C.F.R. § 1.114`;
      
      case 'CONTINUATION':
        return `SUBMISSION ACCOMPANYING CONTINUATION APPLICATION PURSUANT TO 37 C.F.R. § 1.53(b)`;
      
      default:
        return `SUBMISSION ACCOMPANYING AMENDMENT IN RESPONSE TO OFFICE ACTION DATED ${dateStr.toUpperCase()}`;
    }
  }

  /**
   * Calculate response deadline (typically 3 months from office action mailing date)
   */
  static calculateResponseDeadline(mailingDate?: Date): Date | undefined {
    if (!mailingDate) return undefined;
    
    // Add 3 months to mailing date
    const deadline = new Date(mailingDate);
    deadline.setMonth(deadline.getMonth() + 3);
    
    return deadline;
  }

  /**
   * Format inventors array for display
   */
  static formatInventors(inventors?: string[]): string {
    if (!inventors || inventors.length === 0) {
      return '[INVENTOR NAME(S)]';
    }
    
    if (inventors.length === 1) {
      return inventors[0];
    }
    
    if (inventors.length === 2) {
      return `${inventors[0]} and ${inventors[1]}`;
    }
    
    // Multiple inventors: "John Doe, Jane Smith, et al."
    return `${inventors[0]}, ${inventors[1]}, et al.`;
  }
} 