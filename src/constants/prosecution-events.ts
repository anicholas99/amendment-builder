/**
 * Prosecution Event Types and USPTO Document Code Mapping
 * 
 * Single source of truth for prosecution timeline events and document codes.
 * Consolidates event types and mappings used across the application.
 */

/**
 * Prosecution Event Types for Timeline
 * Only milestone events that affect prosecution strategy or deadlines
 */
export enum ProsecutionEventType {
  // Filing events
  APPLICATION_FILED = 'APPLICATION_FILED',
  CONTINUATION_FILED = 'CONTINUATION_FILED',
  
  // Office Actions - triggers amendment workflow
  NON_FINAL_OA = 'NON_FINAL_OA',
  FINAL_OA = 'FINAL_OA', // 3-month statutory clock
  ADVISORY_ACTION = 'ADVISORY_ACTION',
  
  // Responses - shows when claims were filed
  RESPONSE_FILED = 'RESPONSE_FILED',
  RCE_FILED = 'RCE_FILED',
  
  // Other milestones
  IDS_FILED = 'IDS_FILED', // May restart PTA clock
  INTERVIEW_CONDUCTED = 'INTERVIEW_CONDUCTED',
  NOTICE_OF_ALLOWANCE = 'NOTICE_OF_ALLOWANCE',
  ABANDONMENT = 'ABANDONMENT',
}

/**
 * Maps USPTO document codes to timeline event types
 * Only includes documents that represent prosecution milestones
 */
export const TIMELINE_DOCUMENT_CODES: Record<string, ProsecutionEventType> = {
  // Filing events
  'TRNA': ProsecutionEventType.APPLICATION_FILED,
  'APP.FILE.REC': ProsecutionEventType.APPLICATION_FILED,
  'APP.FILE.REC*': ProsecutionEventType.APPLICATION_FILED,
  'ADS': ProsecutionEventType.APPLICATION_FILED,
  'SPEC': ProsecutionEventType.APPLICATION_FILED,
  
  // Office Actions
  'CTNF': ProsecutionEventType.NON_FINAL_OA,
  'CTSP': ProsecutionEventType.NON_FINAL_OA, // Special case non-final
  'CTFR': ProsecutionEventType.FINAL_OA,
  'CTAV': ProsecutionEventType.ADVISORY_ACTION,
  
  // Request for Continued Examination
  'RCEX': ProsecutionEventType.RCE_FILED,
  
  // Responses
  'A': ProsecutionEventType.RESPONSE_FILED,
  'A.NE': ProsecutionEventType.RESPONSE_FILED,
  'A.NE.AFCP': ProsecutionEventType.RESPONSE_FILED,
  'AMSB': ProsecutionEventType.RESPONSE_FILED,
  'CLM': ProsecutionEventType.RESPONSE_FILED,
  'REM': ProsecutionEventType.RESPONSE_FILED,
  
  // Information Disclosure Statements
  'IDS': ProsecutionEventType.IDS_FILED,
  '892': ProsecutionEventType.IDS_FILED,
  
  // Interview
  'EXIN': ProsecutionEventType.INTERVIEW_CONDUCTED,
  
  // Notice of Allowance
  'NOA': ProsecutionEventType.NOTICE_OF_ALLOWANCE,
  
  // Abandonment
  'ABN': ProsecutionEventType.ABANDONMENT,
  'WFEE': ProsecutionEventType.ABANDONMENT,
  
  // Continuation/Divisional
  'NTCN': ProsecutionEventType.CONTINUATION_FILED,
  'PTAS': ProsecutionEventType.CONTINUATION_FILED,
};

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
 * Prosecution event interface for timeline display
 */
export interface ProsecutionEvent {
  id: string;
  applicationId: string;
  eventType: ProsecutionEventType;
  eventDate: Date;
  title: string;
  documentId?: string; // Reference to document in S3
  metadata?: Record<string, any>;
}

/**
 * Determines if a USPTO document code represents a timeline milestone
 * @param documentCode - USPTO document code to check
 * @returns true if the document code represents a milestone event
 */
export function isTimelineMilestone(documentCode: string): boolean {
  return documentCode in TIMELINE_DOCUMENT_CODES;
}

/**
 * Alias for isTimelineMilestone for backwards compatibility
 * @deprecated Use isTimelineMilestone instead
 */
export function isMilestoneEvent(documentCode: string): boolean {
  return isTimelineMilestone(documentCode);
}

/**
 * Gets the prosecution event type for a USPTO document code
 * @param documentCode - USPTO document code
 * @returns ProsecutionEventType if the code is a milestone, undefined otherwise
 */
export function getEventType(documentCode: string): ProsecutionEventType | undefined {
  return TIMELINE_DOCUMENT_CODES[documentCode];
}

/**
 * Checks if a document code represents an Office Action
 * @param documentCode - USPTO document code
 * @returns true if the document code is an Office Action
 */
export function isOfficeAction(documentCode: string): boolean {
  const eventType = getEventType(documentCode);
  return eventType === ProsecutionEventType.NON_FINAL_OA ||
         eventType === ProsecutionEventType.FINAL_OA ||
         eventType === ProsecutionEventType.ADVISORY_ACTION;
}

/**
 * Checks if a document code represents a response to an Office Action
 * @param documentCode - USPTO document code
 * @returns true if the document code is a response
 */
export function isResponse(documentCode: string): boolean {
  const eventType = getEventType(documentCode);
  return eventType === ProsecutionEventType.RESPONSE_FILED ||
         eventType === ProsecutionEventType.RCE_FILED;
}

/**
 * Checks if a document code represents a terminal event
 * @param documentCode - USPTO document code
 * @returns true if the document code represents a terminal event
 */
export function isTerminalEvent(documentCode: string): boolean {
  const eventType = getEventType(documentCode);
  return eventType === ProsecutionEventType.NOTICE_OF_ALLOWANCE ||
         eventType === ProsecutionEventType.ABANDONMENT;
}

/**
 * Maps document codes to categories for file drawer organization
 * @param documentCode - USPTO document code
 * @returns Document category for UI organization
 */
export function getDocumentCategory(documentCode: string): DocumentCategory {
  // Office action related
  if (['CTNF', 'CTFR', 'CTAV', 'CTSP', 'MCTNF'].includes(documentCode)) {
    return DocumentCategory.OFFICE_ACTION;
  }
  
  // Response related
  if (['A', 'A.NE', 'A.NE.AFCP', 'AMSB', 'CLM', 'REM', 'RSPN', 'RCEX'].includes(documentCode)) {
    return DocumentCategory.RESPONSE;
  }
  
  // Filing related
  if (['TRNA', 'APP.FILE.REC', 'APP.FILE.REC*', 'ADS', 'SPEC', 'OATH', 'FOR'].includes(documentCode)) {
    return DocumentCategory.FILING;
  }
  
  // Fee related
  if (documentCode.startsWith('WFEE') || documentCode.startsWith('N417')) {
    return DocumentCategory.FEE;
  }
  
  // Search/examination
  if (['SRFW', 'SRNT', '892', 'IDS'].includes(documentCode)) {
    return DocumentCategory.SEARCH;
  }
  
  // Extension of time
  if (documentCode.startsWith('XT/') || documentCode.startsWith('ET/')) {
    return DocumentCategory.CORRESPONDENCE;
  }
  
  return DocumentCategory.OTHER;
}

/**
 * Gets a human-readable title for a prosecution event type
 * @param eventType - Prosecution event type
 * @returns Human-readable title
 */
export function getEventTypeTitle(eventType: ProsecutionEventType): string {
  const titles: Record<ProsecutionEventType, string> = {
    [ProsecutionEventType.APPLICATION_FILED]: 'Application Filed',
    [ProsecutionEventType.CONTINUATION_FILED]: 'Continuation Filed',
    [ProsecutionEventType.NON_FINAL_OA]: 'Non-Final Office Action',
    [ProsecutionEventType.FINAL_OA]: 'Final Office Action',
    [ProsecutionEventType.ADVISORY_ACTION]: 'Advisory Action',
    [ProsecutionEventType.RESPONSE_FILED]: 'Response Filed',
    [ProsecutionEventType.RCE_FILED]: 'RCE Filed',
    [ProsecutionEventType.IDS_FILED]: 'IDS Filed',
    [ProsecutionEventType.INTERVIEW_CONDUCTED]: 'Interview Conducted',
    [ProsecutionEventType.NOTICE_OF_ALLOWANCE]: 'Notice of Allowance',
    [ProsecutionEventType.ABANDONMENT]: 'Application Abandoned',
  };
  
  return titles[eventType] || eventType;
}

/**
 * Gets the priority/importance of an event type for sorting
 * Higher numbers indicate higher priority
 * @param eventType - Prosecution event type
 * @returns Priority number (0-10)
 */
export function getEventPriority(eventType: ProsecutionEventType): number {
  const priorities: Record<ProsecutionEventType, number> = {
    [ProsecutionEventType.FINAL_OA]: 10,
    [ProsecutionEventType.NON_FINAL_OA]: 9,
    [ProsecutionEventType.NOTICE_OF_ALLOWANCE]: 8,
    [ProsecutionEventType.ABANDONMENT]: 8,
    [ProsecutionEventType.ADVISORY_ACTION]: 7,
    [ProsecutionEventType.RESPONSE_FILED]: 6,
    [ProsecutionEventType.RCE_FILED]: 6,
    [ProsecutionEventType.INTERVIEW_CONDUCTED]: 5,
    [ProsecutionEventType.IDS_FILED]: 4,
    [ProsecutionEventType.APPLICATION_FILED]: 3,
    [ProsecutionEventType.CONTINUATION_FILED]: 3,
  };
  
  return priorities[eventType] || 0;
}

/**
 * AI-friendly timeline analysis helpers for automation
 */
export const AI_TIMELINE_HELPERS = {
  /**
   * Gets current prosecution status from timeline events
   */
  getCurrentStatus(events: ProsecutionEvent[]): {
    status: 'PENDING_RESPONSE' | 'PENDING_EXAMINATION' | 'ALLOWED' | 'ABANDONED' | 'UNKNOWN';
    lastEvent: ProsecutionEvent | null;
    daysSinceLastEvent: number;
    nextDeadline?: Date;
  } {
    if (!events.length) return { status: 'UNKNOWN', lastEvent: null, daysSinceLastEvent: 0 };
    
    const sortedEvents = [...events].sort((a, b) => 
      new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );
    const lastEvent = sortedEvents[0];
    const daysSinceLastEvent = Math.floor(
      (Date.now() - new Date(lastEvent.eventDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Determine status based on last event
    if (lastEvent.eventType === ProsecutionEventType.ABANDONMENT) {
      return { status: 'ABANDONED', lastEvent, daysSinceLastEvent };
    }
    
    if (lastEvent.eventType === ProsecutionEventType.NOTICE_OF_ALLOWANCE) {
      return { status: 'ALLOWED', lastEvent, daysSinceLastEvent };
    }
    
    if (isOfficeAction(lastEvent.eventType)) {
      // Calculate deadline (3 months for non-final, 2 months for final)
      const monthsToRespond = lastEvent.eventType === ProsecutionEventType.FINAL_OA ? 2 : 3;
      const deadline = new Date(lastEvent.eventDate);
      deadline.setMonth(deadline.getMonth() + monthsToRespond);
      
      return { 
        status: 'PENDING_RESPONSE', 
        lastEvent, 
        daysSinceLastEvent,
        nextDeadline: deadline
      };
    }
    
    if (isResponse(lastEvent.eventType)) {
      return { status: 'PENDING_EXAMINATION', lastEvent, daysSinceLastEvent };
    }
    
    return { status: 'UNKNOWN', lastEvent, daysSinceLastEvent };
  },
  
  /**
   * Extracts key metrics for AI analysis
   */
  getTimelineMetrics(events: ProsecutionEvent[]): {
    totalRounds: number;
    averageResponseTime: number;
    hasRCE: boolean;
    hasFinalRejection: boolean;
    prosecutionLength: number;
  } {
    const officeActions = events.filter(e => isOfficeAction(e.eventType));
    const responses = events.filter(e => isResponse(e.eventType));
    const hasRCE = events.some(e => e.eventType === ProsecutionEventType.RCE_FILED);
    const hasFinalRejection = events.some(e => e.eventType === ProsecutionEventType.FINAL_OA);
    
    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    
    responses.forEach(response => {
      // Find preceding OA
      const precedingOA = officeActions
        .filter(oa => new Date(oa.eventDate) < new Date(response.eventDate))
        .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())[0];
      
      if (precedingOA) {
        const days = Math.floor(
          (new Date(response.eventDate).getTime() - new Date(precedingOA.eventDate).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        totalResponseTime += days;
        responseCount++;
      }
    });
    
    const firstEvent = events.reduce((earliest, event) => 
      new Date(event.eventDate) < new Date(earliest.eventDate) ? event : earliest
    );
    const lastEvent = events.reduce((latest, event) => 
      new Date(event.eventDate) > new Date(latest.eventDate) ? event : latest
    );
    
    const prosecutionLength = Math.floor(
      (new Date(lastEvent.eventDate).getTime() - new Date(firstEvent.eventDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    
    return {
      totalRounds: officeActions.length,
      averageResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
      hasRCE,
      hasFinalRejection,
      prosecutionLength
    };
  },
  
  /**
   * Suggests next actions based on timeline
   */
  suggestNextActions(events: ProsecutionEvent[]): string[] {
    const { status, lastEvent, nextDeadline } = AI_TIMELINE_HELPERS.getCurrentStatus(events);
    const suggestions: string[] = [];
    
    if (status === 'PENDING_RESPONSE' && nextDeadline) {
      const daysUntilDeadline = Math.floor(
        (nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilDeadline < 30) {
        suggestions.push(`⚠️ Response deadline approaching in ${daysUntilDeadline} days`);
      }
      
      if (lastEvent?.eventType === ProsecutionEventType.FINAL_OA) {
        suggestions.push('Consider filing RCE if unable to overcome rejections');
        suggestions.push('Review appeal options if examiner position is unreasonable');
      } else {
        suggestions.push('Prepare amendment addressing examiner rejections');
        suggestions.push('Consider examiner interview to clarify positions');
      }
    }
    
    if (status === 'PENDING_EXAMINATION') {
      suggestions.push('Monitor for examiner action');
      suggestions.push('Consider supplemental response if new prior art found');
    }
    
    if (status === 'ALLOWED') {
      suggestions.push('Pay issue fee within 3 months');
      suggestions.push('File continuation if additional coverage desired');
    }
    
    return suggestions;
  }
};