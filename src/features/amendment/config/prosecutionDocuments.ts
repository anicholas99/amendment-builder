/**
 * USPTO Document Configuration
 * 
 * Defines which USPTO documents belong on the timeline (milestones) 
 * vs the files drawer (supporting documents)
 */

export interface DocumentConfig {
  documentCode: string;
  label: string;
  shortLabel: string;
  isTimeline: boolean;
  category: 'office-action' | 'response' | 'notice' | 'petition' | 'interview' | 'support';
  icon?: string;
  description?: string;
}

// Timeline milestone documents - these change prosecution posture
export const TIMELINE_DOCUMENT_CODES = new Set([
  // Application filing
  'SPEC', // Specification/Application Filed
  'APP.FILE.REC', // Application Filing Receipt
  'TRNA', // Patent Application Published
  'FILING', // Application Filing
  'APPLICATION', // Application Filed
  'FILED', // Filed
  'SPECIFICATION', // Specification
  
  // Office action nodes
  'CTNF', // Non-Final Office Action
  'CTFR', // Final Office Action
  'CTAV', // Advisory Action
  'CTNR', // Restriction Requirement
  'CTRS', // Election/Restriction Response
  
  // Applicant responses & amendments
  'REM', // Remarks
  'A...', // Amendment
  'AMSB', // Amendment/Submission
  'A.NE', // Amendment after Non-Final
  'RESP.FINAL', // Response After Final
  
  // RCE filings
  'RCEX', // RCE Filed
  'RCE', // Request for Continued Examination
  
  // IDS and Prior Art
  'IDS', // Information Disclosure Statement
  'R561', // IDS Receipt
  
  // Extensions
  'XT/', // Extension of Time
  'EXT.', // Extension
  'PETXT', // Petition for Extension
  
  // Petition decisions
  'PET.DEC.TC', // Petition Decision
  'PETDEC', // Petition Decision
  
  // Notices
  'NOA', // Notice of Allowance
  'ISSUE.NTF', // Issue Notification
  'N271', // Notice to File Missing Parts
  
  // Other significant events
  'ABN', // Abandonment
  'EXIN', // Examiner Interview
  'NRES', // Notice of Non-Responsive Amendment
  'NTCN', // Notice of Continuation
]);

// Mapping of document codes to timeline display configuration
export const DOCUMENT_DISPLAY_CONFIG: Record<string, DocumentConfig> = {
  // Office Actions - Timeline
  'CTNF': {
    documentCode: 'CTNF',
    label: 'Non-Final Office Action',
    shortLabel: 'Non-Final OA',
    isTimeline: true,
    category: 'office-action',
    description: 'Examiner rejections requiring response'
  },
  'CTFR': {
    documentCode: 'CTFR',
    label: 'Final Office Action',
    shortLabel: 'Final OA',
    isTimeline: true,
    category: 'office-action',
    description: 'Final rejection - limited response options'
  },
  'CTAV': {
    documentCode: 'CTAV',
    label: 'Advisory Action',
    shortLabel: 'Advisory',
    isTimeline: true,
    category: 'office-action',
    description: 'Examiner response to after-final submission'
  },
  
  // Responses - Timeline
  'REM': {
    documentCode: 'REM',
    label: 'Applicant Arguments',
    shortLabel: 'Response',
    isTimeline: true,
    category: 'response',
    description: 'Arguments responding to Office Action'
  },
  'A...': {
    documentCode: 'A...',
    label: 'Amendment',
    shortLabel: 'Amendment',
    isTimeline: true,
    category: 'response',
    description: 'Claims and/or specification changes'
  },
  'A.NE': {
    documentCode: 'A.NE',
    label: 'Amendment after Non-Final',
    shortLabel: 'Amendment',
    isTimeline: true,
    category: 'response',
    description: 'Response to non-final rejection'
  },
  'AMSB': {
    documentCode: 'AMSB',
    label: 'Amendment/Submission',
    shortLabel: 'Amendment',
    isTimeline: true,
    category: 'response',
    description: 'Amendment and/or arguments submitted'
  },
  'RCEX': {
    documentCode: 'RCEX',
    label: 'RCE Filed',
    shortLabel: 'RCE',
    isTimeline: true,
    category: 'response',
    description: 'Request to continue examination'
  },
  
  // Notices - Timeline
  'NOA': {
    documentCode: 'NOA',
    label: 'Notice of Allowance',
    shortLabel: 'Allowance',
    isTimeline: true,
    category: 'notice',
    description: 'Application allowed - fees due'
  },
  'ABN': {
    documentCode: 'ABN',
    label: 'Abandonment',
    shortLabel: 'Abandoned',
    isTimeline: true,
    category: 'notice',
    description: 'Application abandoned'
  },
  
  // Interview - Timeline (Optional)
  'EXIN': {
    documentCode: 'EXIN',
    label: 'Examiner Interview',
    shortLabel: 'Interview',
    isTimeline: true,
    category: 'interview',
    description: 'Interview summary with examiner'
  },
  
  // Petition Decisions - Timeline
  'PET.DEC.TC': {
    documentCode: 'PET.DEC.TC',
    label: 'Petition Decision',
    shortLabel: 'Petition',
    isTimeline: true,
    category: 'petition',
    description: 'Decision affecting prosecution'
  },
  
  // Application Filing - Timeline
  'SPEC': {
    documentCode: 'SPEC',
    label: 'Application Filed',
    shortLabel: 'Filed',
    isTimeline: true,
    category: 'notice',
    description: 'Patent application filed'
  },
  'FILING': {
    documentCode: 'FILING',
    label: 'Application Filed',
    shortLabel: 'Filed',
    isTimeline: true,
    category: 'notice',
    description: 'Patent application filed'
  },
  'APPLICATION': {
    documentCode: 'APPLICATION',
    label: 'Application Filed',
    shortLabel: 'Filed',
    isTimeline: true,
    category: 'notice',
    description: 'Patent application filed'
  },
  'FILED': {
    documentCode: 'FILED',
    label: 'Application Filed',
    shortLabel: 'Filed',
    isTimeline: true,
    category: 'notice',
    description: 'Patent application filed'
  },
  'SPECIFICATION': {
    documentCode: 'SPECIFICATION',
    label: 'Application Filed',
    shortLabel: 'Filed',
    isTimeline: true,
    category: 'notice',
    description: 'Patent application filed'
  },
  'APP.FILE.REC': {
    documentCode: 'APP.FILE.REC',
    label: 'Filing Receipt',
    shortLabel: 'Receipt',
    isTimeline: true,
    category: 'notice',
    description: 'Application filing acknowledged'
  },
  'TRNA': {
    documentCode: 'TRNA',
    label: 'Application Published',
    shortLabel: 'Published',
    isTimeline: true,
    category: 'notice',
    description: 'Application made public'
  },
  
  // Restriction/Election - Timeline
  'CTNR': {
    documentCode: 'CTNR',
    label: 'Restriction Requirement',
    shortLabel: 'Restriction',
    isTimeline: true,
    category: 'office-action',
    description: 'Election between inventions required'
  },
  'CTRS': {
    documentCode: 'CTRS',
    label: 'Election Response',
    shortLabel: 'Election',
    isTimeline: true,
    category: 'response',
    description: 'Invention election submitted'
  },
  
  // IDS - Now Timeline
  'IDS': {
    documentCode: 'IDS',
    label: 'Information Disclosure Statement',
    shortLabel: 'IDS',
    isTimeline: true,
    category: 'support',
    description: 'Prior art disclosed to USPTO'
  },
  'R561': {
    documentCode: 'R561',
    label: 'IDS Receipt',
    shortLabel: 'IDS Rcpt',
    isTimeline: true,
    category: 'notice',
    description: 'IDS acknowledged by examiner'
  },
  
  // Extensions - Now Timeline
  'XT/': {
    documentCode: 'XT/',
    label: 'Extension of Time',
    shortLabel: 'Extension',
    isTimeline: true,
    category: 'petition',
    description: 'Deadline extension granted'
  },
  'EXT.': {
    documentCode: 'EXT.',
    label: 'Extension',
    shortLabel: 'Extension',
    isTimeline: true,
    category: 'petition',
    description: 'Extension request'
  },
  'PETXT': {
    documentCode: 'PETXT',
    label: 'Petition for Extension',
    shortLabel: 'Pet. Ext.',
    isTimeline: true,
    category: 'petition',
    description: 'Extension petition filed'
  },
  
  // Additional Responses - Timeline
  'RESP.FINAL': {
    documentCode: 'RESP.FINAL',
    label: 'Response After Final',
    shortLabel: 'After Final',
    isTimeline: true,
    category: 'response',
    description: 'Response to final rejection'
  },
  
  // Additional Notices - Timeline
  'N271': {
    documentCode: 'N271',
    label: 'Notice to File Missing Parts',
    shortLabel: 'Missing Parts',
    isTimeline: true,
    category: 'notice',
    description: 'Application incomplete'
  },
  'NRES': {
    documentCode: 'NRES',
    label: 'Non-Responsive Amendment',
    shortLabel: 'Non-Responsive',
    isTimeline: true,
    category: 'notice',
    description: 'Amendment did not address all issues'
  },
  'NTCN': {
    documentCode: 'NTCN',
    label: 'Continuation Filed',
    shortLabel: 'Continuation',
    isTimeline: true,
    category: 'notice',
    description: 'Continuation application filed'
  },
  
  // Supporting Documents - Drawer
  'OA.POSTCARD': {
    documentCode: 'OA.POSTCARD',
    label: 'Office Action Postcard',
    shortLabel: 'Postcard',
    isTimeline: false,
    category: 'support',
    description: 'Courtesy notification'
  },
  'N417': {
    documentCode: 'N417',
    label: 'EFS Receipt',
    shortLabel: 'Receipt',
    isTimeline: false,
    category: 'support',
    description: 'Electronic filing acknowledgment'
  },
  'WFEE': {
    documentCode: 'WFEE',
    label: 'Fee Worksheet',
    shortLabel: 'Fees',
    isTimeline: false,
    category: 'support',
    description: 'Fee calculation document'
  },
  'SRFW': {
    documentCode: 'SRFW',
    label: 'Search Information',
    shortLabel: 'Search',
    isTimeline: false,
    category: 'support',
    description: 'Examiner search strategy'
  },
  'SRNT': {
    documentCode: 'SRNT',
    label: 'Search Notes',
    shortLabel: 'Notes',
    isTimeline: false,
    category: 'support',
    description: 'Examiner search notes'
  },
  'CLM': {
    documentCode: 'CLM',
    label: 'Claims',
    shortLabel: 'Claims',
    isTimeline: false,
    category: 'support',
    description: 'Claim listing document'
  },
  'PA..': {
    documentCode: 'PA..',
    label: 'Power of Attorney',
    shortLabel: 'POA',
    isTimeline: false,
    category: 'support',
    description: 'Attorney authorization'
  },
  '892': {
    documentCode: '892',
    label: 'Cited References',
    shortLabel: 'References',
    isTimeline: false,
    category: 'support',
    description: 'Examiner cited art'
  },
  'FOR': {
    documentCode: 'FOR',
    label: 'Foreign References',
    shortLabel: 'Foreign',
    isTimeline: false,
    category: 'support',
    description: 'Foreign priority documents'
  },
};

/**
 * Check if a document should appear on the timeline
 */
export function isTimelineDocument(documentCode: string): boolean {
  return TIMELINE_DOCUMENT_CODES.has(documentCode);
}

/**
 * Get display configuration for a document
 */
export function getDocumentDisplayConfig(documentCode: string): DocumentConfig | null {
  return DOCUMENT_DISPLAY_CONFIG[documentCode] || null;
}

/**
 * Get all timeline milestone documents
 */
export function getTimelineDocuments(): DocumentConfig[] {
  return Object.values(DOCUMENT_DISPLAY_CONFIG).filter(doc => doc.isTimeline);
}

/**
 * Get all drawer/supporting documents
 */
export function getDrawerDocuments(): DocumentConfig[] {
  return Object.values(DOCUMENT_DISPLAY_CONFIG).filter(doc => !doc.isTimeline);
}