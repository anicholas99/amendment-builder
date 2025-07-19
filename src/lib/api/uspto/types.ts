/**
 * USPTO Open Data Portal API Types
 * 
 * Type definitions for USPTO ODP API requests and responses
 * Reference: https://api.uspto.gov
 */

export interface USPTODocument {
  documentCode: string;
  description: string;
  documentId: string;
  mailDate: string;
  pageCount?: number;
  applicationNumber?: string;
  patentNumber?: string;
}

export interface USPTODocumentsResponse {
  documents: USPTODocument[];
  totalCount?: number;
}

export interface USPTOApplicationData {
  applicationNumber: string;
  filingDate: string;
  patentNumber?: string;
  issueDate?: string;
  title: string;
  status: string;
  examinerName?: string;
  artUnit?: string;
  confirmationNumber?: string;
  publicationNumber?: string;
  publicationDate?: string;
  inventorName?: string[];
  applicantName?: string;
  attorneyDocketNumber?: string;
}

export interface USPTOFileWrapperDocument {
  documentId: string;
  documentCode: string;
  documentDescription: string;
  documentDate: string;
  pageCount: number;
  pdfUrl?: string;
}

export interface USPTOApiOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface USPTOSearchParams {
  applicationNumber?: string;
  patentNumber?: string;
  publicationNumber?: string;
  filingDateFrom?: string;
  filingDateTo?: string;
  limit?: number;
  offset?: number;
}

export interface USPTOError {
  code: string;
  message: string;
  details?: string;
}

// Document codes for common office actions
export const OFFICE_ACTION_CODES = {
  NON_FINAL_REJECTION: 'CTNF',
  FINAL_REJECTION: 'CTFR',
  RESTRICTION_REQUIREMENT: 'CTRS',
  ELECTION_RESTRICTION: 'CTEL',
  ADVISORY_ACTION: 'CTAV',
  NOTICE_OF_ALLOWANCE: 'NOA',
  EXAMINER_ANSWER: 'EXAN',
} as const;

export type OfficeActionCode = typeof OFFICE_ACTION_CODES[keyof typeof OFFICE_ACTION_CODES];