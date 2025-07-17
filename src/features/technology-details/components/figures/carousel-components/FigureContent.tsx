import React, { useRef } from 'react';
import { logger } from '@/utils/clientLogger';
import { FiX } from 'react-icons/fi';
import FigureUploadArea from './FigureUploadArea';
import Image from 'next/image';
import { FigureContentProps, ReactFlowContent } from './types';
import { ReactFlowDiagram } from '../ReactFlowDiagram';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Type guard to check if content is ReactFlowContent
function isReactFlowContent(content: unknown): content is ReactFlowContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'nodes' in content &&
    'edges' in content &&
    Array.isArray((content as ReactFlowContent).nodes) &&
    Array.isArray((content as ReactFlowContent).edges)
  );
}

/**
 * Component for displaying figure content (image or upload area)
 */
const FigureContent: React.FC<FigureContentProps> = React.memo(
  ({
    figure,
    figureKey,
    fullView = false,
    onOpen,
    onUpload,
    onUpdate,
    onDropUpload,
    onClose,
    readOnly = false,
    projectId,
    onFigureAssigned,
    inventionData,
  }) => {
    // Simplified color values - can be enhanced with theme context later
    const bgColor = 'white';
    const dragRef = useRef<HTMLDivElement>(null);

    // Preload image on hover for instant modal expansion
    const preloadImage = React.useCallback((src: string) => {
      if (src && typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = src;
      }
    }, []);

    // If no figure exists at all, show the upload area
    if (!figure) {
      return (
        <FigureUploadArea
          figureKey={figureKey}
          onUpload={onUpload}
          fullView={fullView}
          onDropUpload={onDropUpload}
          readOnly={readOnly}
          projectId={projectId}
          onFigureAssigned={onFigureAssigned}
          inventionData={inventionData}
        />
      );
    }

    // IMPORTANT: If figure has no image, always show upload area regardless of other content
    // This handles the case where a figure was unassigned but still has description/content
    // Also check for ReactFlow content - if it has valid ReactFlow content, allow it through
    const hasValidReactFlowContent =
      figure.type === 'reactflow' &&
      figure.content &&
      isReactFlowContent(figure.content);

    if (
      (!figure.image || figure.image.trim() === '') &&
      !hasValidReactFlowContent
    ) {
      return (
        <FigureUploadArea
          figureKey={figureKey}
          onUpload={onUpload}
          fullView={fullView}
          onDropUpload={onDropUpload}
          readOnly={readOnly}
          projectId={projectId}
          onFigureAssigned={onFigureAssigned}
          inventionData={inventionData}
        />
      );
    }

    // Case 1: Figure has an image URL (API endpoint)
    if (
      figure.image &&
      figure.image.trim() !== '' &&
      figure.image.startsWith('/api/')
    ) {
      // Extract a stable key from the URL to prevent re-fetching
      const imageKey =
        figure.image.match(/figures\/([a-zA-Z0-9-]+)\//)?.[1] || figureKey;

      // In fullView mode, use regular img tag for better compatibility with flex containers
      if (fullView) {
        return (
          <div className="relative flex items-center justify-center bg-white">
            <img
              key={imageKey}
              src={figure.image}
              alt={figure.description || figureKey}
              style={{
                maxHeight: 'calc(90vh - 160px)',
                maxWidth: 'calc(90vw - 80px)',
                objectFit: 'contain',
                cursor: 'default',
              }}
            />
          </div>
        );
      }

      // For non-fullView, use Next.js Image for optimization
      return (
        <div
          className="relative h-full w-full bg-transparent"
          onMouseEnter={() => figure.image && preloadImage(figure.image)}
        >
          <div className="h-full w-full flex items-center justify-center">
            <div className="relative w-full h-full max-h-full max-w-full">
              <Image
                key={imageKey} // Use stable key based on figure ID
                src={figure.image}
                alt={figure.description || figureKey}
                fill
                style={{
                  objectFit: 'contain',
                  cursor: 'pointer',
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy" // Use lazy loading instead of priority
                unoptimized={false} // Enable Next.js optimization
                onClick={() => onOpen && onOpen()}
              />
            </div>
          </div>
        </div>
      );
    }

    // Case 2: Figure has a data URL or external URL (legacy)
    if (figure.image && figure.image.trim() !== '') {
      if (fullView) {
        return (
          <div className="relative flex items-center justify-center bg-white">
            <img
              key={figure.image}
              src={figure.image}
              alt={figure.description || figureKey}
              style={{
                maxHeight: 'calc(90vh - 160px)',
                maxWidth: 'calc(90vw - 80px)',
                objectFit: 'contain',
                cursor: 'default',
              }}
            />
          </div>
        );
      }

      return (
        <div
          className="relative h-full w-full bg-transparent"
          onMouseEnter={() => figure.image && preloadImage(figure.image)}
        >
          <div className="h-full w-full flex items-center justify-center">
            <img
              key={figure.image}
              src={figure.image}
              alt={figure.description || figureKey}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                cursor: 'pointer',
              }}
              onClick={() => onOpen && onOpen()}
            />
          </div>
        </div>
      );
    }

    // Case 3: Figure has a reactflow diagram
    if (
      figure.type === 'reactflow' &&
      figure.content &&
      isReactFlowContent(figure.content)
    ) {
      const flowContent = figure.content;
      return (
        <div
          className={cn(
            'w-full',
            fullView ? 'h-[calc(90vh-160px)]' : 'h-full',
            fullView ? 'cursor-default' : 'cursor-pointer'
          )}
          style={fullView ? { maxWidth: 'calc(90vw - 80px)' } : {}}
          onClick={(e: React.MouseEvent) => {
            if (!fullView && onOpen) {
              e.stopPropagation();
              onOpen();
            }
          }}
        >
          <ReactFlowDiagram
            initialNodes={flowContent.nodes}
            initialEdges={flowContent.edges}
            title={flowContent.title || figureKey}
            onDiagramChange={(nodes, edges) => {
              if (onUpdate) {
                onUpdate({
                  ...figure,
                  content: {
                    ...flowContent,
                    nodes,
                    edges,
                  },
                });
              }
            }}
          />
        </div>
      );
    }

    // Case 4: Figure is an image type but uses the content property
    if (
      figure.type === 'image' &&
      figure.content &&
      typeof figure.content === 'string'
    ) {
      if (fullView) {
        return (
          <div className="relative flex items-center justify-center bg-white">
            <img
              key={figure.content}
              src={figure.content}
              alt={figure.description || figureKey}
              style={{
                maxHeight: 'calc(90vh - 160px)',
                maxWidth: 'calc(90vw - 80px)',
                objectFit: 'contain',
                cursor: 'default',
              }}
            />
          </div>
        );
      }

      return (
        <div
          className="relative h-full w-full bg-transparent"
          onMouseEnter={() =>
            typeof figure.content === 'string' && preloadImage(figure.content)
          }
        >
          <div className="h-full w-full flex items-center justify-center">
            <img
              key={figure.content}
              src={figure.content}
              alt={figure.description || figureKey}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                cursor: 'pointer',
              }}
              onClick={() => onOpen && onOpen()}
            />
          </div>
        </div>
      );
    }

    // Default fallback - no renderable content found, show upload area
    logger.info(`No renderable content for ${figureKey}, showing upload area`);
    return (
      <FigureUploadArea
        figureKey={figureKey}
        onUpload={onUpload}
        fullView={fullView}
        onDropUpload={onDropUpload}
        readOnly={readOnly}
        projectId={projectId}
        onFigureAssigned={onFigureAssigned}
        inventionData={inventionData}
      />
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.figureKey === nextProps.figureKey &&
      prevProps.figure?.image === nextProps.figure?.image &&
      prevProps.figure?.content === nextProps.figure?.content &&
      prevProps.figure?.type === nextProps.figure?.type &&
      prevProps.fullView === nextProps.fullView &&
      prevProps.readOnly === nextProps.readOnly
    );
  }
);

FigureContent.displayName = 'FigureContent';

export default FigureContent;
