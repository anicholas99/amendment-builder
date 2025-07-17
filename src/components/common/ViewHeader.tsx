import React, { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSidebar } from '../../contexts/SidebarContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useLayout } from '../../contexts/LayoutContext';

interface ViewHeaderProps {
  /**
   * The title to display in the header
   */
  title: string;

  /**
   * Action buttons to display in the header
   */
  actions: ReactNode;
}

/**
 * A standardized header component for all main views
 * Displays a title on the left and action buttons on the right
 * Adjusts its position based on the sidebar collapsed state
 */
const ViewHeader: React.FC<ViewHeaderProps> = React.memo(
  ({ title, actions }) => {
    const { isSidebarCollapsed, isSidebarHidden } = useSidebar();
    const { isDarkMode } = useThemeContext();
    const { isProductivityMode, isHeaderHidden } = useLayout();

    // Determine the left offset based on current layout mode.
    // In productivity mode, we need to align the header text with content in left panel.
    // Layout padding: base=16px, md=20px, lg=24px (responsive)
    // FiguresTab padding: 16px (p={4})
    // Content position: base=32px, md=36px, lg=40px
    // Header has px={6} (24px), so leftPosition = content position - 24px
    // Result: base=8px, md=12px, lg=16px
    // In all other cases we retain the previous behaviour that accounts for
    // the global sidebar width (collapsed / expanded) or its hidden state.
    const getLeftPositionClasses = () => {
      if (isProductivityMode) {
        return 'left-[-4px] md:left-0 lg:left-1'; // Perfect alignment with content
      } else {
        // ViewLayout already handles sidebar spacing internally
        // Header should stay in same position regardless of sidebar state
        return 'left-[-8px]';
      }
    };

    // Determine if title needs a tooltip (over 25 chars)
    const shouldShowTooltip = title.length > 25;

    // Small adjustment for productivity mode when header is hidden to account for lost margin
    const topAdjustment = isProductivityMode && isHeaderHidden ? 8 : 0;
    const topPosition = 37 + topAdjustment;

    return (
      <div
        className={cn(
          'flex justify-between items-center py-4 px-6 fixed right-0 z-30',
          'transition-all duration-150 ease-out pointer-events-auto',
          'bg-transparent mb-4',
          getLeftPositionClasses()
        )}
        style={{
          top: `${topPosition}px`,
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h1
                className={cn(
                  'text-[20px] font-bold max-w-[600px] whitespace-nowrap overflow-hidden text-ellipsis',
                  'tracking-tight',
                  isDarkMode ? 'text-white' : 'text-gray-700'
                )}
                style={{
                  letterSpacing: '-0.025em',
                }}
              >
                {title}
              </h1>
            </TooltipTrigger>
            {shouldShowTooltip && (
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <div className="flex gap-2 items-center">{actions}</div>
      </div>
    );
  }
);

ViewHeader.displayName = 'ViewHeader';

export default ViewHeader;
