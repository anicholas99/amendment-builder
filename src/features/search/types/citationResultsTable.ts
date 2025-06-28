import { ProcessedCitationMatch } from '@/types/domain/citation';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';

/**
 * Represents a group of citation matches for the same claim element
 */
export interface GroupedCitationMatch {
  elementText: string;
  matches: ProcessedCitationMatch[];
}

/**
 * Props for the CitationResultsTable component
 */
export interface CitationResultsTableProps {
  groupedResults: GroupedCitationMatch[];
  displayIndexMap: { [elementText: string]: number };
  onDisplayIndexChange: (elementText: string, newIndex: number) => void;
  selectedSearchId: string;
  searchHistoryLength: number;
  hideHeader?: boolean;
  // Citation saving
  onSaveCitationMatch?: (match: ProcessedCitationMatch) => Promise<void>;
  savedPriorArtData?: ProcessedSavedPriorArt[];
  isLoading?: boolean;
  selectedReference?: string;
}

/**
 * Theme colors for the citation table
 */
export interface CitationTableTheme {
  emptyStateBg: string;
  mutedColor: string;
  thColor: string;
  scrollbarBg: string;
  scrollbarThumb: string;
}
