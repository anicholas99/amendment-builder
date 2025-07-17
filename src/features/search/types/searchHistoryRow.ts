import { PriorArtReference } from '../../../types/claimTypes';
import { NormalizedSearchResult } from '../../../types/domain/searchHistory';

/**
 * Entry data structure for SearchHistoryRow component
 */
export interface SearchHistoryRowEntry {
  id: string;
  query: string;
  timestamp?: string | Date;
  date?: string;
  results: NormalizedSearchResult[];
  searchData?: string;
  parsedElements?: string[] | string;
  citationJobId?: string;
  citationJobIds?: string;
  citationJobReferenceMap?: string;
  citationExtractionStatus?: string;
  citationJobCount?: number;
}

/**
 * Color theme configuration for SearchHistoryRow styling
 */
export interface SearchHistoryRowColors {
  bg: string;
  borderColor: string;
  headerBg: string;
  textColor: string;
  mutedTextColor: string;
  hoverBg: string;
  queryBg: string;
  tableBg: string;
  tableHeaderBg: string;
  tableStripedBg: string;
}

/**
 * Props for the main SearchHistoryRow component
 */
export interface SearchHistoryRowProps {
  entry: SearchHistoryRowEntry;
  _index: number;
  isExpanded: boolean;
  searchNumber: number;
  colors: SearchHistoryRowColors;
  toggleExpand: (searchId: string) => void;
  handleExtractCitations: (entryId: string, event: React.MouseEvent) => void;
  setDeleteConfirmId: (id: string | null) => void;
  isExtractingCitations: boolean;
  onSavePriorArt: (priorArtRef: PriorArtReference) => void;
  _savedPriorArt: PriorArtReference[];
  isReferenceSaved?: (referenceNumber: string) => boolean;
  projectId?: string;
  onExtractCitationForReference?: (
    searchId: string,
    referenceNumber: string
  ) => Promise<{ id?: string | number; isSuccess?: boolean } | undefined>;
  onViewCitationsForReference?: (
    searchId: string,
    referenceNumber: string
  ) => void;
  referencesWithJobs?: Set<string>;
  refreshSavedArtData?: (projectId: string) => Promise<void>;
  savedArtNumbers?: Set<string>;
  excludedPatentNumbers?: Set<string>;
}

/**
 * Props for SearchHistoryRowHeader sub-component
 */
export interface SearchHistoryRowHeaderProps {
  entry: SearchHistoryRowEntry;
  isExpanded: boolean;
  searchNumber: number;
  colors: SearchHistoryRowColors;
  toggleExpand: (id: string) => void;
  setDeleteConfirmId: (id: string) => void;
  isExtractingCitations?: boolean;
  hasEntryJobId: boolean;
  results: PriorArtReference[];
}

/**
 * Props for SearchHistoryRowResults sub-component
 */
export interface SearchHistoryRowResultsProps {
  entry: SearchHistoryRowEntry;
  results: PriorArtReference[];
  colors: SearchHistoryRowColors;
  projectId?: string;
  onSavePriorArt?: (priorArtRef: PriorArtReference) => Promise<void> | void;
  onExtractCitationForReference?: (
    searchId: string,
    referenceNumber: string
  ) => Promise<{ id?: string | number; isSuccess?: boolean } | undefined>;
  onViewCitationsForReference?: (
    searchId: string,
    referenceNumber: string
  ) => void;
  refreshSavedArtData?: (projectId: string) => Promise<void>;
  savedArtNumbers?: Set<string>;
  excludedPatentNumbers?: Set<string>;
  isReferenceSaved?: (referenceNumber: string) => boolean;
  referencesWithJobs?: Set<string>;
  citationJobNumbers: Set<string>;
  setCitationJobNumbers: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Props for ReferenceCardActions sub-component
 */
export interface ReferenceCardActionsProps {
  referenceNumber: string;
  entry: SearchHistoryRowEntry;
  onExtractCitationForReference?: (
    searchId: string,
    referenceNumber: string
  ) => Promise<{ id?: string | number; isSuccess?: boolean } | undefined>;
  onViewCitationsForReference?: (
    searchId: string,
    referenceNumber: string
  ) => void;
  citationJobNumbers: Set<string>;
  setCitationJobNumbers: React.Dispatch<React.SetStateAction<Set<string>>>;
  extractingReferenceNumber: string | null;
  setExtractingReferenceNumber: (refNumber: string | null) => void;
}

/**
 * Constants for pagination behavior
 */
export const PAGINATION_CONSTANTS = {
  INITIAL_VISIBLE_COUNT: 3,
  INCREMENT_COUNT: 10,
} as const;
