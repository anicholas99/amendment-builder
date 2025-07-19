import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useDeleteProject } from '../hooks';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { extractTenantFromQuery } from '@/utils/routerTenant';
import { useToast } from '@/hooks/useToastWrapper';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { useProjectData } from '@/contexts/ProjectDataContext';
import { useActiveDocument } from '@/contexts/ActiveDocumentContext';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { ProjectSidebarProject } from '../types/projectSidebar';
import {
  ProjectListItemShadcn,
  ProjectSwitchModal,
  EmptyProjectList,
} from './project-list';
import { LoadingState } from '@/components/common/LoadingState';
import { useTimeout } from '@/hooks/useTimeout';
import { useProject } from '@/hooks/api/useProjects';
import { transformProjectToSidebarFormat } from '../utils/projectSidebarUtils';
import { useOptimizedDataLoading } from '@/components/common/OptimizedLoadingStrategy';

// State shape - grouped by logical concerns
interface ProjectListState {
  // Modal state
  modal: {
    isOpen: boolean;
    targetProjectId: string | null;
    targetDocumentType: string | null;
  };

  // View state
  view: {
    isActiveProjectExpanded: boolean;
    showAllProjects: boolean;
  };

  // Load more state
  loadMore: {
    shouldLoadMore: boolean;
    hasSearchedAllPages: boolean;
    searchAttempts: number;
  };
}

// Action types
type ProjectListAction =
  // Modal actions
  | {
      type: 'OPEN_MODAL';
      payload: { projectId: string; documentType: string | null };
    }
  | { type: 'CLOSE_MODAL' }
  // View actions
  | { type: 'SET_ACTIVE_PROJECT_EXPANDED'; payload: boolean }
  | { type: 'TOGGLE_SHOW_ALL_PROJECTS' }
  // Load more actions
  | { type: 'SET_SHOULD_LOAD_MORE'; payload: boolean }
  | { type: 'SET_HAS_SEARCHED_ALL_PAGES'; payload: boolean }
  | { type: 'INCREMENT_SEARCH_ATTEMPTS' }
  | { type: 'RESET_SEARCH_ATTEMPTS' };

// Reducer function
function projectListReducer(
  state: ProjectListState,
  action: ProjectListAction
): ProjectListState {
  switch (action.type) {
    // Modal actions
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: {
          isOpen: true,
          targetProjectId: action.payload.projectId,
          targetDocumentType: action.payload.documentType,
        },
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: {
          isOpen: false,
          targetProjectId: null,
          targetDocumentType: null,
        },
      };

    // View actions
    case 'SET_ACTIVE_PROJECT_EXPANDED':
      return {
        ...state,
        view: { ...state.view, isActiveProjectExpanded: action.payload },
      };
    case 'TOGGLE_SHOW_ALL_PROJECTS':
      return {
        ...state,
        view: { ...state.view, showAllProjects: !state.view.showAllProjects },
      };

    // Load more actions
    case 'SET_SHOULD_LOAD_MORE':
      return {
        ...state,
        loadMore: { ...state.loadMore, shouldLoadMore: action.payload },
      };
    case 'SET_HAS_SEARCHED_ALL_PAGES':
      return {
        ...state,
        loadMore: { ...state.loadMore, hasSearchedAllPages: action.payload },
      };
    case 'INCREMENT_SEARCH_ATTEMPTS':
      return {
        ...state,
        loadMore: {
          ...state.loadMore,
          searchAttempts: state.loadMore.searchAttempts + 1,
        },
      };
    case 'RESET_SEARCH_ATTEMPTS':
      return { ...state, loadMore: { ...state.loadMore, searchAttempts: 0 } };

    default:
      return state;
  }
}

// Add interface for ProjectList props
interface ProjectListShadcnProps {
  projects: ProjectSidebarProject[]; // Accept sidebar projects from parent
  isLoading?: boolean; // Accept loading state from parent
  error?: Error | null; // Accept error state from parent
  handleProjectClick?: (
    projectId: string,
    index: number,
    e?: React.MouseEvent
  ) => void;
  onDocumentSelect?: (projectId: string, documentType: string) => void;
  onExpandedChange: (indices: number[]) => void;
  onLoadMore?: () => void; // For pagination
  hasNextPage?: boolean; // For pagination
  isFetchingNextPage?: boolean; // For pagination
}

/**
 * Efficient non-virtualized project list component - shadcn/ui version
 * This component displays a list of projects, using shadcn/ui components.
 * It is designed to be visually consistent with previous versions.
 */
const ProjectListShadcn: React.FC<ProjectListShadcnProps> = ({
  projects,
  isLoading = false,
  error = null,
  handleProjectClick,
  onDocumentSelect: externalOnDocumentSelect,
  onExpandedChange,
  onLoadMore,
  hasNextPage = false,
  isFetchingNextPage = false,
}) => {
  // Remove the useProjects() hook - data comes from props now
  const deleteProjectMutation = useDeleteProject();

  const { activeProjectId: activeProject, setActiveProject } = useProjectData();
  const { activeDocument } = useActiveDocument();

  // Fetch the active project separately if needed
  // This handles the case where a newly created/processed project might not be
  // immediately available in the paginated list due to sorting or timing
  const { data: activeProjectDetails } = useProject(activeProject);

  const router = useRouter();
  const toast = useToast();
  const { isDarkMode } = useThemeContext();

  // Use the optimized loading hook to check if global loading is active
  const { isLoading: isGlobalLoading } = useOptimizedDataLoading();

  // Get initial showAllProjects value from URL
  const getInitialShowAllProjects = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const showAllParam = urlParams.get('showAllProjects');
    return showAllParam === null ? true : showAllParam === 'true';
  };

  // Initial state
  const initialState: ProjectListState = {
    modal: {
      isOpen: false,
      targetProjectId: null,
      targetDocumentType: null,
    },
    view: {
      isActiveProjectExpanded: true,
      showAllProjects: getInitialShowAllProjects(),
    },
    loadMore: {
      shouldLoadMore: false,
      hasSearchedAllPages: false,
      searchAttempts: 0,
    },
  };

  const [state, dispatch] = useReducer(projectListReducer, initialState);

  // Update URL when showAllProjects changes
  const toggleShowAllProjects = useCallback(() => {
    const newValue = !state.view.showAllProjects;
    dispatch({ type: 'TOGGLE_SHOW_ALL_PROJECTS' });

    // Update URL param without causing navigation
    const url = new URL(window.location.href);
    url.searchParams.set('showAllProjects', String(newValue));
    window.history.replaceState({}, '', url.toString());
  }, [state.view.showAllProjects]);

  // Auto-expand the active project when it changes
  useEffect(() => {
    dispatch({ type: 'SET_ACTIVE_PROJECT_EXPANDED', payload: true });
  }, [activeProject]);

  // Only run this effect when projects are loaded for the first time
  useEffect(() => {
    if (activeProject && projects.length > 0) {
      const activeIndex = projects.findIndex(
        (p: ProjectSidebarProject) => p.id === activeProject
      );
      // Only auto-expand if we found the project
      if (activeIndex !== -1) {
        onExpandedChange([activeIndex]);
      }
    }
    // Intentionally only run on mount to avoid interfering with user interactions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Find target project for modal
  const targetProject =
    projects.find(p => p.id === state.modal.targetProjectId) || null;

  const MAX_SEARCH_ATTEMPTS = 3; // Prevent infinite loading

  // Use useTimeout for delayed load more
  useTimeout(
    state.loadMore.shouldLoadMore
      ? () => {
          onLoadMore?.();
          dispatch({ type: 'SET_SHOULD_LOAD_MORE', payload: false });
          dispatch({ type: 'INCREMENT_SEARCH_ATTEMPTS' });
        }
      : () => {},
    state.loadMore.shouldLoadMore ? 0 : null
  );

  // Track when we've exhausted all pages looking for the active project
  useEffect(() => {
    if (
      !hasNextPage &&
      activeProject &&
      !projects.find(p => p.id === activeProject)
    ) {
      dispatch({ type: 'SET_HAS_SEARCHED_ALL_PAGES', payload: true });
    } else if (projects.find(p => p.id === activeProject)) {
      dispatch({ type: 'SET_HAS_SEARCHED_ALL_PAGES', payload: false });
      dispatch({ type: 'RESET_SEARCH_ATTEMPTS' }); // Reset attempts when project is found
    }
  }, [hasNextPage, activeProject, projects]);

  // Handle accordion expansion/collapse
  const handleAccordionChange = (indices: number | number[]) => {
    let newIndices: number[] = [];

    if (Array.isArray(indices)) {
      newIndices = indices;
    } else if (typeof indices === 'number') {
      newIndices = [indices];
    } else {
      newIndices = [];
    }

    onExpandedChange(newIndices);
  };

  // This is called after confirming project switch in the modal
  const handleConfirmSwitch = async () => {
    if (!state.modal.targetProjectId) {
      dispatch({ type: 'CLOSE_MODAL' });
      return;
    }

    try {
      const project = projects.find(p => p.id === state.modal.targetProjectId);
      if (project) {
        setActiveProject(state.modal.targetProjectId);

        if (state.modal.targetDocumentType) {
          const { tenant } = extractTenantFromQuery(router.query);
          router.push(
            `/${tenant}/projects/${state.modal.targetProjectId}/${state.modal.targetDocumentType}`
          );
        } else {
          // Default to amendments studio when opening project without specifying a doc type
          const { tenant } = extractTenantFromQuery(router.query);
          router.push(
            `/${tenant}/projects/${state.modal.targetProjectId}/amendments/studio`
          );
        }
      }

      dispatch({ type: 'CLOSE_MODAL' });
    } catch (error) {
      logger.error('Error switching project:', error);
      toast({
        title: 'Failed to switch project',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Cancel handler for project switch modal
  const handleCancel = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  // Handle document selection with type safety
  const handleDocumentSelect = useCallback(
    (projectId: string, documentType: string) => {
      // Use external handler if provided
      if (externalOnDocumentSelect) {
        externalOnDocumentSelect(projectId, documentType);
        return;
      }

      // Fall back to internal logic
      if (projectId !== activeProject) {
        // Show confirmation for project switch
        dispatch({ type: 'OPEN_MODAL', payload: { projectId, documentType } });
      } else {
        // Same project, just navigate
        const { tenant } = extractTenantFromQuery(router.query);
        router.push(`/${tenant}/projects/${projectId}/${documentType}`);
      }
    },
    [activeProject, router, externalOnDocumentSelect]
  );

  // Handle project selection with confirmation
  const oldHandleProjectSelect = useCallback(
    (projectId: string) => {
      if (projectId !== activeProject) {
        // Show confirmation for project switch
        dispatch({
          type: 'OPEN_MODAL',
          payload: { projectId, documentType: null },
        });
      }
    },
    [activeProject]
  );

  // Use the passed handleProjectClick or fall back to the old behavior
  const projectClickHandler = useCallback(
    (projectId: string, index: number, e?: React.MouseEvent) => {
      if (handleProjectClick) {
        handleProjectClick(projectId, index, e);
      } else {
        oldHandleProjectSelect(projectId);
      }
    },
    [handleProjectClick, oldHandleProjectSelect]
  );

  // Special handler for active project expansion
  const activeProjectClickHandler = useCallback(
    (projectId: string, index: number, e?: React.MouseEvent) => {
      // For the active project, just toggle expansion
      if (projectId === activeProject) {
        dispatch({
          type: 'SET_ACTIVE_PROJECT_EXPANDED',
          payload: !state.view.isActiveProjectExpanded,
        });
        return;
      }
      // For other projects, use the normal handler
      projectClickHandler(projectId, index, e);
    },
    [activeProject, state.view.isActiveProjectExpanded, projectClickHandler]
  );

  // Handle delete project - using our mutation
  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    // Stop the click event from propagating to the accordion button
    e.stopPropagation();
    e.preventDefault();

    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  // Don't show local loading state if global loading is active
  if (isLoading && !isGlobalLoading) {
    return (
      <div className="p-4">
        <LoadingState variant="skeleton" skeletonType="project-list" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading projects: {error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  // If no projects, show empty state
  if (!projects || projects.length === 0) {
    return <EmptyProjectList />;
  }

  return (
    <>
      <div className="w-full max-w-full overflow-hidden">
        {/* Active Project Section */}
        {activeProject &&
          (() => {
            // First try to find in the current list
            let activeProjectData = projects.find(p => p.id === activeProject);

            // If not found in list but we have it from separate query, use that
            if (!activeProjectData && activeProjectDetails) {
              // Transform the project data to match the sidebar format
              activeProjectData =
                transformProjectToSidebarFormat(activeProjectDetails);
            }

            // Calculate showNotFound state
            const showNotFound =
              !activeProjectData &&
              !state.loadMore.hasSearchedAllPages &&
              !isFetchingNextPage;

            // If we haven't found it and haven't searched all pages, try to load more
            if (
              showNotFound &&
              hasNextPage &&
              state.loadMore.searchAttempts < MAX_SEARCH_ATTEMPTS
            ) {
              if (!state.loadMore.shouldLoadMore) {
                dispatch({ type: 'SET_SHOULD_LOAD_MORE', payload: true });
              }
            }

            // If we still don't have the project after searching all pages, mark as searched
            if (
              !activeProjectData &&
              !hasNextPage &&
              !state.loadMore.hasSearchedAllPages
            ) {
              dispatch({ type: 'SET_HAS_SEARCHED_ALL_PAGES', payload: true });
            }

            if (activeProjectData) {
              return (
                <div className="mb-3">
                  <p
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider px-4 mb-2',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    Active Project
                  </p>
                  <ProjectListItemShadcn
                    project={activeProjectData}
                    index={0}
                    isActive={true}
                    activeProject={activeProject}
                    activeDocument={activeDocument}
                    expandedIndices={
                      state.view.isActiveProjectExpanded ? [0] : []
                    }
                    projectClickHandler={activeProjectClickHandler}
                    handleDocumentSelect={handleDocumentSelect}
                    handleDeleteProject={handleDeleteProject}
                    isDarkMode={isDarkMode}
                  />
                </div>
              );
            }

            return (
              <div className="mb-3">
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider px-4 mb-2',
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  Active Project
                </p>
                <div
                  className={cn(
                    'rounded-md mx-1 p-4 flex items-center justify-center min-h-[60px]',
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  )}
                >
                  {/* Show different states based on what's happening */}
                  {isFetchingNextPage ||
                  (hasNextPage &&
                    state.loadMore.searchAttempts < MAX_SEARCH_ATTEMPTS) ? (
                    <LoadingState
                      variant="spinner"
                      size="sm"
                      message="Loading project..."
                      transparent={true}
                    />
                  ) : showNotFound ? (
                    <p
                      className={cn(
                        'text-sm',
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      )}
                    >
                      Loading project data...
                    </p>
                  ) : (
                    <LoadingState
                      variant="spinner"
                      size="sm"
                      message="Updating..."
                      transparent={true}
                    />
                  )}
                </div>
                {!hasNextPage && (
                  <Separator
                    className={cn(
                      'mt-3',
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })()}

        {/* All Projects Section */}
        {(state.view.showAllProjects ||
          projects.filter(p => p.id !== activeProject).length > 0) && (
          <div>
            <div
              className={cn(
                'px-4 mb-2 flex justify-between items-center transition-opacity',
                state.view.showAllProjects
                  ? 'opacity-100'
                  : 'opacity-40 hover:opacity-100'
              )}
            >
              {projects.length > 0 && state.view.showAllProjects && (
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  All Projects
                </p>
              )}
              {!state.view.showAllProjects && <div />}{' '}
              {/* Spacer when text is hidden */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-4 h-4 p-0 opacity-60 hover:opacity-100',
                  'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
                  'hover:bg-gray-50 dark:hover:bg-white/5',
                  state.view.showAllProjects ? '' : 'ml-auto mr-2'
                )}
                onClick={toggleShowAllProjects}
              >
                {state.view.showAllProjects ? (
                  <FiEyeOff className="w-3 h-3" />
                ) : (
                  <FiEye className="w-3 h-3" />
                )}
              </Button>
            </div>

            <div
              className={cn(
                'transition-all duration-200 ease-in-out',
                state.view.showAllProjects
                  ? 'opacity-100 max-h-screen'
                  : 'opacity-0 max-h-0 overflow-hidden'
              )}
            >
              <div className="flex flex-col gap-0">
                {projects
                  .filter(project => project.id !== activeProject)
                  .map((project, index) => {
                    const actualIndex = projects.findIndex(
                      p => p.id === project.id
                    );

                    const inventionKey = project.invention
                      ? `${project.id}-${!!project.invention.title}-${project.updatedAt}`
                      : `${project.id}-no-invention-${project.updatedAt}`;

                    return (
                      <ProjectListItemShadcn
                        key={inventionKey}
                        project={project}
                        index={actualIndex}
                        isActive={false}
                        activeProject={activeProject}
                        activeDocument={activeDocument}
                        expandedIndices={[]}
                        projectClickHandler={projectClickHandler}
                        handleDocumentSelect={handleDocumentSelect}
                        handleDeleteProject={handleDeleteProject}
                        isDarkMode={isDarkMode}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Load More button for pagination */}
        {hasNextPage && (
          <div className="mt-4 px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="w-full"
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More Projects'}
            </Button>
          </div>
        )}
      </div>

      {/* Project Switch Modal */}
      <ProjectSwitchModal
        isOpen={state.modal.isOpen}
        targetProject={targetProject}
        onConfirm={handleConfirmSwitch}
        onClose={handleCancel}
        isLoading={false}
      />
    </>
  );
};

export default React.memo(ProjectListShadcn);
