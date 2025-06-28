/**
 * Types for the Figure Carousel components
 */

// ReactFlow diagram content structure
export interface ReactFlowContent {
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: { label: string };
    [key: string]: unknown;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    [key: string]: unknown;
  }>;
  title?: string;
}

// Figure data types
export interface Figure {
  // Image data URL string for directly uploaded images
  image?: string;
  // Type of figure for rendering decisions
  type?: 'image' | 'mermaid' | 'reactflow';
  // Content for specialized diagrams or secondary image source
  content?: string | ReactFlowContent | unknown;
  // Text description of the figure
  description?: string;
  // Map of element IDs to their descriptions
  elements?: Record<string, unknown>;
}

export type Figures = Record<string, Figure>;

// Props for the main FigureCarousel component
export interface FigureCarouselProps {
  figures: Figures;
  onUpdate: (figures: Figures) => void | Promise<void>;
  onFigureChange: (figureNumber: string) => void;
}

// Props for sub-components
export interface FigureContentProps {
  figure: Figure;
  figureKey: string;
  onOpen: () => void;
  onUpload: () => void;
  onUpdate: (figure: Figure) => void;
  onDropUpload?: (file: File) => void;
  fullView?: boolean;
  onClose?: () => void;
  readOnly?: boolean;
  projectId?: string;
  onFigureAssigned?: (figureId: string, figureKey: string) => void;
}

export interface FigureUploadAreaProps {
  figureKey: string;
  onUpload: () => void;
  fullView?: boolean;
  onDropUpload?: (file: File) => void;
  readOnly?: boolean;
  projectId?: string;
  onFigureAssigned?: (figureId: string, figureKey: string) => void;
}

export interface FigureControlsProps {
  figureKeys: string[];
  onDelete: () => void;
  onFullView: () => void;
  onUnassign?: () => void;
  hasImage?: boolean;
}

export interface FigureNavigationProps {
  figureKeys: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export interface FigureMetadataProps {
  figure: Figure | null;
  figureNum: string;
  onUpdateFigure?: (field: keyof Figure, value: unknown) => void;
  onUpload?: () => void;
  onAddNewFigure?: () => void;
  onRenameFigure?: (newNumber: string) => void;
}
