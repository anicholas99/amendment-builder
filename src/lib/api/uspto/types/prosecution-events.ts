/**
 * Prosecution Event Types for Timeline
 * Only milestone events that affect prosecution strategy or deadlines
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

// Map USPTO document codes to event types (only milestones)
export const MILESTONE_DOCUMENT_CODES: Record<string, ProsecutionEventType> = {
  // Filing
  'TRNA': ProsecutionEventType.APPLICATION_FILED,
  'APP.FILE.REC': ProsecutionEventType.APPLICATION_FILED,
  'SPEC': ProsecutionEventType.APPLICATION_FILED,
  
  // Office Actions
  'CTNF': ProsecutionEventType.NON_FINAL_OA,
  'CTFR': ProsecutionEventType.FINAL_OA,
  'CTAV': ProsecutionEventType.ADVISORY_ACTION,
  
  // Responses
  'A': ProsecutionEventType.RESPONSE_FILED,
  'A.NE': ProsecutionEventType.RESPONSE_FILED,
  'AMSB': ProsecutionEventType.RESPONSE_FILED,
  'RCEX': ProsecutionEventType.RCE_FILED,
  
  // Other milestones
  'IDS': ProsecutionEventType.IDS_FILED,
  'EXIN': ProsecutionEventType.INTERVIEW_CONDUCTED,
  'NOA': ProsecutionEventType.NOTICE_OF_ALLOWANCE,
  'ABN': ProsecutionEventType.ABANDONMENT,
  'NTCN': ProsecutionEventType.CONTINUATION_FILED,
};

export function isMilestoneEvent(documentCode: string): boolean {
  return documentCode in MILESTONE_DOCUMENT_CODES;
}

export function getEventType(documentCode: string): ProsecutionEventType | null {
  return MILESTONE_DOCUMENT_CODES[documentCode] || null;
}