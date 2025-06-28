import { InventionData } from '../../../../types';

/**
 * Interface for structured invention background
 */
export interface StructuredInventionBackground {
  technical_field?: string;
  problems_solved?: string[];
  existing_solutions?: string[];
}

/**
 * Interface for the props shared by all tech sections
 */
export interface TechSectionProps {
  analyzedInvention: InventionData | null;
  getFontSize: (baseSize: string) => string;
}

/**
 * Props for TechMainPanel component
 */
export interface TechMainPanelProps {
  projectId: string;
  analyzedInvention: InventionData | null;
  onUpdateInvention: (invention: Partial<InventionData>) => void;
}
