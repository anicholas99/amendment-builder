/**
 * Database enum constants
 * SQL Server doesn't support Prisma enums, so we use constants for type safety
 */

export const ProjectStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  COMPLETED: 'COMPLETED',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const CitationJobStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type CitationJobStatus =
  (typeof CitationJobStatus)[keyof typeof CitationJobStatus];

export const CitationExtractionStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type CitationExtractionStatus =
  (typeof CitationExtractionStatus)[keyof typeof CitationExtractionStatus];

export const CitationLocationStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  NOT_FOUND: 'NOT_FOUND',
} as const;
export type CitationLocationStatus =
  (typeof CitationLocationStatus)[keyof typeof CitationLocationStatus];

export const CitationReasoningStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;
export type CitationReasoningStatus =
  (typeof CitationReasoningStatus)[keyof typeof CitationReasoningStatus];

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SuggestionStatus = {
  ACTIVE: 'ACTIVE',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;
export type SuggestionStatus =
  (typeof SuggestionStatus)[keyof typeof SuggestionStatus];

export const ChatRole = {
  user: 'user',
  assistant: 'assistant',
  system: 'system',
} as const;
export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

export const FigureStatus = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  ASSIGNED: 'ASSIGNED',
} as const;
export type FigureStatus = (typeof FigureStatus)[keyof typeof FigureStatus];

export const CitationAnalysisSource = {
  LEGACY_RELEVANCE: 'LEGACY_RELEVANCE',
  RAW_EXTRACTION: 'RAW_EXTRACTION',
  DEEP_ANALYSIS: 'DEEP_ANALYSIS',
} as const;
export type CitationAnalysisSource =
  (typeof CitationAnalysisSource)[keyof typeof CitationAnalysisSource];

// Helper functions for validation
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return Object.values(ProjectStatus).includes(status as ProjectStatus);
}

export function isValidCitationJobStatus(
  status: string
): status is CitationJobStatus {
  return Object.values(CitationJobStatus).includes(status as CitationJobStatus);
}

export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidFigureStatus(status: string): status is FigureStatus {
  return Object.values(FigureStatus).includes(status as FigureStatus);
}

export function isValidCitationAnalysisSource(
  source: string
): source is CitationAnalysisSource {
  return Object.values(CitationAnalysisSource).includes(
    source as CitationAnalysisSource
  );
}
