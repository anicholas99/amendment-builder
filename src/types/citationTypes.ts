/**
 * Interface for consolidated citation results
 */
export interface ConsolidatedCitationResult {
  referenceNumber: string;
  data: Record<string, unknown>; // The parsed resultsData from the original CitationResult
  error?: string; // Optional field if parsing failed
}

/**
 * Interface for smart citation analysis results
 */
export interface SmartCitationAnalysis {
  elementAnalysis: Array<{
    elementText: string;
    emphasizedInClaim: boolean;
    priorArtStrength: number;
    patentabilityFocus: number;
    reasoning: string;
    citationEvidence: Array<{
      referenceNumber: string;
      exactText: string;
      relevance: number;
    }>;
  }>;
  preprocessorSummary: string;
}

/**
 * Interface for alternative suggestion format
 */
export interface AlternativeSuggestion {
  suggestedText: string;
  reason: string;
  strategy: string;
}

/**
 * Interface for prior art reference in suggestion
 */
export interface SuggestionPriorArtReference {
  number: string;
  title?: string;
  relevancy?: number;
  relevantText: string;
}

/**
 * Interface for suggestion object
 */
export interface Suggestion {
  id: string;
  type: string;
  text?: string;
  description?: string;
  originalText: string;
  suggestedText: string;
  elementName: string;
  reason: string;
  strategy: string;
  claimNumber: string;
  priority: 'high' | 'medium' | 'low';
  priorArtReferences: SuggestionPriorArtReference[];
  alternativeSuggestion?: AlternativeSuggestion | null;
  applied: boolean;
  dismissed: boolean;
}
