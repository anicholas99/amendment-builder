/**
 * USPTO API Configuration
 * 
 * Configuration for USPTO Open Data Portal (ODP) API integration
 * Used for downloading Office Actions and other USPTO documents
 */

const isServer = typeof window === 'undefined';

export const USPTO_CONFIG = {
  // USPTO ODP API Key
  API_KEY: isServer ? process.env.USPTO_ODP_API_KEY || '' : '',
  
  // Base URLs
  BASE_URL: 'https://api.uspto.gov/api/v1',
  
  // API Endpoints
  endpoints: {
    applications: '/patent/applications',
    documents: '/patent/applications/{applicationId}/documents',
    download: '/download/applications/{applicationId}/{documentId}.pdf',
  },
  
  // Rate limiting
  rateLimit: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Timeout settings
  timeout: {
    download: 30000, // 30 seconds for PDF downloads
    api: 10000, // 10 seconds for API calls
  },
  
  // Document codes we're interested in
  documentCodes: {
    CTNF: 'Non-Final Office Action',
    CTFR: 'Final Office Action',
    CTNF_ELC: 'Election/Restriction',
    REM: 'Examiner Amendment',
    CLM: 'Claims',
    NOA: 'Notice of Allowance',
  },
};