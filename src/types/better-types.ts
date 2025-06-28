/**
 * Better Types for Patent Drafter AI
 *
 * This file contains improved type definitions to replace 'any' usage.
 * Import from this file directly rather than from the main types index.
 */

// ----- Project Related Types -----

/**
 * Figure data interface with discriminated union for different figure types
 */
export type FigureType = 'image' | 'mermaid' | 'reactflow';

export interface BaseFigure {
  type: FigureType;
  description: string;
  elements?: Record<string, ElementData>;
}

export interface ImageFigure extends BaseFigure {
  type: 'image';
  image: string;
  originalDescription?: string;
}

export interface MermaidFigure extends BaseFigure {
  type: 'mermaid';
  content: string;
  originalDescription?: string;
}

export interface ReactFlowFigure extends BaseFigure {
  type: 'reactflow';
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  originalDescription?: string;
}

export type BetterFigure = ImageFigure | MermaidFigure | ReactFlowFigure;

export interface ReactFlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: unknown;
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface ElementData {
  id: string;
  number: string;
  name: string;
  description: string;
}

// ----- User Interface Types -----

/**
 * General UI state for components
 */
export interface UIState {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Version history type
 */
export interface VersionData {
  id: string;
  timestamp: number;
  description: string;
  data: unknown;
}

/**
 * Verification result type
 */
export interface VerificationResults {
  elementDiscrepancies: DiscrepancyItem[];
  claimDiscrepancies: DiscrepancyItem[];
  figureDiscrepancies: DiscrepancyItem[];
  [key: string]: DiscrepancyItem[];
}

export interface DiscrepancyItem {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  location?: string;
}

// ----- API and Error Types -----

/**
 * Structured API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Use instead of any[] for search history
 */
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  results: BetterSearchResult[];
}

export interface BetterSearchResult {
  id: string;
  title: string;
  snippet: string;
  url?: string;
  score?: number;
}

/**
 * Use instead of any[] for suggestions
 */
export interface AISuggestion {
  id: string;
  type: 'terminology' | 'claim' | 'element' | 'structure';
  content: string;
  explanation?: string;
  confidence?: number;
  applied?: boolean;
  dismissed?: boolean;
}

// ----- Settings Types -----

/**
 * User settings type to replace Record<string, unknown>
 */
export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: number;
  editorWidth?: number;
  autoSave?: boolean;
  notifications?: boolean;
  defaultTenant?: string;
  recentProjects?: string[];
  aiSettings?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  [key: string]: unknown;
}

/**
 * Error with metadata
 */
export interface ErrorObject {
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

/**
 * HTTP Error with status code
 */
export interface HttpError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Type guard to check if error has statusCode
 */
export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as Record<string, unknown>).statusCode === 'number'
  );
}

/**
 * Extract status code from error
 */
export function getErrorStatusCode(
  error: unknown,
  defaultCode: number = 500
): number {
  if (isHttpError(error) && error.statusCode) {
    return error.statusCode;
  }
  return defaultCode;
}

/**
 * Convert unknown error to structured error object
 */
export function asErrorObject(error: unknown): ErrorObject {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  } else if (typeof error === 'string') {
    return {
      message: error,
    };
  } else if (error && typeof error === 'object') {
    return {
      message: String(
        (error as Record<string, unknown>).message || 'Unknown error'
      ),
      context: error as Record<string, unknown>,
    };
  }

  return {
    message: 'Unknown error',
    context: { originalError: error },
  };
}
