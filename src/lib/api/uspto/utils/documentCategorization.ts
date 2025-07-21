/**
 * USPTO Document Categorization Utilities
 * 
 * Provides functions to categorize USPTO documents by importance and type
 * for the simplified ProjectDocument-based approach.
 */

// Essential document codes for AI amendment drafting
export const ESSENTIAL_DOCUMENT_CODES = {
  // Office Actions - Primary rejection documents
  OFFICE_ACTIONS: ['CTNF', 'CTFR', 'CTAV', 'MCTNF', 'MCTFR'],
  
  // Claims - Current claim set
  CLAIMS: ['CLM', 'CLMN'],
  
  // Applicant Responses - Previous arguments
  RESPONSES: ['REM', 'REM.', 'A...', 'A.NE', 'A.AF', 'AMDT'],
  
  // Specification - Support basis
  SPECIFICATION: ['SPEC'],
  
  // Optional but recommended
  SEARCH_NOTES: ['SRNT', 'SRFW', 'SEARCH'],
  INTERVIEWS: ['EXIN', 'INT.SUM', 'APPIN'],
  CITATIONS: ['892', '1449', 'IDS', 'IDS.', 'IDSB'],
};

export type DocumentCategory = 
  | 'office-action' 
  | 'response' 
  | 'claims' 
  | 'specification' 
  | 'search-notes'
  | 'interview'
  | 'citations'
  | 'notice'
  | 'other';

export type DocumentImportance = 'core' | 'optional' | 'low';

interface CategorizedDocument {
  category: DocumentCategory;
  importance: DocumentImportance;
  isEssential: boolean;
  purpose?: string;
}

/**
 * Determine if a document is essential for AI processing
 */
export function isEssentialDocument(documentCode: string): boolean {
  if (!documentCode) return false;
  
  const allEssentialCodes = [
    ...ESSENTIAL_DOCUMENT_CODES.OFFICE_ACTIONS,
    ...ESSENTIAL_DOCUMENT_CODES.CLAIMS,
    ...ESSENTIAL_DOCUMENT_CODES.RESPONSES,
    ...ESSENTIAL_DOCUMENT_CODES.SPECIFICATION,
    ...ESSENTIAL_DOCUMENT_CODES.SEARCH_NOTES,
    ...ESSENTIAL_DOCUMENT_CODES.INTERVIEWS,
  ];
  
  return allEssentialCodes.includes(documentCode);
}

/**
 * Categorize a USPTO document by its code
 */
export function categorizeDocument(documentCode: string): CategorizedDocument {
  // Office Actions
  if (ESSENTIAL_DOCUMENT_CODES.OFFICE_ACTIONS.includes(documentCode)) {
    return {
      category: 'office-action',
      importance: 'core',
      isEssential: true,
      purpose: 'Primary rejection content for AI analysis'
    };
  }
  
  // Claims
  if (ESSENTIAL_DOCUMENT_CODES.CLAIMS.includes(documentCode)) {
    return {
      category: 'claims',
      importance: 'core',
      isEssential: true,
      purpose: 'Current claim set for amendment comparison'
    };
  }
  
  // Responses
  if (ESSENTIAL_DOCUMENT_CODES.RESPONSES.includes(documentCode)) {
    return {
      category: 'response',
      importance: 'core',
      isEssential: true,
      purpose: 'Prior arguments to avoid repetition'
    };
  }
  
  // Specification
  if (ESSENTIAL_DOCUMENT_CODES.SPECIFICATION.includes(documentCode)) {
    return {
      category: 'specification',
      importance: 'core',
      isEssential: true,
      purpose: 'Support basis to prevent new matter rejections'
    };
  }
  
  // Search Notes
  if (ESSENTIAL_DOCUMENT_CODES.SEARCH_NOTES.includes(documentCode)) {
    return {
      category: 'search-notes',
      importance: 'optional',
      isEssential: true,
      purpose: 'Examiner search strategy and reasoning'
    };
  }
  
  // Interviews
  if (ESSENTIAL_DOCUMENT_CODES.INTERVIEWS.includes(documentCode)) {
    return {
      category: 'interview',
      importance: 'optional',
      isEssential: true,
      purpose: 'Examiner discussions and agreements'
    };
  }
  
  // Citations
  if (ESSENTIAL_DOCUMENT_CODES.CITATIONS.includes(documentCode)) {
    return {
      category: 'citations',
      importance: 'optional',
      isEssential: false,
      purpose: 'Prior art references'
    };
  }
  
  // Notices
  if (['NOA', 'N271', 'N561', 'WFEE', 'NFEE', 'ISSUE.NTF'].includes(documentCode)) {
    return {
      category: 'notice',
      importance: 'low',
      isEssential: false
    };
  }
  
  // Everything else
  return {
    category: 'other',
    importance: 'low',
    isEssential: false
  };
}

/**
 * Get display name for document code
 */
export function getDocumentDisplayName(documentCode: string): string {
  const displayNames: Record<string, string> = {
    // Office Actions
    'CTNF': 'Non-Final Rejection',
    'CTFR': 'Final Rejection',
    'CTAV': 'Advisory Action',
    'MCTNF': 'Miscellaneous Non-Final',
    'MCTFR': 'Miscellaneous Final',
    
    // Claims
    'CLM': 'Claims',
    'CLMN': 'Claim Amendments',
    
    // Responses
    'REM': 'Remarks',
    'REM.': 'Remarks (Continued)',
    'A...': 'Amendment',
    'A.NE': 'Amendment (Non-Entry)',
    'A.AF': 'Amendment After Final',
    'AMDT': 'Amendment',
    
    // Specification
    'SPEC': 'Specification',
    
    // Search
    'SRNT': 'Search Notes',
    'SRFW': 'Search Strategy',
    'SEARCH': 'Search Report',
    
    // Interviews
    'EXIN': 'Examiner Interview Summary',
    'INT.SUM': 'Interview Summary',
    'APPIN': 'Applicant Interview Summary',
    
    // Citations
    '892': 'PTO-892 Citations',
    '1449': 'IDS Citations',
    'IDS': 'Information Disclosure Statement',
    'IDS.': 'IDS (Continued)',
    'IDSB': 'IDS Bibliography',
    
    // Common notices
    'NOA': 'Notice of Allowance',
    'N271': 'Notice of Appeal',
    'WFEE': 'Fee Notice',
    'ISSUE.NTF': 'Issue Notification',
  };
  
  return displayNames[documentCode] || documentCode;
}

/**
 * Determine which essential documents to select from a list
 * Returns the most recent of each essential type
 */
export function selectEssentialDocuments(documents: Array<{
  documentCode: string;
  mailDate?: string;
  pageCount?: number;
}>): Record<string, typeof documents[0] | undefined> {
  // Sort by date (most recent first)
  const sortedDocs = [...documents].sort((a, b) => {
    const dateA = a.mailDate ? new Date(a.mailDate).getTime() : 0;
    const dateB = b.mailDate ? new Date(b.mailDate).getTime() : 0;
    return dateB - dateA;
  });
  
  // Find latest of each type
  const officeAction = sortedDocs.find(doc => 
    ESSENTIAL_DOCUMENT_CODES.OFFICE_ACTIONS.includes(doc.documentCode)
  );
  
  const claims = sortedDocs.find(doc => 
    ESSENTIAL_DOCUMENT_CODES.CLAIMS.includes(doc.documentCode)
  );
  
  // For specification, prefer the one with most pages
  const specifications = sortedDocs.filter(doc => 
    ESSENTIAL_DOCUMENT_CODES.SPECIFICATION.includes(doc.documentCode)
  );
  const specification = specifications.length > 0
    ? specifications.sort((a, b) => (b.pageCount || 0) - (a.pageCount || 0))[0]
    : undefined;
  
  // Last response should be before the office action date
  let lastResponse;
  if (officeAction?.mailDate) {
    const oaDate = new Date(officeAction.mailDate).getTime();
    lastResponse = sortedDocs.find(doc => 
      ESSENTIAL_DOCUMENT_CODES.RESPONSES.includes(doc.documentCode) &&
      doc.mailDate && new Date(doc.mailDate).getTime() < oaDate
    );
  } else {
    lastResponse = sortedDocs.find(doc => 
      ESSENTIAL_DOCUMENT_CODES.RESPONSES.includes(doc.documentCode)
    );
  }
  
  const searchNotes = sortedDocs.find(doc => 
    ESSENTIAL_DOCUMENT_CODES.SEARCH_NOTES.includes(doc.documentCode)
  );
  
  const interview = sortedDocs.find(doc => 
    ESSENTIAL_DOCUMENT_CODES.INTERVIEWS.includes(doc.documentCode)
  );
  
  return {
    officeAction,
    claims,
    specification,
    lastResponse,
    searchNotes,
    interview,
  };
}