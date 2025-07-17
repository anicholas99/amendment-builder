import React, { ReactNode } from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

interface ResizablePanelProps {
  children: ReactNode;
  width: string | number;
  height: string | number;
  onResizeStop: ResizeCallback;
  minWidth?: number;
  maxWidth?: string | number;
}

/**
 * ResizablePanel component handles the resizable main content panel
 * Encapsulates all resize logic and styling
 *
 * IMPORTANT: Height is locked (minHeight = maxHeight) to prevent vertical resizing
 * This ensures the main panel maintains consistent height like the sidebar
 */
export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  width,
  height,
  onResizeStop,
  minWidth = VIEW_LAYOUT_CONFIG.MAIN_PANEL.MIN_WIDTH,
  maxWidth = VIEW_LAYOUT_CONFIG.MAIN_PANEL.MAX_WIDTH_PERCENTAGE,
}) => {
  return (
    <Resizable
      size={{
        width,
        height,
      }}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={height}
      maxHeight={height}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={onResizeStop}
      style={{
        marginRight: `${VIEW_LAYOUT_CONFIG.PANEL_GAP}px`,
        position: 'relative',
        height,
        zIndex: 1,
        // Prevent layout shifts during resize
        willChange: 'width',
        // Ensure no transition effects that could cause flicker
        transition: 'none',
      }}
      handleStyles={{
        right: {
          width: '12px',
          right: '-6px',
          cursor: 'col-resize',
          zIndex: 5,
        },
      }}
      handleClasses={{
        right: 'resize-handle-right',
      }}
    >
      {children}
    </Resizable>
  );
};
