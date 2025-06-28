// Clean separation of concerns for figure management

/**
 * Database record for actual figure files (secure storage)
 */
export interface ProjectFigureRecord {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  blobName: string;
  mimeType: string;
  sizeBytes: number;
  figureKey?: string; // e.g., "FIG. 1", "FIG. 2A"
  description?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Figure content structure (stored in normalized Element and FigureElement tables)
 * This describes the intellectual content of figures
 */
export interface FigureContent {
  title: string;
  description: string;
  elements: string[]; // Array of element IDs shown in this figure
  callouts?: FigureCallout[]; // Specific descriptions for elements in this figure context
  embodiment?: string; // Which embodiment this figure represents
  view?: string; // "top view", "cross-section", "perspective", etc.
}

/**
 * Specific description of an element within a figure context
 */
export interface FigureCallout {
  element: string; // Element ID (e.g., "101")
  description: string; // Context-specific description for this figure
  position?: {
    x: number; // Percentage from left
    y: number; // Percentage from top
  };
}

/**
 * Element definitions (stored in normalized Element table)
 * Generic definitions that apply across all figures
 */
export interface ElementDefinitions {
  [elementId: string]: string; // e.g., "101": "Control unit"
}

/**
 * Complete figure system combining file and content
 */
export interface CompleteFigure {
  // File information (from database)
  file?: ProjectFigureRecord;

  // Content information (from normalized tables)
  content: FigureContent;

  // Associated element definitions
  elements: { [id: string]: string };
}

/**
 * API response for figure operations
 */
export interface FigureApiResponse {
  id: string;
  figureKey?: string;
  url: string; // Secure API endpoint, not direct blob URL
  fileName: string;
  description?: string;
  content?: FigureContent;
}

/**
 * Request to assign uploaded figure to figure key
 */
export interface AssignFigureRequest {
  figureId: string; // ID of uploaded ProjectFigure
  figureKey: string; // e.g., "FIG. 1"
  description?: string;
}
