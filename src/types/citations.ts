export interface CitationMatch {
  id: string;
  searchHistoryId: string;
  reference: string;
  elementId: string;
  elementText: string;
  parsedElementText?: string;
  matchingText?: string;
  score?: number;
  reasoning?: string;
  citationLocation?: CitationLocation;
  deepAnalysisResult?: DeepAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface CitationLocation {
  reference: string;
  elementId: string;
  locations: Array<{
    section: string;
    text: string;
    context?: string;
  }>;
}

export interface DeepAnalysisResult {
  overallRelevance: number;
  elementAnalysis: Array<{
    elementId: string;
    relevance: number;
    explanation: string;
    matchedConcepts: string[];
  }>;
  keyFindings: string[];
  recommendations?: string[];
}

export interface CitationJob {
  id: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  elementIds?: string[];
  result?: unknown;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
