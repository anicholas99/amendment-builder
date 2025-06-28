/**
 * Minimal invention data structure for API compatibility
 */
export interface InventionData {
  // Basic fields
  title?: string;
  summary?: string;
  abstract?: string;
  description?: string;
  briefDescription?: string;
  detailedDescription?: string;
  patent_category?: string;
  patentCategory?: string;
  technical_field?: string;
  technicalField?: string;

  // Problem & Solution fields
  problemStatement?: string;
  solutionSummary?: string;
  noveltyStatement?: string;
  inventiveStep?: string;
  industrialApplication?: string;
  inventionType?: string;
  developmentStage?: string;

  // Complex fields
  background?: string | Record<string, any>;
  detailed_description?: string;
  novelty?: string;

  // Arrays
  features?: string[];
  advantages?: string[];
  use_cases?: string[];
  useCases?: string[];
  process_steps?: string[];
  processSteps?: string[];
  future_directions?: string[];
  futureDirections?: string[];
  keyAlgorithms?: string[];
  dataFlow?: string[];

  // Objects
  technical_implementation?: Record<string, any>;
  technicalImplementation?: Record<string, any>;
  figures?: Record<string, any>;
  elements?: Record<string, any>;
  claims?: Record<string, any>;
  prior_art?: any[];
  priorArt?: any[];
  definitions?: Record<string, any>;

  [key: string]: any;
}
