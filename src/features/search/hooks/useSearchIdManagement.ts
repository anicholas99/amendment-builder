import { useState, useRef, useEffect, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';

interface UseSearchIdManagementProps {
  initialSelectedSearchId?: string;
  activeSearchEntryId?: string;
  firstSearchHistoryId?: string;
  onSearchIdChange?: (searchId: string) => void;
}

/**
 * Custom hook to manage search ID selection with stabilization to prevent loops
 */
export function useSearchIdManagement({
  initialSelectedSearchId,
  activeSearchEntryId,
  firstSearchHistoryId,
  onSearchIdChange,
}: UseSearchIdManagementProps) {
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);

  // Stabilization mechanism to prevent infinite loops
  const isStabilizingRef = useRef(false);
  const stabilizationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const previousInitialSelectedSearchIdRef = useRef<string | undefined>(
    initialSelectedSearchId
  );
  const isMountedRef = useRef(true);

  // Enhanced setState wrapper that prevents updates during stabilization
  const setSelectedSearchIdSafe = useCallback(
    (newId: string | null) => {
      if (!isMountedRef.current) {
        logger.debug(
          '[useSearchIdManagement] Component unmounted, ignoring update'
        );
        return;
      }

      if (isStabilizingRef.current) {
        logger.debug(
          '[useSearchIdManagement] Ignoring search ID update during stabilization'
        );
        return;
      }

      // Prevent setting the same ID repeatedly
      if (selectedSearchId === newId) {
        logger.debug('[useSearchIdManagement] Same ID, skipping update');
        return;
      }

      logger.debug(`[useSearchIdManagement] Setting search ID to: ${newId}`);
      setSelectedSearchId(newId);

      // Start stabilization period
      isStabilizingRef.current = true;

      // Clear any existing timeout
      if (stabilizationTimeoutRef.current) {
        clearTimeout(stabilizationTimeoutRef.current);
      }

      // End stabilization after a short delay
      stabilizationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          isStabilizingRef.current = false;
          logger.debug('[useSearchIdManagement] Stabilization period ended');
        }
      }, 300); // Increased timeout for better stability
    },
    [selectedSearchId]
  );

  // Initialize the selected search ID
  useEffect(() => {
    // Only initialize if we haven't already done so
    if (!hasInitializedRef.current) {
      const initialId =
        initialSelectedSearchId ||
        activeSearchEntryId ||
        firstSearchHistoryId ||
        null;

      if (initialId) {
        logger.debug(
          `[useSearchIdManagement] Setting initial search ID: ${initialId}`
        );
        setSelectedSearchIdSafe(initialId);
        // If we have an onChange handler, call it to persist the selection
        if (onSearchIdChange) {
          onSearchIdChange(initialId);
        }
        hasInitializedRef.current = true;
      }
    }
    // Update only if initialSelectedSearchId prop actually changed (not just a re-render)
    else if (
      initialSelectedSearchId &&
      initialSelectedSearchId !== previousInitialSelectedSearchIdRef.current
    ) {
      logger.debug(
        `[useSearchIdManagement] Parent changed initialSelectedSearchId from ${previousInitialSelectedSearchIdRef.current} to ${initialSelectedSearchId}`
      );
      setSelectedSearchIdSafe(initialSelectedSearchId);
      if (onSearchIdChange) {
        onSearchIdChange(initialSelectedSearchId);
      }
    }

    // Update the ref to track the previous value
    previousInitialSelectedSearchIdRef.current = initialSelectedSearchId;
  }, [
    initialSelectedSearchId,
    activeSearchEntryId,
    firstSearchHistoryId,
    onSearchIdChange,
    setSelectedSearchIdSafe,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (stabilizationTimeoutRef.current) {
        clearTimeout(stabilizationTimeoutRef.current);
      }
    };
  }, []);

  return {
    selectedSearchId,
    setSelectedSearchIdSafe,
    isStabilizing: isStabilizingRef.current,
  };
}
