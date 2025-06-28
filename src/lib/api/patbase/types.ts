/**
 * PatBase API Types
 * Centralized type definitions for all PatBase-related operations
 */

// API Response Types
export interface PatBaseQueryResponse {
  QueryKey?: string;
  Results?: string;
  [key: string]: unknown;
}

export interface PatBaseFamilyResponse {
  Families?: string;
  [key: string]: unknown;
}

export interface PatBaseBibResponse {
  Families?: Array<{
    Family?: string;
    FamilyID?: string;
    Title?: string;
    Abstract?: string;
    Publications?: Array<{
      PN?: string;
      PD?: string;
      [key: string]: unknown;
    }>;
    Assignees?: Array<{
      PA?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  }>;
}

export interface PatBasePublicationResponse {
  publicationDate?: string;
  date?: string;
  assignee?: string;
  applicant?: string;
  [key: string]: unknown;
}

// Patent Search Types
export interface PatentSearchResult {
  number: string;
  patentNumber?: string;
  title?: string;
  relevancy: number;
  url?: string;
  originalRawResult?: any;
}

export interface DeduplicatedResult {
  bestResult: PatentSearchResult;
  otherFamilyMembersInSearch: PatentSearchResult[];
}

// Client Types
export interface PatbaseSession {
  sessionToken: string;
  createdAt: number;
  expiresAt: number;
}

export interface PatbaseApiOptions {
  sessionToken?: string;
  apiEndpoint?: string;
  method?: 'GET' | 'POST';
  body?: string;
  headers?: Record<string, string>;
}

// Raw Details Type (from patbaseClient.ts)
export interface PatbaseRawDetails {
  title?: string;
  publicationDate?: string;
  assignee?: string;
  applicant?: string;
  abstract?: string;
}
