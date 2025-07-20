/**
 * Prosecution Timeline Service
 * 
 * Determines which Office Actions are current vs historical based on 
 * prosecution timeline context. This prevents showing old Office Actions
 * as "OVERDUE" when they've already been responded to.
 */

import { prisma } from '@/lib/prisma';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { 
  ProsecutionEventType,
  MILESTONE_DOCUMENT_CODES,
  isMilestoneEvent 
} from '@/lib/api/uspto/types/prosecution-events';

const logger = createApiLogger('prosecution-timeline-service');

export interface TimelineEvent {
  id: string;
  date: Date;
  type: ProsecutionEventType;
  documentCode: string;
  metadata: any;
}

export interface USPTODocument {
  documentId: string;
  documentCode: string;
  description: string;
  mailDate?: string;
  pageCount?: number;
  pdfUrl?: string;
  category?: string;
  importance?: string;
}

// Document codes that represent responses to Office Actions
export const RESPONSE_DOCUMENT_CODES = [
  'A',      // Amendment
  'A.NE',   // Amendment Non-Entry
  'AMSB',   // Amendment Submitted
  'REM',    // Remarks
  'RCEX',   // Request for Continued Examination
  'RCE',    // RCE (alternative code)
  'AFCP',   // After Final Consideration Program
  'RESP.FINAL', // Response After Final
];

// Extension document codes
export const EXTENSION_DOCUMENT_CODES = [
  'XT/',    // Extension of Time
  'EXT.',   // Extension
  'PETXT',  // Petition for Extension
];

export class ProsecutionTimelineService {
  /**
   * Build a timeline sequence from USPTO documents
   */
  static buildTimelineSequence(documents: USPTODocument[]): TimelineEvent[] {
    // Sort documents by mail date (oldest first)
    const sortedDocs = documents
      .filter(doc => doc.mailDate && isMilestoneEvent(doc.documentCode))
      .sort((a, b) => new Date(a.mailDate!).getTime() - new Date(b.mailDate!).getTime());
    
    const timeline: TimelineEvent[] = [];
    
    for (const doc of sortedDocs) {
      const eventType = MILESTONE_DOCUMENT_CODES[doc.documentCode];
      if (eventType) {
        timeline.push({
          id: doc.documentId,
          date: new Date(doc.mailDate!),
          type: eventType,
          documentCode: doc.documentCode,
          metadata: doc,
        });
      }
    }
    
    return timeline;
  }
  
  /**
   * Find the current Office Action that needs a response
   * Returns null if all Office Actions have been responded to
   */
  static findCurrentOfficeAction(timeline: TimelineEvent[]): TimelineEvent | null {
    // Find all Office Actions in the timeline
    const officeActions = timeline.filter(event => 
      [
        ProsecutionEventType.NON_FINAL_OA, 
        ProsecutionEventType.FINAL_OA,
        ProsecutionEventType.ADVISORY_ACTION
      ].includes(event.type)
    );
    
    if (officeActions.length === 0) return null;
    
    // Check each OA from most recent to oldest
    for (let i = officeActions.length - 1; i >= 0; i--) {
      const oa = officeActions[i];
      
      // Check if there's a response after this OA
      const responseAfterOA = timeline.find(event => 
        event.date > oa.date && 
        [
          ProsecutionEventType.RESPONSE_FILED, 
          ProsecutionEventType.RCE_FILED
        ].includes(event.type)
      );
      
      // Check if there's a subsequent OA (which implies the previous one was responded to)
      const subsequentOA = timeline.find(event => 
        event.date > oa.date && 
        event.id !== oa.id &&
        [
          ProsecutionEventType.NON_FINAL_OA, 
          ProsecutionEventType.FINAL_OA,
          ProsecutionEventType.ADVISORY_ACTION
        ].includes(event.type)
      );
      
      // Check for Notice of Allowance or Abandonment
      const finalEvent = timeline.find(event =>
        event.date > oa.date &&
        [
          ProsecutionEventType.NOTICE_OF_ALLOWANCE,
          ProsecutionEventType.ABANDONMENT
        ].includes(event.type)
      );
      
      // If no response, no subsequent OA, and no final event, this is the current one
      if (!responseAfterOA && !subsequentOA && !finalEvent) {
        return oa;
      }
    }
    
    // All OAs have been responded to
    return null;
  }
  
  /**
   * Calculate the deadline for an Office Action considering extensions
   */
  static calculateDeadline(
    officeAction: TimelineEvent,
    documents: USPTODocument[]
  ): Date {
    const baseDeadline = new Date(officeAction.date);
    
    // Determine base period based on OA type
    if (officeAction.type === ProsecutionEventType.FINAL_OA) {
      // Final OA: 2 months statutory, extendable to 6 months
      baseDeadline.setMonth(baseDeadline.getMonth() + 2);
    } else {
      // Non-Final OA: 3 months statutory, extendable to 6 months
      baseDeadline.setMonth(baseDeadline.getMonth() + 3);
    }
    
    // Check for extensions filed after this OA but before any response
    const extensionsAfterOA = documents.filter(doc => {
      if (!doc.mailDate || !EXTENSION_DOCUMENT_CODES.includes(doc.documentCode)) {
        return false;
      }
      const docDate = new Date(doc.mailDate);
      return docDate > officeAction.date;
    });
    
    // Add extension time (simplified: each extension adds 1 month, max 3 extensions)
    const extensionMonths = Math.min(extensionsAfterOA.length, 3);
    if (extensionMonths > 0) {
      baseDeadline.setMonth(baseDeadline.getMonth() + extensionMonths);
    }
    
    return baseDeadline;
  }
  
  /**
   * Determine if an Office Action is current or historical
   */
  static isCurrentOfficeAction(
    officeAction: { documentCode: string; mailDate?: string },
    currentOA: TimelineEvent | null
  ): boolean {
    if (!currentOA || !officeAction.mailDate) return false;
    
    return currentOA.documentCode === officeAction.documentCode && 
           currentOA.date.getTime() === new Date(officeAction.mailDate).getTime();
  }
  
  /**
   * Get the status for an Office Action based on timeline context
   */
  static getOfficeActionStatus(
    documents: USPTODocument[],
    officeAction: USPTODocument
  ): 'PENDING_RESPONSE' | 'COMPLETED' {
    const timeline = this.buildTimelineSequence(documents);
    const currentOA = this.findCurrentOfficeAction(timeline);
    
    return this.isCurrentOfficeAction(officeAction, currentOA) 
      ? 'PENDING_RESPONSE' 
      : 'COMPLETED';
  }
  
  /**
   * Get application status based on prosecution timeline
   */
  static getApplicationStatus(timeline: TimelineEvent[]): string {
    // Check for final events first
    const latestEvent = timeline[timeline.length - 1];
    
    if (timeline.some(t => t.type === ProsecutionEventType.NOTICE_OF_ALLOWANCE)) {
      return 'ALLOWED';
    }
    
    if (timeline.some(t => t.type === ProsecutionEventType.ABANDONMENT)) {
      return 'ABANDONED';
    }
    
    // Check if there's a pending Office Action
    const currentOA = this.findCurrentOfficeAction(timeline);
    if (currentOA) {
      return 'PENDING_RESPONSE';
    }
    
    // All OAs responded to, waiting for next action
    if (timeline.some(t => t.type === ProsecutionEventType.NON_FINAL_OA || 
                          t.type === ProsecutionEventType.FINAL_OA)) {
      return 'PENDING_EXAMINATION';
    }
    
    // Initial state
    return 'ACTIVE';
  }
}