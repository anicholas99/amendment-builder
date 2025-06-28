/**
 * Custom event system for prior art updates
 * This allows components to be notified when prior art is saved or removed
 */

export const PRIOR_ART_EVENTS = {
  SAVED: 'prior-art-saved',
  REMOVED: 'prior-art-removed',
  UPDATED: 'prior-art-updated',
} as const;

export interface PriorArtEventDetail {
  projectId: string;
  patentNumber?: string;
  action: 'saved' | 'removed' | 'updated';
}

/**
 * Emit a prior art event
 */
export const emitPriorArtEvent = (detail: PriorArtEventDetail) => {
  const event = new CustomEvent(
    PRIOR_ART_EVENTS[
      detail.action.toUpperCase() as keyof typeof PRIOR_ART_EVENTS
    ],
    {
      detail,
    }
  );
  window.dispatchEvent(event);
};

/**
 * Subscribe to prior art events
 */
export const subscribeToPriorArtEvents = (
  callback: (detail: PriorArtEventDetail) => void
): (() => void) => {
  const handlers = Object.values(PRIOR_ART_EVENTS).map(eventType => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<PriorArtEventDetail>;
      callback(customEvent.detail);
    };
    window.addEventListener(eventType, handler);
    return { eventType, handler };
  });

  // Return cleanup function
  return () => {
    handlers.forEach(({ eventType, handler }) => {
      window.removeEventListener(eventType, handler);
    });
  };
};
