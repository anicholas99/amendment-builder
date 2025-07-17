import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface TabMapping {
  [tabName: string]: number;
}

interface UseTabUrlStateOptions {
  /** Mapping of URL tab names to numeric indices */
  tabNameToIndex: TabMapping;
  /** Mapping of numeric indices to URL tab names */
  indexToTabName: { [index: number]: string };
  /** Default tab index if no URL param present */
  defaultTabIndex?: number;
  /** Query parameter name (defaults to 'tab') */
  queryParam?: string;
}

interface UseTabUrlStateReturn {
  /** Current active tab index */
  activeTab: number;
  /** Function to change active tab */
  setActiveTab: (index: number) => void;
}

/**
 * Reusable hook for managing tab state with URL synchronization
 * Handles reading initial tab from URL and updating URL when tab changes
 */
export const useTabUrlState = ({
  tabNameToIndex,
  indexToTabName,
  defaultTabIndex = 0,
  queryParam = 'tab',
}: UseTabUrlStateOptions): UseTabUrlStateReturn => {
  const router = useRouter();

  // Initialize tab from URL on mount
  const [activeTab, setActiveTabState] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultTabIndex;

    const urlTab = router.query[queryParam] as string;
    if (urlTab && urlTab in tabNameToIndex) {
      return tabNameToIndex[urlTab];
    }
    return defaultTabIndex;
  });

  // Update URL when activeTab changes
  useEffect(() => {
    if (!router.isReady) return;

    const currentQuery = { ...router.query };
    const tabName = indexToTabName[activeTab];
    const defaultTabName = indexToTabName[defaultTabIndex];

    if (tabName && tabName !== defaultTabName) {
      // Only add to URL if not default tab
      currentQuery[queryParam] = tabName;
    } else {
      // Remove from URL if default tab
      delete currentQuery[queryParam];
    }

    // Use shallow routing to avoid page reload
    router.push(
      {
        pathname: router.pathname,
        query: currentQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [
    activeTab,
    router.isReady,
    router.pathname,
    router.query,
    indexToTabName,
    defaultTabIndex,
    queryParam,
    router,
  ]);

  // Update tab state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    if (!router.isReady) return;

    const urlTab = router.query[queryParam] as string;
    const newTabIndex =
      urlTab && urlTab in tabNameToIndex
        ? tabNameToIndex[urlTab]
        : defaultTabIndex;

    if (newTabIndex !== activeTab) {
      setActiveTabState(newTabIndex);
    }
  }, [
    router.query,
    router.isReady,
    tabNameToIndex,
    defaultTabIndex,
    activeTab,
    queryParam,
  ]);

  return {
    activeTab,
    setActiveTab: setActiveTabState,
  };
};
