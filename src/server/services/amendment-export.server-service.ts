/**
 * Amendment Export Server Service
 *
 * Handles server-side export of amendment responses to USPTO-compliant documents.
 * Leverages existing document generation patterns and Azure blob storage.
 */

import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { renderPromptTemplate } from '@/server/prompts/prompts/utils';
import { processWithOpenAI } from '@/server/ai/aiService';
import { safeJsonParse } from '@/utils/jsonUtils';
import { ASMBDataService } from '@/services/api/asmbDataService';
import { prisma } from '@/lib/prisma';

// ============ TYPES ============

export interface AmendmentExportData {
  title: string;
  responseType: 'AMENDMENT' | 'CONTINUATION' | 'RCE';
  claimAmendments: Array<{
    id: string;
    claimNumber: string;
    status: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
    originalText: string;
    amendedText: string;
    reasoning: string;
  }>;
  argumentSections: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    rejectionId?: string;
  }>;
  includeASMB?: boolean; // New: Whether to include ASMB as first page
}

export interface AmendmentExportOptions {
  format: 'docx' | 'pdf';
  includeMetadata: boolean;
  firmName?: string;
  attorneyName?: string;
  docketNumber?: string;
  applicationNumber?: string;
  mailingDate?: string;
  examinerName?: string;
}

export interface AmendmentExportResult {
  success: boolean;
  documentBuffer?: Buffer;
  fileName: string;
  fileSize: number;
  format: 'docx' | 'pdf';
  mimeType: string;
  generatedAt: Date;
  metadata: {
    wordCount: number;
    pageCount: number;
    claimCount: number;
    argumentCount: number;
  };
}

// ============ PROMPT TEMPLATES ============

const AMENDMENT_DOCUMENT_GENERATION_SYSTEM_PROMPT = {
  version: '1.0.0',
  template: `You are an expert patent attorney assistant generating USPTO-compliant amendment response documents.

Your task is to format an amendment response into a professional, properly structured document that follows USPTO guidelines and law firm standards.

DOCUMENT STRUCTURE REQUIREMENTS:
1. **ASMB (Amendment Submission Boilerplate)**: First page with application details, attorney info, and submission statement
2. **Amendment Section**: Clean claim amendments with proper formatting (starts on page 2)
3. **Remarks Section**: Professional arguments against rejections
4. **Signature Block**: Attorney signature area

FORMAT REQUIREMENTS:
- Use proper USPTO formatting with consistent spacing
- Number pages appropriately starting from page 1 (ASMB)
- Include all required legal boilerplate
- Format claims with proper indentation and numbering
- Use professional legal language throughout
- Ensure ASMB matches standard USPTO submission format

Return the complete document as formatted text that can be converted to DOCX.`,
};

const AMENDMENT_DOCUMENT_GENERATION_USER_PROMPT = {
  version: '1.0.0',
  template: `Generate a complete USPTO-compliant amendment response document with the following content:

{{#if includeASMB}}
**ASMB Data (Amendment Submission Boilerplate):**
- Application Number: {{applicationNumber}}
- Filing Date: {{filingDate}}
- Title: {{title}}
- Inventor(s): {{inventors}}
- Examiner: {{examinerName}}
- Art Unit: {{artUnit}}
- Attorney: {{attorneyName}}
- Firm: {{firmName}}
- Customer Number: {{customerNumber}}
- Docket Number: {{docketNumber}}
- Submission Statement: {{submissionStatement}}
- Office Action Date: {{mailingDate}}
{{/if}}

**Document Metadata:**
- Title: {{title}}
- Response Type: {{responseType}}
- Application Number: {{applicationNumber}}
- Mailing Date: {{mailingDate}}
- Examiner: {{examinerName}}
- Attorney: {{attorneyName}}
- Firm: {{firmName}}
- Docket Number: {{docketNumber}}

**Claim Amendments:**
{{#each claimAmendments}}
- Claim {{claimNumber}} ({{status}}):
  Original: {{originalText}}
  Amended: {{amendedText}}
  Reasoning: {{reasoning}}
{{/each}}

**Argument Sections:**
{{#each argumentSections}}
- {{title}}:
  {{content}}
{{/each}}

Generate a complete, professional amendment response document following USPTO formatting guidelines.
{{#if includeASMB}}Start with the ASMB as page 1, then claims amendments as page 2, then remarks.{{/if}}`,
};

// ============ SERVICE CLASS ============

export class AmendmentExportServerService {
  /**
   * Generate amendment response document
   */
  static async generateAmendmentDocument(
    exportData: AmendmentExportData,
    options: AmendmentExportOptions,
    metadata?: {
      projectId: string;
      officeActionId: string;
      tenantId: string;
    }
  ): Promise<AmendmentExportResult> {
    logger.info('[AmendmentExportServerService] Starting document generation', {
      format: options.format,
      claimCount: exportData.claimAmendments.length,
      argumentCount: exportData.argumentSections.length,
      projectId: metadata?.projectId,
      officeActionId: metadata?.officeActionId,
    });

    try {
      // Step 1: Generate formatted document content using AI
      const documentContent = await this.generateDocumentContent(exportData, options, metadata);

      // Step 2: Convert to specified format (DOCX/PDF)
      let documentBuffer: Buffer;
      let mimeType: string;

      if (options.format === 'docx') {
        documentBuffer = await this.generateDocxDocument(documentContent, exportData, options);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else {
        documentBuffer = await this.generatePdfDocument(documentContent, exportData, options);
        mimeType = 'application/pdf';
      }

      // Step 3: Calculate metadata
      const wordCount = this.calculateWordCount(documentContent);
      const pageCount = Math.ceil(wordCount / 250); // Estimate ~250 words per page

      const fileName = this.generateFileName(exportData, options);

      const result: AmendmentExportResult = {
        success: true,
        documentBuffer,
        fileName,
        fileSize: documentBuffer.length,
        format: options.format,
        mimeType,
        generatedAt: new Date(),
        metadata: {
          wordCount,
          pageCount,
          claimCount: exportData.claimAmendments.length,
          argumentCount: exportData.argumentSections.length,
        },
      };

      logger.info('[AmendmentExportServerService] Document generated successfully', {
        fileName: result.fileName,
        fileSize: result.fileSize,
        format: result.format,
        wordCount: result.metadata.wordCount,
        pageCount: result.metadata.pageCount,
      });

      return result;
    } catch (error) {
      logger.error('[AmendmentExportServerService] Document generation failed', {
        error: error instanceof Error ? error.message : String(error),
        format: options.format,
        projectId: metadata?.projectId,
        officeActionId: metadata?.officeActionId,
      });

      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `Failed to generate amendment document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate formatted document content using AI
   */
  private static async generateDocumentContent(
    exportData: AmendmentExportData,
    options: AmendmentExportOptions,
    metadata?: {
      projectId: string;
      officeActionId: string;
      tenantId: string;
    }
  ): Promise<string> {
    logger.debug('[AmendmentExportServerService] Generating document content with AI');

    try {
      // Fetch ASMB data if requested
      let asmbData: any = null;
      if (exportData.includeASMB && metadata?.projectId && metadata?.officeActionId) {
        asmbData = await this.fetchASMBData(metadata.projectId, metadata.officeActionId, exportData.responseType);
      }

      const systemPrompt = renderPromptTemplate(AMENDMENT_DOCUMENT_GENERATION_SYSTEM_PROMPT, {});
      const userPrompt = renderPromptTemplate(AMENDMENT_DOCUMENT_GENERATION_USER_PROMPT, {
        includeASMB: exportData.includeASMB,
        title: exportData.title,
        responseType: exportData.responseType,
        applicationNumber: asmbData?.applicationNumber || options.applicationNumber || 'Unknown',
        filingDate: asmbData?.filingDate ? new Date(asmbData.filingDate).toLocaleDateString() : 'Unknown',
        inventors: asmbData?.inventors ? ASMBDataService.formatInventors(asmbData.inventors) : 'Unknown',
        examinerName: asmbData?.examinerName || options.examinerName || 'Unknown',
        artUnit: asmbData?.artUnit || 'Unknown',
        customerNumber: asmbData?.customerNumber || 'Unknown',
        submissionStatement: asmbData?.submissionStatement || 'SUBMISSION ACCOMPANYING AMENDMENT',
        mailingDate: asmbData?.mailingDate ? new Date(asmbData.mailingDate).toLocaleDateString() : options.mailingDate || 'Unknown',
        attorneyName: asmbData?.attorneyName || options.attorneyName || 'Attorney Name',
        firmName: asmbData?.firmName || options.firmName || 'Law Firm Name',
        docketNumber: asmbData?.docketNumber || options.docketNumber || 'Unknown',
        claimAmendments: exportData.claimAmendments,
        argumentSections: exportData.argumentSections,
      });

      const aiResponse = await processWithOpenAI(systemPrompt, userPrompt, {
        maxTokens: 8000,
        temperature: 0.1, // Low temperature for consistent formatting
      });

      if (!aiResponse?.content?.trim()) {
        throw new ApplicationError(
          ErrorCode.AI_INVALID_RESPONSE,
          'AI service returned empty response for document generation'
        );
      }

      logger.debug('[AmendmentExportServerService] Document content generated successfully', {
        contentLength: aiResponse.content.length,
      });

      return aiResponse.content;
    } catch (error) {
      logger.error('[AmendmentExportServerService] AI document generation failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      // Don't use fallback content - throw error to client
      throw new ApplicationError(
        ErrorCode.AI_SERVICE_ERROR,
        `Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate DOCX document from content
   */
  private static async generateDocxDocument(
    content: string,
    exportData: AmendmentExportData,
    options: AmendmentExportOptions
  ): Promise<Buffer> {
    logger.debug('[AmendmentExportServerService] Generating DOCX document');

    try {
      // Import docx library dynamically to avoid bundling issues
      const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import('docx');

      // Create document structure
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: `Amendment Response - ${exportData.title}`,
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
            } as any),
            new Paragraph({ text: '' }), // Empty line

            // Application Information
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Application Information',
                  bold: true,
                  size: 24,
                }),
              ],
            } as any),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Application Number: ${options.applicationNumber || 'Unknown'}`,
                }),
              ],
            } as any),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Mailing Date: ${options.mailingDate || 'Unknown'}`,
                }),
              ],
            } as any),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Examiner: ${options.examinerName || 'Unknown'}`,
                }),
              ],
            } as any),
            new Paragraph({ text: '' }), // Empty line

            // Amendment Section
            new Paragraph({
              children: [
                new TextRun({
                  text: 'AMENDMENT',
                  bold: true,
                  size: 24,
                }),
              ],
            } as any),
            
            // Claims amendments
            ...exportData.claimAmendments.flatMap(amendment => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Claim ${amendment.claimNumber} (${amendment.status}):`,
                    bold: true,
                  }),
                ],
              } as any),
              new Paragraph({
                children: [
                  new TextRun({
                    text: amendment.amendedText,
                  }),
                ],
              } as any),
              new Paragraph({ text: '' }), // Empty line
            ]),

            // Remarks Section
            new Paragraph({
              children: [
                new TextRun({
                  text: 'REMARKS',
                  bold: true,
                  size: 24,
                }),
              ],
            } as any),

            // Argument sections
            ...exportData.argumentSections.flatMap(section => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.title,
                    bold: true,
                  }),
                ],
              } as any),
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.content,
                  }),
                ],
              } as any),
              new Paragraph({ text: '' }), // Empty line
            ]),
          ],
        }],
      } as any);

      // Generate buffer - using toBlob and converting to buffer for server-side
      const blob = await Packer.toBlob(doc);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      logger.debug('[AmendmentExportServerService] DOCX document generated', {
        bufferSize: buffer.length,
      });

      return buffer;
    } catch (error) {
      logger.error('[AmendmentExportServerService] DOCX generation failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ApplicationError(
        ErrorCode.FILE_PROCESSING_ERROR,
        `DOCX generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate PDF document from content (placeholder for future implementation)
   */
  private static async generatePdfDocument(
    content: string,
    exportData: AmendmentExportData,
    options: AmendmentExportOptions
  ): Promise<Buffer> {
    logger.warn('[AmendmentExportServerService] PDF generation not yet implemented, returning placeholder');
    
    // For now, return a simple PDF placeholder
    // TODO: Implement PDF generation using puppeteer or similar
    const placeholderContent = `PDF Export not yet implemented. Document content:\n\n${content}`;
    return Buffer.from(placeholderContent, 'utf-8');
  }



  /**
   * Generate filename for export
   */
  private static generateFileName(
    exportData: AmendmentExportData,
    options: AmendmentExportOptions
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    let baseName = 'Amendment_Response';
    
    if (options.applicationNumber && options.applicationNumber !== 'Unknown') {
      baseName += `_${options.applicationNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    
    return `${baseName}_${timestamp}.${options.format}`;
  }

  /**
   * Calculate word count for document content
   */
  private static calculateWordCount(content: string): number {
    return content
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Fetch ASMB data from the database
   */
  private static async fetchASMBData(
    projectId: string,
    officeActionId: string,
    submissionType: 'AMENDMENT' | 'CONTINUATION' | 'RCE'
  ): Promise<any> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client is not initialized'
        );
      }

      // Get all related data in one query
      const officeAction = await prisma.officeAction.findUnique({
        where: { id: officeActionId },
        include: {
          project: {
            include: {
              invention: true,
              patentApplication: true,
              user: true,
              tenant: true,
            },
          },
        },
      });

      if (!officeAction) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'Office Action not found'
        );
      }

      const { project } = officeAction;
      const { invention, patentApplication, user, tenant } = project;

      // Parse inventors from invention or patent application
      let inventors: string[] = [];
      if (invention?.inventorsJson) {
        try {
          const parsed = JSON.parse(invention.inventorsJson);
          inventors = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          logger.warn('Failed to parse inventors JSON from invention', { error });
        }
      }
      
      // Fallback to patent application inventors
      if (inventors.length === 0 && patentApplication?.inventors) {
        try {
          const parsed = JSON.parse(patentApplication.inventors);
          inventors = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          logger.warn('Failed to parse inventors JSON from patent application', { error });
        }
      }

      // Get title from multiple sources (priority: invention > patent application > project)
      const title = invention?.title || patentApplication?.title || project?.name;

      // Parse tenant settings for firm information
      let firmSettings: any = {};
      if (tenant?.settings) {
        try {
          firmSettings = JSON.parse(tenant.settings);
        } catch (error) {
          logger.warn('Failed to parse tenant settings', { error });
        }
      }

      // Calculate response deadline
      const mailingDate = officeAction.dateIssued;
      const responseDeadline = ASMBDataService.calculateResponseDeadline(mailingDate || undefined);

      // Generate submission statement
      const submissionStatement = ASMBDataService.generateSubmissionStatement(
        submissionType,
        mailingDate || undefined
      );

      // Assemble ASMB data
      return {
        applicationNumber: officeAction.applicationNumber || patentApplication?.applicationNumber,
        filingDate: patentApplication?.filingDate?.toISOString(),
        title,
        inventors,
        examinerName: officeAction.examinerId 
          ? `${officeAction.examinerId}` 
          : patentApplication?.examinerName,
        examinerId: officeAction.examinerId || patentApplication?.examinerId,
        artUnit: officeAction.artUnit || patentApplication?.artUnit,
        officeActionNumber: officeAction.oaNumber,
        mailingDate: mailingDate?.toISOString(),
        responseDeadline: responseDeadline?.toISOString(),
        attorneyName: user?.name || firmSettings.attorneyName || '[ATTORNEY NAME]',
        firmName: tenant?.name || '[FIRM NAME]',
        customerNumber: firmSettings.customerNumber,
        docketNumber: firmSettings.docketNumber || project?.name,
        submissionType,
        submissionStatement,
      };
    } catch (error) {
      logger.error('[AmendmentExportServerService] Failed to fetch ASMB data', {
        error: error instanceof Error ? error.message : String(error),
        projectId,
        officeActionId,
      });
      
      // Return minimal data rather than throwing
      return {
        applicationNumber: '[APPLICATION NUMBER]',
        title: '[INVENTION TITLE]',
        inventors: [],
        examinerName: '[EXAMINER NAME]',
        artUnit: '[ART UNIT]',
        attorneyName: '[ATTORNEY NAME]',
        firmName: '[FIRM NAME]',
        submissionStatement: ASMBDataService.generateSubmissionStatement(submissionType),
      };
    }
  }
} 