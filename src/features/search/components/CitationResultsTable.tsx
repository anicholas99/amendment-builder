/**
 * CitationResultsTable - A refactored, modular component for displaying citation search results
 * 
 * IMPORTANT: This component is used in the main Search tab view.
 * For the Claim Refinement Citations tab, see:
 * src/features/citation-extraction/components/CitationResultsTable.tsx
 *
 * This file re-exports the refactored CitationResultsTable component which has been
 * split into smaller, more maintainable sub-components for better organization
 * and reusability.
 *
 * Key features:
 * - Modular architecture with separated concerns
 * - Sub-components: src/features/search/components/CitationResultsTable/
 * - Type definitions: src/features/search/types/citationResultsTable.ts
 * @see {@link ./CitationResultsTable/index.tsx} for the main component implementation
 */

export { CitationResultsTable, default } from './CitationResultsTable/index';
export type { CitationResultsTableProps } from '../types/citationResultsTable';
