/**
 * ProjectListManager - Handles project listing and basic operations
 * Focused component following the architectural blueprint
 */
import React from 'react';
import CollapsedProjectViewShadcn from '../CollapsedProjectViewShadcn';
import ProjectListShadcn from '../ProjectListShadcn';
import { ProjectListManagerProps } from '../../types/projectSidebar';
import { transformProjectsForSidebar } from '../../utils/projectSidebarUtils';
import { cn } from '@/lib/utils';

const ProjectListManager: React.FC<ProjectListManagerProps> = React.memo(
  ({
    projects,
    activeProject,
    activeDocument,
    expandedIndices,
    isSidebarCollapsed,
    isLoading, // Accept loading state
    error, // Accept error state
    onProjectClick,
    onDocumentSelect,
    onDocumentHover,
    onExpandedChange,
    onLoadMore, // Accept load more handler
    hasNextPage, // Accept pagination state
    isFetchingNextPage, // Accept fetching state
    children,
  }) => {
    // Transform projects for CollapsedProjectView compatibility
    const collapsedViewProjects = projects.map(p => ({
      // Add index signature compatibility by spreading first
      ...p,
      id: p.id,
      name: p.name,
      hasProcessedInvention: p.hasProcessedInvention,
    }));

    // Transform activeDocument for CollapsedProjectView compatibility
    const collapsedViewActiveDocument = activeDocument
      ? {
          documentType: activeDocument.documentType || null,
        }
      : null;

    return (
      <div
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden mt-1 max-w-full',
          isSidebarCollapsed ? 'p-1' : 'p-2'
        )}
      >
        <div className={cn(isSidebarCollapsed ? 'block' : 'hidden')}>
          <CollapsedProjectViewShadcn
            key={projects
              .map(
                p =>
                  p.id + '-' + (p.invention ? 'has-invention' : 'no-invention')
              )
              .join('-')}
            projects={collapsedViewProjects}
            activeProject={activeProject}
            activeDocument={collapsedViewActiveDocument}
            expandedIndices={expandedIndices}
            isAnimating={false} // Managed by parent
            onOpenModal={() => {}} // Handled by ModalManager
            onProjectClick={onProjectClick}
            onDocumentSelect={onDocumentSelect}
            onLoadMore={onLoadMore} // Pass load more handler
            hasNextPage={hasNextPage} // Pass pagination state
            isFetchingNextPage={isFetchingNextPage} // Pass fetching state
          />
        </div>
        <div
          className={cn(
            'h-full overflow-y-auto overflow-x-hidden max-w-full',
            !isSidebarCollapsed ? 'block' : 'hidden'
          )}
        >
          <ProjectListShadcn
            projects={projects} // Pass projects data
            isLoading={isLoading} // Pass loading state
            error={error} // Pass error state
            handleProjectClick={onProjectClick}
            onDocumentSelect={onDocumentSelect}
            onExpandedChange={onExpandedChange || (() => {})}
            onLoadMore={onLoadMore} // Pass load more handler
            hasNextPage={hasNextPage} // Pass pagination state
            isFetchingNextPage={isFetchingNextPage} // Pass fetching state
            // Add hover handler if provided
            {...(onDocumentHover && { handleDocumentHover: onDocumentHover })}
          />
        </div>
        {children}
      </div>
    );
  }
);

ProjectListManager.displayName = 'ProjectListManager';

export default ProjectListManager;
