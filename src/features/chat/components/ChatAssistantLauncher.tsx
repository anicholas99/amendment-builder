import React, { useState } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import ChatInterface from './ChatInterface';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/api/useProjects';

interface ChatAssistantLauncherProps {
  /**
   * Optional analyzed invention object. If provided, it will be forwarded to the chat interface
   * so the assistant can give section-aware answers. When omitted the assistant behaves in
   * read-only Q&A mode.
   */
  analyzedInvention?: unknown;
  /**
   * Logical page context (e.g. "tech-details", "claim-refinement", "application-draft").
   * Used only for future routing / memory, currently not required.
   */
  pageContext?: 'technology' | 'claim-refinement' | 'patent';
  page: 'claim-refinement' | 'technology-details' | 'patent-application';
  disabled?: boolean;
}

/**
 * Floating launcher + slide-over drawer that hosts the project chat assistant.
 *
 * Embed this component once in any page or layout where the assistant should be available.
 * It renders a circular button in the bottom-right corner that expands into a side panel.
 */
const ChatAssistantLauncher: React.FC<ChatAssistantLauncherProps> = ({
  pageContext: _pageContext,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const { activeProjectId } = useProjectData();
  const { data: activeProjectData } = useProject(activeProjectId);

  // Determine page context from router if not provided
  const pageContext =
    _pageContext ||
    (() => {
      const path = router.pathname;
      if (path.includes('technology')) return 'technology';
      if (path.includes('claim-refinement')) return 'claim-refinement';
      if (path.includes('patent')) return 'patent';
      return 'technology'; // default
    })();

  return (
    <>
      {/* Floating launcher button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                'fixed bottom-6 right-6 z-[1500] rounded-full w-12 h-12 p-0',
                'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
                'transition-all duration-200 hover:scale-105'
              )}
              aria-label="Open project assistant"
            >
              <FiMessageCircle className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open project assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Side drawer with chat */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className={cn(
            'flex flex-col h-full max-w-full md:max-w-[420px] p-0',
            'border-l border-border bg-background'
          )}
        >
          <SheetHeader className="border-b border-border p-0">
            <div className="flex items-center justify-between w-full p-4">
              <SheetTitle className="text-lg font-semibold text-foreground">
                {activeProjectData?.name || 'Project Assistant'}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 p-0 hover:bg-accent"
                aria-label="Close assistant"
              >
                <FiX className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatInterface
              projectData={activeProjectData || null}
              onContentUpdate={() => {
                /* no-op */
              }}
              setPreviousContent={() => {
                /* no-op */
              }}
              pageContext={pageContext}
              projectId={
                activeProjectData?.id ||
                (router.query.projectId as string) ||
                ''
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatAssistantLauncher;
