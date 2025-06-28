import React from 'react';
import { InventionData } from '../../../types/invention';

export interface TechnologyDetailsViewProps {
  // Removed analyzedInvention and setAnalyzedInvention - now using React Query only
  isLoading?: boolean;
  loadingProgress?: number;
}

// Interface for background fields used in the application
export interface BackgroundData {
  technical_field?: string;
  problems_solved?: string[];
  existing_solutions?: string[];
}

// Interface for technical implementation fields used in the application
export interface TechnicalImplementationData {
  preferred_embodiment?: string;
  alternative_embodiments?: string[];
  manufacturing_methods?: string[];
}
