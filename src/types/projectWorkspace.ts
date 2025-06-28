import { ClaimData } from './claimTypes';
import { InventionData } from './invention';
import { ProjectFigureRecord } from './domain/figures';

/**
 * Normalized figure with its elements
 */
export interface FigureWithElements {
  id: string;
  status?: string;
  figureKey?: string | null;
  title?: string | null;
  description?: string | null;
  displayOrder: number;
  fileName?: string;
  blobName?: string;
  mimeType?: string;
  elements: Array<{
    elementKey: string;
    elementName: string;
    calloutDescription?: string | null;
  }>;
}

/**
 * Represents the entire workspace for a project.
 * This is used for the initial, consolidated data load to improve performance.
 */
export interface ProjectWorkspace {
  invention: InventionData | null;
  claims: ClaimData[];
  figures: ProjectFigureRecord[];
  figuresWithElements: FigureWithElements[];
  // Add other top-level project data here as needed in the future
  // e.g., versions, prior art, etc.
}
