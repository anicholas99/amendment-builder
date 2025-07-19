/**
 * USPTO Prosecution History Service
 * 
 * Service for fetching complete prosecution history from USPTO
 * including all documents, not just Office Actions
 */

import { logger } from '@/server/logger';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { 
  getApplicationDocuments, 
  getApplicationData,
  getDocumentDownloadUrl 
} from '../client';
import { USPTODocument } from '../types';

export interface ProsecutionDocument extends USPTODocument {
  category: 'office-action' | 'response' | 'claims' | 'citations' | 'examiner-notes' | 'interview' | 'notice' | 'other';
  importance: 'core' | 'optional' | 'low';
  isDownloadable: boolean;
  purpose?: string;
}

export interface ProsecutionHistory {
  applicationNumber: string;
  applicationData?: {
    title: string;
    filingDate?: string;
    patentNumber?: string;
    issueDate?: string;
    examinerName?: string;
    artUnit?: string;
    status: string;
    inventorName?: string[];
    applicantName?: string;
    attorneyDocketNumber?: string;
  };
  documents: ProsecutionDocument[];
  statistics: {
    totalDocuments: number;
    coreDocuments: number;
    officeActions: number;
    responses: number;
    claims: number;
    citations: number;
    examinerNotes: number;
    interviews: number;
    notices: number;
    other: number;
  };
  timeline?: any[]; // Optional timeline field
}

// Core document codes for amendment drafting
const CORE_DOCUMENT_CODES = new Set([
  // Office Actions
  'CTNF', 'CTFR', 'CTAV', 'OA.APPENDIX',
  // Applicant Responses
  'REM', 'REM.', 'A...', 'A.NE', 'A.NE.AFCP', 'AMDT',
  // Claims
  'CLM',
  // Citations
  '892', '1449', 'IDS', 'IDS.', 'IDSB',
  // Examiner Notes
  'SRNT', 'SRFW',
  // Interviews
  'EXIN', 'INT.SUM'
]);

// Document categorization and importance
const categorizeDocument = (documentCode: string): { 
  category: ProsecutionDocument['category'], 
  importance: ProsecutionDocument['importance'],
  purpose?: string 
} => {
  // Office Actions
  if (['CTNF', 'CTFR', 'CTAV', 'OA.APPENDIX', 'CTRS', 'CTEL', 'EXAN', 'MCTNF', 'MCTFR'].includes(documentCode)) {
    return {
      category: 'office-action',
      importance: CORE_DOCUMENT_CODES.has(documentCode) ? 'core' : 'optional',
      purpose: 'Core input for AI: rejection reasons, 102/103 mapping'
    };
  }
  
  // Responses and amendments
  if (['A...', 'A.AF', 'A.NE', 'A.NE.AFCP', 'AMDT', 'REM', 'REM.', 'RCEX', 'SPEC'].includes(documentCode)) {
    return {
      category: 'response',
      importance: CORE_DOCUMENT_CODES.has(documentCode) ? 'core' : 'optional',
      purpose: 'Show prior arguments to avoid repetition'
    };
  }
  
  // Claims
  if (['CLM', 'CLMN'].includes(documentCode)) {
    return {
      category: 'claims',
      importance: 'core',
      purpose: 'Generate editable claim diff view'
    };
  }
  
  // Citations
  if (['892', '1449', 'IDS', 'IDS.', 'IDSB', 'NPL', 'FOR', 'FWCLM'].includes(documentCode)) {
    return {
      category: 'citations',
      importance: CORE_DOCUMENT_CODES.has(documentCode) ? 'core' : 'optional',
      purpose: 'Feed CitationExtractor and validate examiner analysis'
    };
  }
  
  // Examiner Notes
  if (['SRNT', 'SRFW', 'SEARCH', 'SCORE'].includes(documentCode)) {
    return {
      category: 'examiner-notes',
      importance: CORE_DOCUMENT_CODES.has(documentCode) ? 'core' : 'optional',
      purpose: 'Audit rejection quality'
    };
  }
  
  // Interviews
  if (['EXIN', 'INT.SUM', 'APPIN'].includes(documentCode)) {
    return {
      category: 'interview',
      importance: 'optional',
      purpose: 'Show applicant interaction tone/history'
    };
  }
  
  // Notices
  if (['NOA', 'N271', 'N561', 'WFEE', 'NFEE', 'ISSUE.NTF'].includes(documentCode)) {
    return {
      category: 'notice',
      importance: 'low'
    };
  }
  
  return {
    category: 'other',
    importance: 'low'
  };
};

/**
 * Fetch complete prosecution history for an application
 */
export const fetchProsecutionHistory = async (
  applicationNumber: string
): Promise<ProsecutionHistory> => {
  try {
    logger.info('Fetching USPTO prosecution history', { 
      applicationNumber,
      hasApiKey: !!environment.uspto.apiKey,
      apiKeyLength: environment.uspto.apiKey?.length || 0,
      usptoConfig: {
        apiUrl: environment.uspto.apiUrl,
        hasKey: !!environment.uspto.apiKey
      }
    });

    // Fetch application data and documents in parallel
    const [appDataResult, documentsResult] = await Promise.allSettled([
      getApplicationData(applicationNumber),
      getApplicationDocuments(applicationNumber),
    ]);

    // Handle application data
    let applicationData;
    if (appDataResult.status === 'fulfilled') {
      applicationData = {
        title: appDataResult.value.title,
        filingDate: appDataResult.value.filingDate,
        patentNumber: appDataResult.value.patentNumber,
        issueDate: appDataResult.value.issueDate,
        examinerName: appDataResult.value.examinerName,
        artUnit: appDataResult.value.artUnit,
        status: appDataResult.value.status,
        inventorName: appDataResult.value.inventorName,
        applicantName: appDataResult.value.applicantName,
        attorneyDocketNumber: appDataResult.value.attorneyDocketNumber,
      };
    } else {
      logger.warn('Failed to fetch application data', {
        applicationNumber,
        error: appDataResult.reason,
      });
    }

    // Handle documents
    if (documentsResult.status === 'rejected') {
      throw documentsResult.reason;
    }

    const documents = documentsResult.value || [];
    
    // Categorize and enhance documents
    const prosecutionDocuments: ProsecutionDocument[] = documents.map(doc => {
      const categorization = categorizeDocument(doc.documentCode);
      return {
        ...doc,
        // Map new API fields to expected fields
        description: doc.documentCodeDescriptionText || doc.description || doc.documentCode,
        documentId: doc.documentIdentifier || doc.documentId || doc.documentCode, // Use documentCode as fallback
        mailDate: doc.officialDate || doc.mailDate || new Date().toISOString(), // Default to now if no date
        ...categorization,
        isDownloadable: !!doc.downloadOptionBag && doc.downloadOptionBag.length > 0,
      } as ProsecutionDocument;
    });

    // Sort by mail date (most recent first)
    prosecutionDocuments.sort((a, b) => {
      const dateA = a.mailDate || a.officialDate || '';
      const dateB = b.mailDate || b.officialDate || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Calculate statistics
    const statistics = prosecutionDocuments.reduce(
      (stats, doc) => {
        stats.totalDocuments++;
        if (doc.importance === 'core') {
          stats.coreDocuments++;
        }
        switch (doc.category) {
          case 'office-action':
            stats.officeActions++;
            break;
          case 'response':
            stats.responses++;
            break;
          case 'claims':
            stats.claims++;
            break;
          case 'citations':
            stats.citations++;
            break;
          case 'examiner-notes':
            stats.examinerNotes++;
            break;
          case 'interview':
            stats.interviews++;
            break;
          case 'notice':
            stats.notices++;
            break;
          default:
            stats.other++;
        }
        return stats;
      },
      {
        totalDocuments: 0,
        coreDocuments: 0,
        officeActions: 0,
        responses: 0,
        claims: 0,
        citations: 0,
        examinerNotes: 0,
        interviews: 0,
        notices: 0,
        other: 0,
      }
    );

    logger.info('USPTO prosecution history fetched successfully', {
      applicationNumber,
      statistics,
    });

    return {
      applicationNumber,
      applicationData: applicationData || null, // Ensure null instead of undefined
      documents: prosecutionDocuments,
      statistics,
    };
  } catch (error) {
    logger.error('Failed to fetch USPTO prosecution history', {
      applicationNumber,
      error: error instanceof Error ? error : undefined,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.API_NETWORK_ERROR,
      `Failed to fetch prosecution history: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Get core documents only (for focused amendment drafting)
 */
export const getCoreDocuments = (history: ProsecutionHistory): ProsecutionDocument[] => {
  return history.documents.filter(doc => doc.importance === 'core');
};

/**
 * Get most recent office action and response pair
 */
export const getMostRecentExchange = (history: ProsecutionHistory) => {
  const sortedDocs = [...history.documents].sort((a, b) => {
    const dateA = a.mailDate || a.officialDate || '';
    const dateB = b.mailDate || b.officialDate || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const recentOfficeAction = sortedDocs.find(doc => doc.category === 'office-action');
  const recentResponse = sortedDocs.find(doc => 
    doc.category === 'response' && 
    recentOfficeAction && 
    new Date(doc.mailDate) > new Date(recentOfficeAction.mailDate)
  );
  const recentClaims = sortedDocs.find(doc => doc.category === 'claims');

  return {
    officeAction: recentOfficeAction,
    response: recentResponse,
    claims: recentClaims,
  };
};

/**
 * Get timeline events from prosecution history
 */
export const getProsecutionTimeline = (history: ProsecutionHistory) => {
  const events = history.documents.map(doc => ({
    date: new Date(doc.mailDate || doc.officialDate || ''),
    type: doc.category,
    title: doc.description || doc.documentCodeDescriptionText || doc.documentCode,
    documentCode: doc.documentCode,
    documentId: doc.documentId || doc.documentIdentifier || '',
    importance: doc.importance,
    purpose: doc.purpose,
  }));

  // Add filing date if available
  if (history.applicationData?.filingDate) {
    events.push({
      date: new Date(history.applicationData.filingDate),
      type: 'other' as const,
      title: 'Application Filed',
      documentCode: 'FILING',
      documentId: '',
      importance: 'optional' as const,
      purpose: undefined,
    });
  }

  // Add issue date if available
  if (history.applicationData?.issueDate) {
    events.push({
      date: new Date(history.applicationData.issueDate),
      type: 'notice' as const,
      title: 'Patent Issued',
      documentCode: 'ISSUE',
      documentId: '',
      importance: 'optional' as const,
      purpose: undefined,
    });
  }

  // Sort chronologically
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
};