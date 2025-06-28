/**
 * CRITICAL: Invention API Request Types
 *
 * This file is the SINGLE SOURCE OF TRUTH for how invention data flows through the API.
 *
 *
 * RULES:
 * 1. ALWAYS send objects, NEVER pre-stringified JSON
 * 2. The service layer handles ALL JSON stringification
 * 3. Frontend sends clean objects, backend handles persistence details
 *
 *
 */

import { InventionData } from '../invention';

/**
 * Request payload for updating invention data
 * Frontend MUST send data in this format
 */
export interface UpdateInventionRequest {
  // Basic fields - sent as-is
  title?: string;
  summary?: string;
  abstract?: string;
  novelty?: string;
  noveltyStatement?: string;
  briefDescription?: string;
  detailedDescription?: string;
  patentCategory?: string;
  technicalField?: string;

  // Problem & Solution fields
  problemStatement?: string;
  solutionSummary?: string;
  inventiveStep?: string;
  industrialApplication?: string;
  inventionType?: string;
  developmentStage?: string;

  // Arrays - sent as arrays, service converts to JSON
  features?: string[];
  advantages?: string[];
  useCases?: string[];
  processSteps?: string[];
  futureDirections?: string[];

  // Objects - sent as objects, service converts to JSON
  // NOTE: figures and elements are now handled through normalized tables
  // and should not be updated through this API

  claims?: Record<string, string> | string[];
  priorArt?: any[];
  definitions?: Record<string, string>;
  technicalImplementation?: {
    preferredEmbodiment?: string;
    alternativeEmbodiments?: string[];
    manufacturingMethods?: string[];
  };
  background?: string | object;
}

/**
 * Internal format used by the service layer
 * This is what gets sent to the database
 * DO NOT USE THIS IN FRONTEND CODE
 */
export interface InventionDatabaseUpdate {
  title?: string;
  summary?: string;
  // ... other direct fields

  // JSON stringified fields
  featuresJson?: string;
  advantagesJson?: string;
  // ... etc
  // NOTE: figuresJson and elementsJson removed - using normalized tables
}

/**
 * Type guard to ensure request is valid
 */
export function isValidInventionUpdateRequest(
  request: any
): request is UpdateInventionRequest {
  // Figures and elements are now handled through separate APIs
  // No special validation needed here
  return true;
}

/**
 * Example usage:
 *
 * // ✅ CORRECT - Send objects
 * const updateData: UpdateInventionRequest = {
 *   title: 'My Invention',
 *   features: ['Feature 1', 'Feature 2'],
 *   advantages: ['Advantage 1', 'Advantage 2']
 * };
 *
 * // NOTE: Figures and elements are now updated through their own APIs
 * // using the normalized table structure
 */
