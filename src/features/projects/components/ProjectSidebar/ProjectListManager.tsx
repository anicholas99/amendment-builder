/**
 * ProjectListManager - Handles project listing and basic operations
 * Focused component following the architectural blueprint
 */
import React from 'react';
import { Box, Fade } from '@chakra-ui/react';
import CollapsedProjectView from '../CollapsedProjectView';
import ProjectList from '../ProjectList';
import { ProjectListManagerProps } from '../../types/projectSidebar';
import { transformProjectsForSidebar } from '../../utils/projectSidebarUtils';

const ProjectListManager: React.FC<ProjectListManagerProps> = React.memo(
  ({
    projects,
    activeProject,
    activeDocument,
    expandedIndices,
    isSidebarCollapsed,
    isLoading,    // Accept loading state
    error,        // Accept error state
    onProjectClick,
    onDocumentSelect,
    onDocumentHover,
    onExpandedChange,
    onLoadMore,    // Accept load more handler
    hasNextPage,   // Accept pagination state
    isFetchingNextPage,  // Accept fetching state
    children,
  }) => {
    // Transform projects for CollapsedProjectView compatibility
    const collapsedViewProjects = projects.map(p => ({
      // Add index signature compatibility by spreading first
      ...p,
      id: p.id,
      name: p.name,
    }));

    // Transform activeDocument for CollapsedProjectView compatibility
    const collapsedViewActiveDocument = activeDocument
      ? {
          documentType: activeDocument.documentType || null,
        }
      : null;

    return (
      <Box
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        p={isSidebarCollapsed ? 1 : 2}
        mt={1}
        maxWidth="100%"
      >
        <Box display={isSidebarCollapsed ? 'block' : 'none'}>
          <CollapsedProjectView
            key={projects.map(p => p.id + '-' + (p.invention ? 'has-invention' : 'no-invention')).join('-')}
            projects={collapsedViewProjects}
            activeProject={activeProject}
            activeDocument={collapsedViewActiveDocument}
            expandedIndices={expandedIndices}
            isAnimating={false} // Managed by parent
            onOpenModal={() => {}} // Handled by ModalManager
            onProjectClick={onProjectClick}
            onDocumentSelect={onDocumentSelect}
            onLoadMore={onLoadMore}  // Pass load more handler
            hasNextPage={hasNextPage}  // Pass pagination state
            isFetchingNextPage={isFetchingNextPage}  // Pass fetching state
          />
        </Box>
        <Box
          display={!isSidebarCollapsed ? 'block' : 'none'}
          height="100%"
          overflowY="auto"
          overflowX="hidden"
          maxWidth="100%"
        >
          <ProjectList
            projects={projects}  // Pass projects data
            isLoading={isLoading}  // Pass loading state
            error={error}  // Pass error state
            handleProjectClick={onProjectClick}
            expandedIndices={expandedIndices}
            onDocumentSelect={onDocumentSelect}
            onExpandedChange={onExpandedChange || (() => {})}
            onLoadMore={onLoadMore}  // Pass load more handler
            hasNextPage={hasNextPage}  // Pass pagination state
            isFetchingNextPage={isFetchingNextPage}  // Pass fetching state
            // Add hover handler if provided
            {...(onDocumentHover && { handleDocumentHover: onDocumentHover })}
          />
        </Box>
        {children}
      </Box>
    );
  }
);

ProjectListManager.displayName = 'ProjectListManager';

export default ProjectListManager;
