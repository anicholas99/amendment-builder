import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { RequestManager } from '@/lib/api/requestManager';

interface RequestManagerContextValue {
  requestManager: RequestManager;
}

const RequestManagerContext = createContext<
  RequestManagerContextValue | undefined
>(undefined);

export function RequestManagerProvider({ children }: { children: ReactNode }) {
  // Create a single instance per React app lifecycle
  // This is safe because it's client-side and tied to the user's session
  const requestManagerRef = useRef<RequestManager>();

  if (!requestManagerRef.current) {
    requestManagerRef.current = new RequestManager();
  }

  return (
    <RequestManagerContext.Provider
      value={{ requestManager: requestManagerRef.current }}
    >
      {children}
    </RequestManagerContext.Provider>
  );
}

export function useRequestManager(): RequestManager {
  const context = useContext(RequestManagerContext);

  if (!context) {
    throw new Error(
      'useRequestManager must be used within RequestManagerProvider'
    );
  }

  return context.requestManager;
}

// Backward compatibility helper for gradual migration
// This creates a new instance each time to avoid global state
export function getRequestManager(): RequestManager {
  if (typeof window === 'undefined') {
    throw new Error('RequestManager is only available in browser environment');
  }

  // Return a new instance to avoid cross-session pollution
  return new RequestManager();
}
