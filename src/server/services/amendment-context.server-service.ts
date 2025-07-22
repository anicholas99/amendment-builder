import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { projectDocumentRepository } from '@/repositories/projectDocumentRepository';

/**
 * Amendment Context Bundle - structured data for AI amendment generation
 */
export interface AmendmentContextBundle {
  officeAction: {
    docCode: string;
    date: Date;
    text: string;
    pageCount?: number;
    fileName?: string;
  } | null;
  claims: {
    docCode: string;
    date: Date;
    text: string;
    pageCount?: number;
  } | null;
  lastResponse: {
    docCode: string;
    date: Date;
    text: string;
    pageCount?: number;
  } | null;
  specification: {
    docCode: string;
    date: Date;
    text: string;
    pageCount?: number;
  } | null;
  extras: {
    examinerSearch?: {
      docCode: string;
      date: Date;
      text: string;
    } | null;
    searchStrategy?: {
      docCode: string;
      date: Date;
      text: string;
    } | null;
    interview?: {
      docCode: string;
      date: Date;
      text: string;
    } | null;
  };
  metadata: {
    contextComplete: boolean;
    missingDocuments: string[];
    totalDocuments: number;
    ocrDocuments: number;
  };
}

/**
 * Amendment Context Service
 * 
 * Gathers and structures the essential USPTO documents needed for AI amendment generation.
 * Uses Smart OCR document selection to identify the most relevant documents for responding
 * to the latest Office Action.
 */
export class AmendmentContextService {
  
  /**
   * Get structured amendment context bundle for AI processing
   * 
   * @param projectId - The project ID
   * @param tenantId - The tenant ID for security
   * @returns Structured context bundle with essential documents
   */
  static async getAmendmentDraftingContext(
    projectId: string,
    tenantId: string
  ): Promise<AmendmentContextBundle> {
    try {
      logger.info('[AmendmentContext] Building context for AI amendment generation', {
        projectId,
        tenantId,
      });

      // Step 1: Get all project documents with OCR text
      const projectDocuments = await projectDocumentRepository.findByProjectId(projectId);
      
      // Debug: Log what we found
      logger.info('[AmendmentContext] Found project documents', {
        projectId,
        totalDocuments: projectDocuments.length,
        sampleDocument: projectDocuments[0] ? {
          id: projectDocuments[0].id,
          fileName: projectDocuments[0].fileName,
          fileType: projectDocuments[0].fileType,
          availableFields: Object.keys(projectDocuments[0]),
        } : null,
      });
      
      // Filter for USPTO documents only
      const usptoDocuments = projectDocuments.filter((doc: any) => 
        doc.fileType === 'uspto-document' && doc.ocrText
      );

      logger.info('[AmendmentContext] Filtered USPTO documents with OCR', {
        projectId,
        usptoCount: usptoDocuments.length,
        usptoSample: usptoDocuments.length > 0 ? {
          sampleDoc: {
            id: usptoDocuments[0].id,
            fileName: usptoDocuments[0].fileName,
            fields: Object.keys(usptoDocuments[0]),
          }
        } : null,
      });

      if (usptoDocuments.length === 0) {
        throw new ApplicationError(
          ErrorCode.DB_RECORD_NOT_FOUND,
          'No USPTO documents with OCR text found for this project'
        );
      }

      // Step 2: Use Smart OCR logic to identify key documents
      const smartDocuments = this.identifySmartDocuments(usptoDocuments);
      
      logger.info('[AmendmentContext] Smart document identification results', {
        projectId,
        essentialCount: smartDocuments.essential.length,
        optionalCount: smartDocuments.optional.length,
        essential: smartDocuments.essential.map((doc: any) => ({
          id: doc.id,
          fileName: doc.fileName,
          usptoDocumentCode: doc.usptoDocumentCode,
        })),
        optional: smartDocuments.optional.map((doc: any) => ({
          id: doc.id,
          fileName: doc.fileName,
          usptoDocumentCode: doc.usptoDocumentCode,
        })),
      });
      
      // Step 3: Create documents map for easy lookup
      const documentsMap = new Map(
        usptoDocuments.map((doc: any) => [doc.id, doc])
      );

      // Step 4: Extract context from smart documents
      const context = await this.buildContextFromDocuments(smartDocuments, documentsMap);

      logger.info('[AmendmentContext] Successfully built amendment context', {
        projectId,
        contextComplete: context.metadata.contextComplete,
        totalDocuments: context.metadata.totalDocuments,
        ocrDocuments: context.metadata.ocrDocuments,
        missingDocs: context.metadata.missingDocuments,
      });

      return context;

    } catch (error) {
      logger.error('[AmendmentContext] Failed to build amendment context', {
        projectId,
        tenantId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Extract document code from filename when usptoDocumentCode is null
   * Handles patterns like: "USPTO_CTNF_07-01-2025_MCJP46SL182X243.pdf"
   */
  private static extractDocumentCodeFromFilename(fileName: string): string | null {
    const match = fileName.match(/USPTO_([A-Z\.]+)_/);
    return match ? match[1] : null;
  }

  /**
   * Get document code from database field or extract from filename as fallback
   */
  private static getDocumentCode(doc: any): string | null {
    return doc.usptoDocumentCode || this.extractDocumentCodeFromFilename(doc.fileName);
  }

  /**
   * Identify smart documents from database records
   * (Latest OA, Current Claims, Last Response, Specification, Optional docs)
   */
  private static identifySmartDocuments(usptoDocuments: any[]) {
    // Log all available document codes for debugging
    const allDocCodes = usptoDocuments.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      usptoDocumentCode: doc.usptoDocumentCode,
      extractedCode: this.extractDocumentCodeFromFilename(doc.fileName),
      finalCode: this.getDocumentCode(doc),
      usptoMailDate: doc.usptoMailDate,
      createdAt: doc.createdAt,
      createdAtType: typeof doc.createdAt,
      createdAtStringified: JSON.stringify(doc.createdAt),
      hasOcrText: !!doc.ocrText,
    }));
    
    logger.info('[AmendmentContext] All available document codes', {
      totalDocs: usptoDocuments.length,
      documentCodes: allDocCodes,
      uniqueCodes: [...new Set(usptoDocuments.map(doc => this.getDocumentCode(doc)))],
    });

    // Helper to safely parse dates
    const getValidDate = (doc: any): Date => {
      // Try usptoMailDate first
      if (doc.usptoMailDate) {
        const mailDate = new Date(doc.usptoMailDate);
        if (!isNaN(mailDate.getTime())) {
          return mailDate;
        }
      }
      
      // Try createdAt as fallback
      if (doc.createdAt) {
        const createdDate = new Date(doc.createdAt);
        if (!isNaN(createdDate.getTime())) {
          return createdDate;
        }
      }
      
      // Last resort: use current date
      logger.warn('[AmendmentContext] Invalid dates found, using current date as fallback', {
        docId: doc.id,
        fileName: doc.fileName,
        usptoMailDate: doc.usptoMailDate,
        createdAt: doc.createdAt,
      });
      return new Date();
    };

    // Find the latest office action (CTNF, CTFR, CTAV, MCTNF, MCTFR)
    const latestOfficeAction = usptoDocuments
      .filter(doc => ['CTNF', 'CTFR', 'CTAV', 'MCTNF', 'MCTFR'].includes(this.getDocumentCode(doc) || ''))
      .sort((a, b) => {
        const dateA = getValidDate(a);
        const dateB = getValidDate(b);
        return dateB.getTime() - dateA.getTime();
      })[0];

    logger.info('[AmendmentContext] Office action search results', {
      searchCodes: ['CTNF', 'CTFR', 'CTAV', 'MCTNF', 'MCTFR'],
      matchingDocs: usptoDocuments.filter(doc => ['CTNF', 'CTFR', 'CTAV', 'MCTNF', 'MCTFR'].includes(this.getDocumentCode(doc) || '')).length,
      latestOfficeAction: latestOfficeAction ? {
        id: latestOfficeAction.id,
        fileName: latestOfficeAction.fileName,
        code: this.getDocumentCode(latestOfficeAction),
        date: getValidDate(latestOfficeAction).toISOString(),
        usptoMailDate: latestOfficeAction.usptoMailDate,
        createdAt: latestOfficeAction.createdAt,
      } : null,
    });

    if (!latestOfficeAction) {
      logger.warn('[AmendmentContext] No office actions found - trying broader search', {
        availableCodes: usptoDocuments.map(doc => this.getDocumentCode(doc)).filter(Boolean),
      });
      return { essential: [], optional: [] };
    }

    const latestOADate = getValidDate(latestOfficeAction);

    // Helper to find most recent doc of given codes
    const findRecentDoc = (codes: string[], beforeDate?: Date) => {
      const matches = usptoDocuments
        .filter(doc => {
          const docCode = this.getDocumentCode(doc) || '';
          const hasOcr = !!doc.ocrText;
          const docDate = getValidDate(doc);
          const isBeforeDate = !beforeDate || docDate <= beforeDate;
          
          const included = codes.includes(docCode) && hasOcr && isBeforeDate;
          
          logger.debug(`[AmendmentContext] Document filter check`, {
            docId: doc.id,
            fileName: doc.fileName,
            docCode,
            hasOcr,
            docDate: docDate.toISOString(),
            beforeDate: beforeDate?.toISOString(),
            isBeforeDate,
            included,
          });
          
          return included;
        });
      
      logger.info(`[AmendmentContext] Searching for codes ${codes.join(', ')}`, {
        searchCodes: codes,
        beforeDate: beforeDate?.toISOString(),
        matchingDocs: matches.length,
        matches: matches.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          code: this.getDocumentCode(doc),
          date: getValidDate(doc).toISOString(),
        })),
      });
      
      return matches.sort((a, b) => {
        const dateA = getValidDate(a);
        const dateB = getValidDate(b);
        return dateB.getTime() - dateA.getTime();
      })[0];
    };

    // Helper to find largest spec
    const findLargestSpec = () => {
      const specDocs = usptoDocuments
        .filter(doc => this.getDocumentCode(doc) === 'SPEC' && doc.ocrText);
      
      logger.info('[AmendmentContext] Searching for specifications', {
        searchCode: 'SPEC',
        matchingDocs: specDocs.length,
        matches: specDocs.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          code: this.getDocumentCode(doc),
          ocrTextLength: doc.ocrText?.length || 0,
        })),
      });
      
      return specDocs.sort((a, b) => {
        // Try to parse page count from metadata, fallback to text length
        const getPageCount = (doc: any) => {
          try {
            const metadata = JSON.parse(doc.extractedMetadata || '{}');
            return metadata.pageCount || doc.ocrText?.length || 0;
          } catch {
            return doc.ocrText?.length || 0;
          }
        };
        return getPageCount(b) - getPageCount(a);
      })[0];
    };

    // Essential documents for AI amendment drafting
    // NOTE: Temporarily removing date filtering to debug claims issue
    const claims = findRecentDoc(['CLM', 'CLMN']); // Removed date filter
    const lastResponse = findRecentDoc(['REM', 'REM.', 'A...', 'A.NE', 'A.AF', 'AMDT'], latestOADate);
    const specification = findLargestSpec();
    
    const essential = [
      latestOfficeAction, // Latest office action
      claims, // Current claims
      lastResponse, // Last response
      specification, // Specification (largest by pages)
    ].filter(Boolean);

    // Optional but helpful documents
    const examinerSearch = findRecentDoc(['SRNT'], latestOADate);
    const searchStrategy = findRecentDoc(['SRFW', 'SEARCH'], latestOADate);
    const interview = findRecentDoc(['EXIN', 'INT.SUM']); // Removed date filter for testing
    
    const optional = [
      examinerSearch, // Search notes from same OA
      searchStrategy, // Classification notes
      interview, // Interview summary
    ].filter(Boolean);

    logger.info('[AmendmentContext] Final smart document selection', {
      essential: essential.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        code: this.getDocumentCode(doc),
        type: doc === latestOfficeAction ? 'office-action' : 
              doc === claims ? 'claims' : 
              doc === lastResponse ? 'last-response' : 
              doc === specification ? 'specification' : 'unknown',
      })),
      optional: optional.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        code: this.getDocumentCode(doc),
        type: doc === examinerSearch ? 'examiner-search' : 
              doc === searchStrategy ? 'search-strategy' : 
              doc === interview ? 'interview' : 'unknown',
      })),
    });

    return { essential, optional };
  }

  /**
   * Build structured context from identified documents
   */
  private static async buildContextFromDocuments(
    smartDocuments: { essential: any[]; optional: any[] },
    documentsMap: Map<string, any>
  ): Promise<AmendmentContextBundle> {
    const { essential, optional } = smartDocuments;
    const allDocs = [...essential, ...optional];

    // Helper to safely parse dates (same as in identifySmartDocuments)
    const getValidDate = (doc: any): Date => {
      // Try usptoMailDate first
      if (doc.usptoMailDate) {
        const mailDate = new Date(doc.usptoMailDate);
        if (!isNaN(mailDate.getTime())) {
          return mailDate;
        }
      }
      
      // Try createdAt as fallback
      if (doc.createdAt) {
        const createdDate = new Date(doc.createdAt);
        if (!isNaN(createdDate.getTime())) {
          return createdDate;
        }
      }
      
      // Last resort: use current date
      return new Date();
    };

    // Helper to extract document data
    const extractDocData = (dbDoc: any) => {
      if (!dbDoc || !dbDoc.ocrText) {
        return null;
      }

      // Try to get page count from metadata
      let pageCount;
      try {
        const metadata = JSON.parse(dbDoc.extractedMetadata || '{}');
        pageCount = metadata.pageCount;
      } catch {
        pageCount = undefined;
      }

      return {
        docCode: this.getDocumentCode(dbDoc) || 'UNKNOWN',
        date: getValidDate(dbDoc),
        text: dbDoc.ocrText,
        pageCount,
        fileName: dbDoc.fileName,
      };
    };

    // Map documents to context structure
    let officeAction = null;
    let claims = null;
    let lastResponse = null;
    let specification = null;
    let examinerSearch = null;
    let searchStrategy = null;
    let interview = null;

    for (const doc of allDocs) {
      const docData = extractDocData(doc);
      if (!docData) continue;

      // Categorize by document type
      const docCode = this.getDocumentCode(doc) || '';
      if (['CTNF', 'CTFR', 'CTAV', 'MCTNF', 'MCTFR'].includes(docCode)) {
        officeAction = docData;
      } else if (['CLM', 'CLMN'].includes(docCode)) {
        claims = docData;
      } else if (['REM', 'REM.', 'A...', 'A.NE', 'A.AF', 'AMDT'].includes(docCode)) {
        lastResponse = docData;
      } else if (docCode === 'SPEC') {
        specification = docData;
      } else if (docCode === 'SRNT') {
        examinerSearch = docData;
      } else if (['SRFW', 'SEARCH'].includes(docCode)) {
        searchStrategy = docData;
      } else if (['EXIN', 'INT.SUM'].includes(docCode)) {
        interview = docData;
      }
    }

    // Calculate metadata
    const missingDocuments = [];
    if (!officeAction) missingDocuments.push('Office Action');
    if (!claims) missingDocuments.push('Claims');
    if (!specification) missingDocuments.push('Specification');
    
    const ocrDocuments = [officeAction, claims, lastResponse, specification, examinerSearch, searchStrategy, interview]
      .filter(Boolean).length;

    return {
      officeAction,
      claims,
      lastResponse,
      specification,
      extras: {
        examinerSearch,
        searchStrategy,
        interview,
      },
      metadata: {
        contextComplete: missingDocuments.length === 0,
        missingDocuments,
        totalDocuments: allDocs.length,
        ocrDocuments,
      },
    };
  }

  /**
   * Generate AI prompt context from the bundle
   * 
   * @param bundle - The amendment context bundle
   * @returns Formatted context string for AI prompts
   */
  static generateAIPromptContext(bundle: AmendmentContextBundle): string {
    let context = `# Amendment Context for AI Analysis\n\n`;

    if (bundle.officeAction) {
      context += `## Latest Office Action (${bundle.officeAction.docCode})\n`;
      context += `**Date:** ${bundle.officeAction.date.toLocaleDateString()}\n`;
      context += `**Pages:** ${bundle.officeAction.pageCount || 'Unknown'}\n\n`;
      context += `**Content:**\n${bundle.officeAction.text}\n\n`;
    }

    if (bundle.claims) {
      context += `## Current Claims (${bundle.claims.docCode})\n`;
      context += `**Date:** ${bundle.claims.date.toLocaleDateString()}\n\n`;
      context += `**Content:**\n${bundle.claims.text}\n\n`;
    }

    if (bundle.lastResponse) {
      context += `## Last Response (${bundle.lastResponse.docCode})\n`;
      context += `**Date:** ${bundle.lastResponse.date.toLocaleDateString()}\n\n`;
      context += `**Content:**\n${bundle.lastResponse.text}\n\n`;
    }

    if (bundle.specification) {
      context += `## Specification (${bundle.specification.docCode})\n`;
      context += `**Date:** ${bundle.specification.date.toLocaleDateString()}\n`;
      context += `**Pages:** ${bundle.specification.pageCount || 'Unknown'}\n\n`;
      context += `**Content:**\n${bundle.specification.text}\n\n`;
    }

    // Add optional documents
    if (bundle.extras.examinerSearch) {
      context += `## Examiner Search Notes\n`;
      context += `**Date:** ${bundle.extras.examinerSearch.date.toLocaleDateString()}\n\n`;
      context += `**Content:**\n${bundle.extras.examinerSearch.text}\n\n`;
    }

    if (bundle.extras.interview) {
      context += `## Interview Summary\n`;
      context += `**Date:** ${bundle.extras.interview.date.toLocaleDateString()}\n\n`;
      context += `**Content:**\n${bundle.extras.interview.text}\n\n`;
    }

    context += `## Context Metadata\n`;
    context += `- **Total Documents:** ${bundle.metadata.totalDocuments}\n`;
    context += `- **OCR'd Documents:** ${bundle.metadata.ocrDocuments}\n`;
    context += `- **Context Complete:** ${bundle.metadata.contextComplete ? 'Yes' : 'No'}\n`;
    if (bundle.metadata.missingDocuments.length > 0) {
      context += `- **Missing:** ${bundle.metadata.missingDocuments.join(', ')}\n`;
    }

    return context;
  }
} 