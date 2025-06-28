/**
 * Claim Update Events
 * 
 * This module provides a simple event system for notifying components
 * when claims are updated from external sources (e.g., chat agent).
 */

import { logger } from '@/lib/monitoring/logger';

export interface ClaimUpdateEventDetail {
  projectId: string;
  action: 'added' | 'edited' | 'deleted' | 'reordered' | 'mirrored';
  claimIds?: string[];
  claimCount?: number;
}

// Create a custom event type for claim updates
const CLAIM_UPDATE_EVENT = 'claim-update';

/**
 * Emit a claim update event
 */
export function emitClaimUpdateEvent(detail: ClaimUpdateEventDetail): void {
  logger.debug('[ClaimUpdateEvents] Emitting event', { detail });
  
  // Create and dispatch the custom event
  const event = new CustomEvent(CLAIM_UPDATE_EVENT, {
    detail,
    bubbles: true,
    cancelable: false,
  });
  
  window.dispatchEvent(event);
  
  logger.info('[ClaimUpdateEvents] Event emitted successfully', {
    eventType: CLAIM_UPDATE_EVENT,
    detail,
  });
}

/**
 * Subscribe to claim update events
 */
export function subscribeToClaimUpdateEvents(
  callback: (event: ClaimUpdateEventDetail) => void
): () => void {
  logger.debug('[ClaimUpdateEvents] Setting up event listener');
  
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ClaimUpdateEventDetail>;
    logger.info('[ClaimUpdateEvents] Event received', {
      detail: customEvent.detail,
    });
    callback(customEvent.detail);
  };
  
  window.addEventListener(CLAIM_UPDATE_EVENT, handler);
  
  logger.debug('[ClaimUpdateEvents] Event listener registered');
  
  // Return cleanup function
  return () => {
    logger.debug('[ClaimUpdateEvents] Removing event listener');
    window.removeEventListener(CLAIM_UPDATE_EVENT, handler);
  };
} 