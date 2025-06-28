import { PriorArtReference } from './claimTypes';
import { InventionData } from './invention';
import { Suggestion, ConsolidatedCitationResult } from './citationTypes';
import { SearchResult } from './api';

/**
 * Cost tracking interface for API calls
 */
export interface ApiCostSummary {
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  processTime: number;
}

/**
 * Response format for the generate-suggestions API
 */
export interface GenerateSuggestionsResponse {
  suggestions: Suggestion[];
  searchId: string | null;
  timestamp: string;
  costSummary: ApiCostSummary;
}

/**
 * Request format for the generate-suggestions API
 */
export interface GenerateSuggestionsRequest {
  parsedElements: string[];
  searchResults: PriorArtReference[];
  claimText: string;
  inventionData: InventionData;
  searchId?: string;
  citationData?: ConsolidatedCitationResult[];
}

export interface ParsedClaimElement {
  id: string;
  text: string;
  type: 'element' | 'modifier' | 'function';
  isOptional?: boolean;
  alternatives?: string[];
}

export interface ClaimParsing {
  elements: ParsedClaimElement[];
  dependencies: string[];
  scope: 'independent' | 'dependent';
}

export interface ClaimSuggestion {
  id: string;
  type: 'broadening' | 'narrowing' | 'alternative' | 'dependent';
  title: string;
  description: string;
  suggestedText: string;
  reasoning: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: 'scope' | 'clarity' | 'novelty' | 'validity';
}

export interface ClaimAnalysisInput {
  claimText: string;
  claimNumber: string;
  inventionData: InventionData;
  context?: {
    otherClaims?: Record<string, string>;
    priorArt?: string[];
  };
}

export interface SuggestionGenerationRequest {
  searchResults: Array<SearchResult | PriorArtReference>;
  priorArt: ConsolidatedCitationResult[];
  inventionData: InventionData;
  searchQuery?: string;
  analysisType?: 'initial' | 'detailed' | 'comparative';
}

export interface SuggestionContext {
  projectId: string;
  searchHistoryId?: string;
  inventionData: InventionData;
  searchResults: Array<SearchResult | PriorArtReference>;
  priorArt?: ConsolidatedCitationResult[];
}

/**
 * Types for AI-generated suggestions in the claim refinement process
 */

export interface SuggestionCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface SuggestionItem {
  id: string;
  categoryId: string;
  text: string;
  originalText?: string;
  suggestedText?: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
  dismissed: boolean;
}
