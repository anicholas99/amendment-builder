import React from 'react';
import { cn } from '@/lib/utils';
import { useViewHeight } from '@/hooks/useViewHeight';
import { useLayout } from '@/contexts/LayoutContext';

interface SimpleMainPanelProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentPadding?: boolean;
  contentStyles?: React.CSSProperties;
  viewHeightOffset?: number;
  /**
   * Whether to reserve gutter space for the scrollbar on the outer scrollable container.
   * Defaults to `true` to preserve the previous behaviour. Set to `false` when the
   * scrolling happens in a nested element (e.g. TipTap editor) so the scrollbar
   * sits flush against the panel border.
   */
  reserveScrollbarGutter?: boolean;
}

/**
 * A simplified main panel that works like the sidebar - direct overflow control
 * Adds extra offset to be shorter and match the sidebar's appearance
 */
export const SimpleMainPanel: React.FC<SimpleMainPanelProps> = ({
  header,
  children,
  footer,
  contentPadding = true,
  contentStyles = {},
  viewHeightOffset,
  reserveScrollbarGutter = true,
}) => {
  const { isProductivityMode, isHeaderHidden } = useLayout();

  // Use provided offset or calculate based on layout mode
  // In productivity mode, always use 0 to fill container
  // In standard mode, use 60px for visual balance
  const offset =
    viewHeightOffset !== undefined
      ? viewHeightOffset
      : isProductivityMode
        ? 0
        : 60;
  const viewHeight = useViewHeight(offset);

  // In productivity mode, use a concrete height calculation instead of 100%
  const containerHeight = isProductivityMode
    ? 'calc(100vh - 120px)' // Same as ProductivityPanel and ViewLayout containers
    : viewHeight;

  return (
    <div
      className="flex flex-col bg-card border border-border rounded-lg shadow-lg overflow-hidden"
      style={{ height: containerHeight }}
    >
      {/* Fixed header */}
      {header && (
        <div className="flex-shrink-0 bg-card border-b border-border">
          {header}
        </div>
      )}

      {/* Scrollable content - Using CSS class for scrollbar styling */}
      <div
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0',
          contentPadding ? 'p-4' : 'p-0'
        )}
        style={{
          // Always reserve space for scrollbar unless explicitly disabled
          scrollbarGutter: reserveScrollbarGutter ? 'stable' : undefined,
          ...contentStyles,
        }}
      >
        {children}
      </div>

      {/* Fixed footer */}
      {footer && <div className="flex-shrink-0">{footer}</div>}
    </div>
  );
};

export default SimpleMainPanel;
