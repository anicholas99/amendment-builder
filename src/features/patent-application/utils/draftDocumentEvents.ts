/**
 * Draft Document Update Events
 * 
 * This module provides a simple event system for notifying components
 * when draft documents are updated from external sources (e.g., chat agent).
 */

import { logger } from '@/lib/monitoring/logger';

export const DRAFT_DOCUMENT_EVENTS = {
  UPDATED: 'draft-document-updated',
  SECTION_ENHANCED: 'draft-document-section-enhanced',
} as const;

export interface DraftDocumentEventDetail {
  projectId: string;
  type: string;
  action: 'updated' | 'section-enhanced';
}

// Create a custom event type for draft document updates
const DRAFT_DOCUMENT_UPDATE_EVENT = 'draft-document-update';

/**
 * Emit a draft document event
 */
export function emitDraftDocumentEvent(detail: DraftDocumentEventDetail): void {
  logger.debug('[DraftDocumentEvents] Emitting event', { detail });
  
  // Create and dispatch the custom event
  const event = new CustomEvent(DRAFT_DOCUMENT_UPDATE_EVENT, {
    detail,
    bubbles: true,
    cancelable: false,
  });
  
  window.dispatchEvent(event);
  
  logger.info('[DraftDocumentEvents] Event emitted successfully', {
    eventType: DRAFT_DOCUMENT_UPDATE_EVENT,
    detail,
  });
}

/**
 * Subscribe to draft document events
 */
export function subscribeToDraftDocumentEvents(
  callback: (event: DraftDocumentEventDetail) => void
): () => void {
  logger.debug('[DraftDocumentEvents] Setting up event listener');
  
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<DraftDocumentEventDetail>;
    logger.info('[DraftDocumentEvents] Event received', {
      detail: customEvent.detail,
    });
    callback(customEvent.detail);
  };
  
  window.addEventListener(DRAFT_DOCUMENT_UPDATE_EVENT, handler);
  
  logger.debug('[DraftDocumentEvents] Event listener registered');
  
  // Return cleanup function
  return () => {
    logger.debug('[DraftDocumentEvents] Removing event listener');
    window.removeEventListener(DRAFT_DOCUMENT_UPDATE_EVENT, handler);
  };
} 