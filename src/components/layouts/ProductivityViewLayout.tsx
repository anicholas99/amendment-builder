import React, { ReactNode, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import EnhancedChatInterface from '@/features/chat/components/EnhancedChatInterface';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/api/useProjects';
import { useLayout } from '@/contexts/LayoutContext';
import { logger } from '@/utils/clientLogger';
import {
  VIEW_LAYOUT_CONFIG,
  PRODUCTIVITY_LAYOUT_CONFIG,
} from '@/constants/layout';

interface ProductivityViewLayoutProps {
  header: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode; // The figures/tabs panel
  islandMode?: boolean;
}

/**
 * Panel wrapper for productivity mode that provides island styling
 * without calculating its own height (uses parent container height)
 */
const ProductivityPanel: React.FC<{
  children: ReactNode;
  contentPadding?: boolean;
}> = ({ children, contentPadding = false }) => {
  return (
    <div className="h-[calc(100vh-120px)] w-full rounded-lg shadow-lg border border-border transition-none">
      <div
        className={cn(
          'h-full bg-card rounded-lg flex flex-col relative z-[15] transition-none',
          contentPadding && 'p-4'
        )}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Productivity mode layout for patent editing with three panels:
 * - Figures/tabs panel (left - flexible width)
 * - Main content/editor (center - fixed percentage)
 * - Chat assistant (right - flexible width)
 *
 * Follows established SimpleMainPanel pattern for consistency
 */
const ProductivityViewLayoutComponent: React.FC<
  ProductivityViewLayoutProps
> = ({
  header,
  mainContent,
  sidebarContent,
  islandMode = true, // Default to island mode for floating effect
}) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { isHeaderHidden, toggleHeaderVisibility } = useLayout();

  // Validate and extract projectId with proper error handling
  const projectId = useMemo(() => {
    const id = router.query.projectId;
    if (typeof id !== 'string' || !id) {
      logger.warn('Invalid or missing projectId in ProductivityViewLayout', {
        query: router.query,
      });
      return null;
    }
    return id;
  }, [router.query.projectId]);

  // Fetch project data with proper error handling
  const { data: projectData, error: projectError } = useProject(projectId);

  // Log project loading errors for debugging
  if (projectError) {
    logger.error('Failed to load project in ProductivityViewLayout', {
      projectId,
      error: projectError,
    });
  }

  return (
    <div
      className={cn(
        'relative productivity-view-layout h-full flex flex-col overflow-hidden transition-none',
        isDarkMode ? 'bg-gray-900' : 'bg-muted'
      )}
    >
      {/* Header Section */}
      {!isHeaderHidden && (
        <div className="relative mb-0 z-30 flex-shrink-0 pointer-events-auto">
          {header}
        </div>
      )}

      {/* Header Visibility Toggle Button - Hidden for now */}
      {/* 
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={isHeaderHidden ? 'Show header' : 'Hide header'}
              size="sm"
              variant="ghost"
              className="absolute top-1 right-[180px] z-[35] opacity-60 hover:opacity-100 bg-card border border-border text-primary transition-none h-8 w-8 p-0 pointer-events-auto"
              onClick={toggleHeaderVisibility}
            >
              {isHeaderHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isHeaderHidden ? 'Show header' : 'Hide header'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      */}

      {/* Main Content Area - Fill remaining space */}
      <div
        className={cn(
          'flex-1 relative z-10 overflow-hidden',
          islandMode
            ? 'p-4 pb-[5vh] md:px-5 md:pb-[5vh] lg:px-6 lg:pb-[5vh]'
            : 'p-4 md:px-5 lg:px-6'
        )}
      >
        {/* Three Panel Layout */}
        <div
          className="flex h-full relative mt-3 md:mt-4 lg:mt-6 transition-none"
          style={{ gap: `${PRODUCTIVITY_LAYOUT_CONFIG.GAP}px` }}
        >
          {/* Left Panel - Flexible Width */}
          <div
            className="relative h-full flex-1"
            style={{
              minWidth: PRODUCTIVITY_LAYOUT_CONFIG.PANELS.LEFT.MIN_WIDTH,
            }}
          >
            <ProductivityPanel contentPadding={false}>
              {sidebarContent}
            </ProductivityPanel>
          </div>

          {/* Center Panel - Fixed Percentage Width */}
          <div
            className="relative h-full flex-shrink-0 w-[40%] lg:w-[42%]"
            style={{
              maxWidth: VIEW_LAYOUT_CONFIG.MAIN_PANEL.MAX_WIDTH_PERCENTAGE,
              minWidth: PRODUCTIVITY_LAYOUT_CONFIG.PANELS.CENTER.MIN_WIDTH,
            }}
          >
            <ProductivityPanel contentPadding={false}>
              {mainContent}
            </ProductivityPanel>
          </div>

          {/* Right Panel - Flexible Width */}
          <div
            className="relative h-full flex-1"
            style={{
              minWidth: PRODUCTIVITY_LAYOUT_CONFIG.PANELS.RIGHT.MIN_WIDTH,
            }}
          >
            <ProductivityPanel contentPadding={false}>
              {projectId ? (
                <EnhancedChatInterface
                  projectData={projectData || null}
                  onContentUpdate={() => {
                    // TODO: Implement proper content update handler
                    logger.debug('Content update triggered from chat');
                  }}
                  setPreviousContent={() => {
                    // TODO: Implement proper content setter
                    logger.debug('Previous content setter called');
                  }}
                  pageContext="patent"
                  projectId={projectId}
                />
              ) : (
                <div className="p-4 text-muted-foreground text-center">
                  No project selected
                </div>
              )}
            </ProductivityPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductivityViewLayout = React.memo(
  ProductivityViewLayoutComponent
);

ProductivityViewLayout.displayName = 'ProductivityViewLayout';

export default ProductivityViewLayout;
