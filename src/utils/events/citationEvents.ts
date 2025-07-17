/**
 * Global event system for citation-related events
 *
 * This ensures that all components stay synchronized when citations are saved or removed
 */

export type CitationEventType =
  | 'citation-saved'
  | 'citation-removed'
  | 'citations-refreshed';

export interface CitationEventDetail {
  type: CitationEventType;
  projectId: string;
  referenceNumber?: string;
  citationId?: string;
  timestamp: number;
}

/**
 * Emit a citation event
 */
export function emitCitationEvent(
  detail: Omit<CitationEventDetail, 'timestamp'>
) {
  const event = new CustomEvent('citation-event', {
    detail: {
      ...detail,
      timestamp: Date.now(),
    },
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(event);
  }
}

/**
 * Subscribe to citation events
 * @returns Unsubscribe function
 */
export function subscribeToCitationEvents(
  callback: (detail: CitationEventDetail) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CitationEventDetail>;
    callback(customEvent.detail);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('citation-event', handler);
    return () => window.removeEventListener('citation-event', handler);
  }

  return () => {}; // No-op for SSR
}

/**
 * Helper to emit a citation saved event
 */
export function emitCitationSaved(
  projectId: string,
  referenceNumber: string,
  citationId?: string
) {
  emitCitationEvent({
    type: 'citation-saved',
    projectId,
    referenceNumber,
    citationId,
  });
}

/**
 * Helper to emit a citation removed event
 */
export function emitCitationRemoved(
  projectId: string,
  referenceNumber: string,
  citationId?: string
) {
  emitCitationEvent({
    type: 'citation-removed',
    projectId,
    referenceNumber,
    citationId,
  });
}

/**
 * Helper to emit a citations refreshed event
 */
export function emitCitationsRefreshed(projectId: string) {
  emitCitationEvent({
    type: 'citations-refreshed',
    projectId,
  });
}
