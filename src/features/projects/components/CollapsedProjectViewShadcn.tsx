import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FiFolder,
  FiFolderPlus,
  FiLayers,
  FiEdit,
  FiFileText,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { logger } from '@/utils/clientLogger';
import { InventionData } from '@/types';
import { LoadingState, LoadingMinimal } from '@/components/common/LoadingState';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebarShowAllProjects } from '@/hooks/api/useUIPreferences';

interface Project {
  id: string;
  name: string;
  hasProcessedInvention?: boolean;
  invention?:
    | InventionData
    | null
    | {
        id?: string;
        title?: string;
        summary?: string;
        abstract?: string;
        description?: string;
        components?: string[];
        features?: string[];
        advantages?: string[];
        use_cases?: string[];
        background?: Record<string, unknown> | null;
      };
  [key: string]: unknown;
}

interface CollapsedProjectViewShadcnProps {
  projects: Project[];
  activeProject: string | null;
  activeDocument: { documentType: string | null } | null;
  expandedIndices: number[];
  isAnimating: boolean;
  onOpenModal: () => void;
  onProjectClick: (
    projectId: string,
    index: number,
    e: React.MouseEvent
  ) => void;
  onDocumentSelect: (projectId: string, documentType: string) => void;
  onLoadMore?: () => void; // For pagination
  hasNextPage?: boolean; // For pagination
  isFetchingNextPage?: boolean; // For pagination
}

const CollapsedProjectViewShadcn: React.FC<CollapsedProjectViewShadcnProps> = ({
  projects,
  activeProject,
  activeDocument,
  expandedIndices,
  isAnimating: _isAnimating,
  onOpenModal: _onOpenModal,
  onProjectClick,
  onDocumentSelect,
  onLoadMore,
  hasNextPage = false,
  isFetchingNextPage = false,
}) => {
  const { isDarkMode } = useThemeContext();
  const [showAllProjects, setShowAllProjects] = useSidebarShowAllProjects();

  // Add state for active project expansion
  const [isActiveProjectExpanded, setIsActiveProjectExpanded] =
    React.useState<boolean>(true);

  // Auto-expand the active project when it changes
  React.useEffect(() => {
    setIsActiveProjectExpanded(true);
  }, [activeProject]);

  // Auto-load more pages if active project is not found
  React.useEffect(() => {
    if (activeProject && hasNextPage && !isFetchingNextPage) {
      const activeProjectExists = projects.some(p => p.id === activeProject);
      if (!activeProjectExists) {
        onLoadMore?.();
      }
    }
  }, [activeProject, projects, hasNextPage, isFetchingNextPage, onLoadMore]);

  const handleDocumentClick = useCallback(
    (projectId: string, documentType: string) => {
      // Clone parameters to prevent reference leaks
      onDocumentSelect(String(projectId), documentType);
    },
    [onDocumentSelect]
  );

  const CollapsedProjectItem: React.FC<{
    project: Project;
    index: number;
    isActive: boolean;
    activeDocument: { documentType: string | null } | null;
    expandedIndices: number[];
    onProjectClick: (
      projectId: string,
      index: number,
      e: React.MouseEvent
    ) => void;
    onDocumentSelect: (projectId: string, documentType: string) => void;
    isDarkMode: boolean;
  }> = ({
    project,
    index,
    isActive,
    activeDocument,
    expandedIndices,
    onProjectClick,
    onDocumentSelect: _onDocumentSelect,
    isDarkMode,
  }) => {
    const isExpanded =
      Array.isArray(expandedIndices) && expandedIndices.includes(index);

    // Check if invention has been processed
    // ALWAYS enable if hasProcessedInvention is true, regardless of invention data
    const inventionProcessed = !!(
      project.hasProcessedInvention === true ||
      (project.invention &&
        (project.invention.title ||
          project.invention.summary ||
          project.invention.abstract ||
          project.invention.description))
    );

    // Debug logging
    logger.debug(
      '[CollapsedProjectViewShadcn] Checking invention processed state',
      {
        projectId: project.id,
        projectName: project.name,
        hasProcessedInvention: project.hasProcessedInvention,
        inventionProcessed,
        inventionData: project.invention,
        hasTitle: !!project.invention?.title,
        hasFeatures:
          Array.isArray(project.invention?.features) &&
          project.invention.features.length > 0,
        rawProject: project,
      }
    );

    return (
      <div className="flex flex-col items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-colors select-none',
                  'hover:bg-gray-100 dark:hover:bg-white/20',
                  isActive
                    ? isDarkMode
                      ? 'bg-white/20 text-blue-300'
                      : 'bg-gray-200 text-blue-400'
                    : 'bg-transparent text-gray-500'
                )}
                onClick={e => onProjectClick(project.id, index, e)}
              >
                {isExpanded ? (
                  <FiFolderPlus
                    size={20}
                    className={cn(
                      isActive
                        ? 'text-blue-400 dark:text-blue-300'
                        : 'text-gray-500'
                    )}
                  />
                ) : (
                  <FiFolder
                    size={20}
                    className={cn(
                      isActive
                        ? 'text-blue-400 dark:text-blue-300'
                        : 'text-gray-500'
                    )}
                  />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {project.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Show navigation icons when project is expanded - with smooth transitions */}
        {isExpanded && (
          <div className="flex flex-col items-center gap-2 mt-2 w-full mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      isActive && activeDocument?.documentType === 'amendments'
                        ? 'default'
                        : 'ghost'
                    }
                    size="sm"
                    className={cn(
                      'w-8 h-8 p-0 transition-all hover:scale-105',
                      isActive && activeDocument?.documentType === 'amendments'
                        ? 'bg-blue-600 hover:bg-blue-600 text-white'
                        : 'hover:bg-accent'
                    )}
                    onClick={_e =>
                      handleDocumentClick(project.id, 'amendments')
                    }
                  >
                    <FiEdit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Amendment Studio</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    );
  };

  // Add display name for debugging
  CollapsedProjectItem.displayName = 'CollapsedProjectItemShadcn';

  return (
    <div className="w-full h-full flex flex-col items-center py-2">
      {projects.length > 0 ? (
        <>
          {/* Active Project Section */}
          {activeProject &&
            (() => {
              const activeProjectData = projects.find(
                p => p.id === activeProject
              );

              // If active project is not found in current pages, show a loading placeholder and try to load more
              if (!activeProjectData) {
                return (
                  <div className="w-full mb-2">
                    <div
                      className={cn(
                        'rounded-md p-2 mb-2 flex items-center justify-center min-h-[40px]',
                        isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                      )}
                    >
                      {hasNextPage ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <LoadingState
                                  variant="spinner"
                                  size="sm"
                                  message=""
                                  transparent={true}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              Loading active project...
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <FiFolder size={16} className="text-gray-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              Active project not found
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {!hasNextPage && (
                      <Separator
                        className={cn(
                          isDarkMode ? 'border-white/20' : 'border-gray-300'
                        )}
                      />
                    )}
                  </div>
                );
              }

              const _activeProjectIndex = projects.findIndex(
                p => p.id === activeProject
              );

              return (
                <div className="w-full mb-2">
                  <div
                    className={cn(
                      'rounded-md p-1 mb-2',
                      isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                    )}
                  >
                    <Accordion
                      type="single"
                      collapsible
                      value={
                        isActiveProjectExpanded ? 'active-project' : undefined
                      }
                      onValueChange={value =>
                        setIsActiveProjectExpanded(value === 'active-project')
                      }
                      className="w-full"
                    >
                      <AccordionItem
                        value="active-project"
                        className="border-none"
                      >
                        <CollapsedProjectItem
                          key={`active-${activeProjectData.id}-${!!activeProjectData.invention?.title}`}
                          project={activeProjectData}
                          index={0}
                          isActive={true}
                          activeDocument={activeDocument}
                          expandedIndices={isActiveProjectExpanded ? [0] : []}
                          onProjectClick={(projectId, index, e) => {
                            // For active project, just toggle expansion
                            if (e) {
                              e.stopPropagation();
                              e.preventDefault();
                            }
                            setIsActiveProjectExpanded(
                              !isActiveProjectExpanded
                            );
                          }}
                          onDocumentSelect={handleDocumentClick}
                          isDarkMode={isDarkMode}
                        />
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <Separator
                    className={cn(
                      isDarkMode ? 'border-white/20' : 'border-gray-300'
                    )}
                  />
                </div>
              );
            })()}

          {/* All Projects Section */}
          {(showAllProjects ||
            projects.filter(p => p.id !== activeProject).length > 0) && (
            <div className="w-full mt-2">
              <div
                className={cn(
                  'transition-opacity flex justify-center',
                  showAllProjects
                    ? 'opacity-100'
                    : 'opacity-40 hover:opacity-100'
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-6 h-6 p-0 opacity-60 hover:opacity-100',
                          'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
                          'hover:bg-gray-100 dark:hover:bg-white/10',
                          showAllProjects ? 'mb-2' : ''
                        )}
                        onClick={() => setShowAllProjects(!showAllProjects)}
                      >
                        {showAllProjects ? (
                          <FiEyeOff className="w-3 h-3" />
                        ) : (
                          <FiEye className="w-3 h-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {showAllProjects
                        ? 'Hide all projects'
                        : 'Show all projects'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div
                className={cn(
                  'transition-all duration-200 ease-in-out',
                  showAllProjects
                    ? 'opacity-100 max-h-screen'
                    : 'opacity-0 max-h-0 overflow-hidden'
                )}
              >
                <div className="space-y-2">
                  {projects
                    .filter(project => project.id !== activeProject)
                    .map((project, _originalIndex) => {
                      const actualIndex = projects.findIndex(
                        p => p.id === project.id
                      );

                      const inventionKey = project.invention
                        ? `${project.id}-${!!project.invention.title}-${!!project.invention.features}-${!!project.invention.abstract}-${!!project.invention.components}-${!!project.invention.advantages}`
                        : `${project.id}-no-invention`;

                      return (
                        <div key={inventionKey} className="flex justify-center">
                          <CollapsedProjectItem
                            project={project}
                            index={actualIndex}
                            isActive={false}
                            activeDocument={activeDocument}
                            expandedIndices={expandedIndices}
                            onProjectClick={onProjectClick}
                            onDocumentSelect={onDocumentSelect}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Load More button for pagination - always accessible */}
          {hasNextPage && (
            <div className="w-full mt-2 flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'w-6 h-6 p-0 opacity-80 hover:opacity-100',
                        'hover:bg-gray-100 dark:hover:bg-white/10'
                      )}
                      onClick={onLoadMore}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <LoadingMinimal size="sm" />
                      ) : (
                        <FiFolder className="w-3 h-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Load More Projects
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </>
      ) : null}

      {/* Removed New Project button to reduce redundancy with Projects dashboard */}
    </div>
  );
};

export default CollapsedProjectViewShadcn;
