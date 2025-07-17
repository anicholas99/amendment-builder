/**
 * Centralized API Response Types & Zod Schemas
 *
 * This file re-exports all API response types from domain-specific modules
 * for backward compatibility. New code should import from the specific
 * domain modules in the responses/ directory.
 *
 * @deprecated Import from specific domain modules instead:
 * - responses/base.ts - Shared base schemas
 * - responses/project.ts - Project-related schemas
 * - responses/search-citation.ts - Search and citation schemas
 * - responses/prior-art.ts - Prior art schemas
 * - responses/claim.ts - Claim parsing and generation schemas
 * - responses/invention-figure.ts - Invention and figure schemas
 * - responses/citation-extraction.ts - Citation extraction job schemas
 * - responses/ai-analysis.ts - AI analysis and suggestion schemas
 * - responses/misc.ts - Chat history and other miscellaneous schemas
 */

// Re-export everything from the new structure for backward compatibility
export * from './responses/index';
