import { useMemo } from 'react';
import { LAYOUT } from '@/constants/layout';
import { useLayout } from '@/contexts/LayoutContext';

/**
 * Hook that provides consistent view height calculation across the application
 * This ensures all main view containers have the same height and positioning
 *
 * @param additionalOffset - Additional offset to subtract from viewport height (default: 0)
 * @returns Formatted height string for use in CSS
 */
export const useViewHeight = (additionalOffset: number = 0): string => {
  const { isHeaderHidden, isProductivityMode } = useLayout();

  // Calculate the total offset based on header visibility
  const headerOffset =
    isHeaderHidden && isProductivityMode ? 0 : LAYOUT.HEADER_HEIGHT;
  const totalOffset =
    headerOffset + LAYOUT.CONTENT_BOTTOM_PADDING + additionalOffset;

  return useMemo(() => `calc(100vh - ${totalOffset}px)`, [totalOffset]);
};

// Export constant for the default offset
export const DEFAULT_VIEW_OFFSET = LAYOUT.DEFAULT_CONTENT_OFFSET;
