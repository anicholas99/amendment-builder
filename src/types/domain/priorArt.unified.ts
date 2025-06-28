/**
 * @fileoverview Defines the canonical, unified type for Prior Art.
 *
 * This file provides a single source of truth for the shape of a prior art object
 * throughout the application. It consolidates fields from various sources
 * (search APIs, database records) into one consistent interface. This eliminates
 * type mismatches and confusion between components, hooks, and services.
 */

import { FamilyMemberReference, SavedCitationUI } from './priorArt';

/**
 * The canonical, unified representation of a prior art document.
 * This interface should be used everywhere in the application that deals with prior art.
 */
export interface UnifiedPriorArt {
  // Core Identifiers (always present)
  id: string; // From SavedPriorArt or generated for new references
  patentNumber: string; // The primary, normalized patent number (e.g., US1234567B2)
  source: 'GooglePatents' | 'PatBase' | 'Manual' | 'Database';

  // Core Metadata
  title: string;
  abstract?: string;
  url?: string;
  publicationDate?: string | null;
  year?: string;
  authors?: string[];

  // Data from Search/Analysis
  relevance?: number;
  claimOverlapScore?: number;
  relevantText?: string;
  CPCs?: string[];
  IPCs?: string[];
  otherFamilyMembers?: FamilyMemberReference[];
  citationStatus?: string | null;
  searchAppearanceCount?: number;

  // Data from Database (SavedPriorArt)
  projectId?: string;
  notes?: string | null;
  savedAt?: Date | string;
  savedCitations?: SavedCitationUI[];
  claim1?: string | null;
  summary?: string | null;

  // UI State
  isExcluded?: boolean;
  isMock?: boolean;
}
