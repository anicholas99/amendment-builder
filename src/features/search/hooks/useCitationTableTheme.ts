import { CitationTableTheme } from '../types/citationResultsTable';

/**
 * Hook for managing citation table theme colors using semantic tokens
 * @returns Theme colors object
 */
export function useCitationTableTheme(): CitationTableTheme {
  return {
    emptyStateBg: 'bg.secondary',
    mutedColor: 'text.tertiary',
    thColor: 'text.primary',
    scrollbarBg: 'border.light',
    scrollbarThumb: 'border.primary',
  };
}
