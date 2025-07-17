import React from 'react';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProjects } from '@/hooks/api/useProjects';
import { transformProjectsForSidebar } from '../utils/projectSidebarUtils';
import ProjectListShadcn from './ProjectListShadcn';

interface ExpandedProjectViewProps {
  // Add any necessary props here
}

const ExpandedProjectView: React.FC<ExpandedProjectViewProps> = () => {
  const { activeProjectId } = useProjectData();
  const {
    data: projectsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProjects({
    filterBy: 'all',
    sortBy: 'modified',
    sortOrder: 'desc',
  });

  // Transform the paginated projects data for the sidebar
  const projects = React.useMemo(() => {
    if (!projectsData?.pages) return [];
    const allProjects = projectsData.pages.flatMap(page => page.projects);
    return transformProjectsForSidebar(allProjects);
  }, [projectsData]);

  return (
    <div className="p-4">
      <ProjectListShadcn
        projects={projects}
        isLoading={isLoading}
        error={error}
        handleProjectClick={() => {}}
        onDocumentSelect={() => {}}
        onExpandedChange={() => {}}
        onLoadMore={() => fetchNextPage()}
        hasNextPage={hasNextPage || false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default ExpandedProjectView;
