import { useMemo } from 'react';
import { LAYOUT } from '@/constants/layout';

/**
 * Hook that provides consistent view height calculation across the application
 * This ensures all main view containers have the same height and positioning
 *
 * @param offset - Total offset to subtract from viewport height (default: header height + bottom padding)
 * @returns Formatted height string for use in CSS
 */
export const useViewHeight = (
  offset: number = LAYOUT.DEFAULT_CONTENT_OFFSET
): string => {
  return useMemo(() => `calc(100vh - ${offset}px)`, [offset]);
};

// Export constant for the default offset
export const DEFAULT_VIEW_OFFSET = LAYOUT.DEFAULT_CONTENT_OFFSET;
