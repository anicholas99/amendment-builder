import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentPanelProps {
  children: ReactNode;
  isDarkMode: boolean;
  islandMode?: boolean;
  height?: string | number;
  className?: string;
}

/**
 * ContentPanel component wraps content with consistent styling
 * Used for both main content and sidebar content containers
 * Matches SimpleMainPanel's island look with borders and shadows
 */
export const ContentPanel: React.FC<ContentPanelProps> = React.memo(
  ({
    children,
    isDarkMode,
    islandMode = false,
    height = '100%',
    className,
  }) => {
    return (
      <div
        className={cn(
          'w-full rounded-lg shadow-lg border border-border overflow-hidden',
          className
        )}
        style={{ height }}
      >
        <div className="h-full bg-card rounded-lg flex flex-col relative z-10 transition-colors duration-150 custom-scrollbar">
          {children}
        </div>
      </div>
    );
  }
);

ContentPanel.displayName = 'ContentPanel';
