import React, { useRef } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { Box, Center, Spinner, IconButton, Icon } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';
import FigureUploadArea from './FigureUploadArea';
import Image from 'next/image';
import { FigureContentProps, ReactFlowContent } from './types';
import ReactFlowDiagram from '../ReactFlowDiagram';

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
  }) => {
    // Simplified color values - can be enhanced with theme context later
    const bgColor = 'white';
    const dragRef = useRef<HTMLDivElement>(null);

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
          <Box
            position="relative"
            height="100%"
            width="100%"
            style={{ backgroundColor: bgColor }}
          >
            <Center height="100%" width="100%">
              <img
                key={imageKey}
                src={figure.image}
                alt={figure.description || figureKey}
                style={{
                  maxHeight: 'calc(100vh - 120px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  cursor: 'default',
                }}
              />
            </Center>
          </Box>
        );
      }

      // For non-fullView, use Next.js Image for optimization
      return (
        <Box
          position="relative"
          height="100%"
          width="100%"
          style={{ backgroundColor: 'transparent' }}
        >
          <Center height="100%" width="100%">
            <Box
              position="relative"
              width="100%"
              height="100%"
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
              }}
            >
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
            </Box>
          </Center>
        </Box>
      );
    }

    // Case 2: Figure has a data URL or external URL (legacy)
    if (figure.image && figure.image.trim() !== '') {
      return (
        <Box
          position="relative"
          height="100%"
          width="100%"
          style={{ backgroundColor: fullView ? bgColor : 'transparent' }}
        >
          <Center height="100%" width="100%">
            <img
              key={figure.image}
              src={figure.image}
              alt={figure.description || figureKey}
              style={{
                maxHeight: fullView ? 'calc(100vh - 120px)' : '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                cursor: fullView ? 'default' : 'pointer',
              }}
              onClick={() => !fullView && onOpen && onOpen()}
            />
          </Center>
        </Box>
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
        <Box
          width="100%"
          height={fullView ? '85vh' : '100%'}
          style={{ cursor: fullView ? 'default' : 'pointer' }}
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
        </Box>
      );
    }

    // Case 4: Figure is an image type but uses the content property
    if (
      figure.type === 'image' &&
      figure.content &&
      typeof figure.content === 'string'
    ) {
      return (
        <Box
          position="relative"
          height="100%"
          width="100%"
          style={{ backgroundColor: fullView ? bgColor : 'transparent' }}
        >
          <Center height="100%" width="100%">
            <img
              key={figure.content}
              src={figure.content}
              alt={figure.description || figureKey}
              style={{
                maxHeight: fullView ? 'calc(100vh - 120px)' : '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                cursor: fullView ? 'default' : 'pointer',
              }}
              onClick={() => !fullView && onOpen && onOpen()}
            />
          </Center>
        </Box>
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
