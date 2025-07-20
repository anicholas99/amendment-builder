/**
 * USPTO Document Code Mapping
 * Maps USPTO document codes to timeline event types for milestone tracking
 */

export enum ProsecutionEventType {
  FILED = 'FILED',
  NON_FINAL_OA = 'NON_FINAL_OA',
  FINAL_OA = 'FINAL_OA',
  ADVISORY_ACTION = 'ADVISORY_ACTION',
  RCE_FILED = 'RCE_FILED',
  RESPONSE_FILED = 'RESPONSE_FILED',
  IDS_FILED = 'IDS_FILED',
  INTERVIEW = 'INTERVIEW',
  NOTICE_OF_ALLOWANCE = 'NOTICE_OF_ALLOWANCE',
  ABANDONMENT = 'ABANDONMENT',
  CONTINUATION = 'CONTINUATION',
}

// Document codes that should appear on the timeline
export const TIMELINE_DOCUMENT_CODES: Record<string, ProsecutionEventType> = {
  // Filing events
  'TRNA': ProsecutionEventType.FILED,
  'APP.FILE.REC': ProsecutionEventType.FILED,
  'APP.FILE.REC*': ProsecutionEventType.FILED,
  'ADS': ProsecutionEventType.FILED,
  'SPEC': ProsecutionEventType.FILED,
  
  // Office Actions
  'CTNF': ProsecutionEventType.NON_FINAL_OA,
  'CTSP': ProsecutionEventType.NON_FINAL_OA, // Special case non-final
  'CTFR': ProsecutionEventType.FINAL_OA,
  'CTAV': ProsecutionEventType.ADVISORY_ACTION,
  
  // RCE
  'RCEX': ProsecutionEventType.RCE_FILED,
  
  // Responses
  'A': ProsecutionEventType.RESPONSE_FILED,
  'A.NE': ProsecutionEventType.RESPONSE_FILED,
  'A.NE.AFCP': ProsecutionEventType.RESPONSE_FILED,
  'AMSB': ProsecutionEventType.RESPONSE_FILED,
  'CLM': ProsecutionEventType.RESPONSE_FILED,
  'REM': ProsecutionEventType.RESPONSE_FILED,
  
  // IDS
  'IDS': ProsecutionEventType.IDS_FILED,
  '892': ProsecutionEventType.IDS_FILED,
  
  // Interview
  'EXIN': ProsecutionEventType.INTERVIEW,
  
  // Notice of Allowance
  'NOA': ProsecutionEventType.NOTICE_OF_ALLOWANCE,
  
  // Abandonment
  'ABN': ProsecutionEventType.ABANDONMENT,
  'WFEE': ProsecutionEventType.ABANDONMENT,
  
  // Continuation/Divisional
  'NTCN': ProsecutionEventType.CONTINUATION,
  'PTAS': ProsecutionEventType.CONTINUATION,
};

/**
 * Determines if a document code represents a timeline milestone
 */
export function isTimelineMilestone(documentCode: string): boolean {
  return documentCode in TIMELINE_DOCUMENT_CODES;
}

/**
 * Gets the event type for a document code
 */
export function getEventType(documentCode: string): ProsecutionEventType | undefined {
  return TIMELINE_DOCUMENT_CODES[documentCode];
}

/**
 * Document categories for grouping in the files drawer
 */
export enum DocumentCategory {
  OFFICE_ACTION = 'office-action',
  RESPONSE = 'response',
  FILING = 'filing',
  CORRESPONDENCE = 'correspondence',
  FEE = 'fee',
  SEARCH = 'search',
  OTHER = 'other',
}

/**
 * Maps document codes to categories for file drawer organization
 */
export function getDocumentCategory(documentCode: string): DocumentCategory {
  // Office action related
  if (['CTNF', 'CTFR', 'CTAV', 'CTSP', 'MCTNF'].includes(documentCode)) {
    return DocumentCategory.OFFICE_ACTION;
  }
  
  // Response related
  if (['A', 'A.NE', 'A.NE.AFCP', 'AMSB', 'CLM', 'REM', 'RSPN'].includes(documentCode)) {
    return DocumentCategory.RESPONSE;
  }
  
  // Filing related
  if (['TRNA', 'APP.FILE.REC', 'ADS', 'SPEC', 'OATH', 'FOR'].includes(documentCode)) {
    return DocumentCategory.FILING;
  }
  
  // Fee related
  if (documentCode.startsWith('WFEE') || documentCode.startsWith('N417')) {
    return DocumentCategory.FEE;
  }
  
  // Search/examination
  if (['SRFW', 'SRNT', '892'].includes(documentCode)) {
    return DocumentCategory.SEARCH;
  }
  
  // Extension of time
  if (documentCode.startsWith('XT/') || documentCode.startsWith('ET/')) {
    return DocumentCategory.CORRESPONDENCE;
  }
  
  return DocumentCategory.OTHER;
}