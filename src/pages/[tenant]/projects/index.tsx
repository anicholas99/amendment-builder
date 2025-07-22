import React, { useState, useEffect, useRef } from 'react';
// This file manages project listing and creation within a tenant context.
// It uses a combination of shadcn/ui components and custom hooks for data fetching.
import { useRouter } from 'next/router';
import { FiPlus, FiSearch, FiChevronDown } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import dynamic from 'next/dynamic';

// Layout and contexts
import AppLayout from '@/components/layouts/AppLayout';
import { useTenant } from '@/contexts/TenantContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProject } from '@/hooks/api/useProjects';

// Components
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { LoadingProjects } from '@/components/common/MinimalSpinner';
import {
  ProjectCard,
  ProjectSearchFilter,
  EmptyProjectState,
  DeleteProjectDialog,
} from '@/features/projects/components/dashboard';

// Hooks
import { useProjectDashboard } from '@/features/projects/hooks';
import { useProjectsDashboardTheme } from '@/features/projects/utils/themeValues';
import { useAuth } from '@/hooks/useAuth';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Lazy load the modal
const NewProjectModal = dynamic(
  () => import('@/features/projects/components/NewProjectModal'),
  {
    ssr: false,
  }
);

export default function Projects() {
  const router = useRouter();
  const { tenant: queryTenant } = router.query;
  const { currentTenant } = useTenant();
  const { isDarkMode } = useThemeContext();
  const [isMounted, setIsMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Get active project ID from our simplified context
  const { activeProjectId } = useProjectData();

  // Use our new consolidated hook
  const {
    // Project data
    projects,
    isLoadingProjects,
    projectsError,

    // Filters
    searchQuery,
    setSearchQuery,
    sortBy,
    handleSortChange,
    filterBy,
    handleFilterChange,

    // Navigation
    isAnimating,
    transitionState,
    handleSelectProject,
    handleDocumentSelect,

    // Modal states
    isNewProjectModalOpen,
    onOpenNewProjectModal,
    onCloseNewProjectModal,
    isDeleteOpen,
    onOpenDelete,
    onCloseDelete,
    projectToDelete,

    // Actions
    handleCreateProject,
    handleDeleteProject,
    confirmDeleteProject,
    isDeleting,
  } = useProjectDashboard();

  // Theme values
  const colorModeValues = useProjectsDashboardTheme(isDarkMode);

  // Active project data (legacy - keeping for compatibility)
  const {
    data: activeProjectData,
    isLoading: isActiveProjectLoading,
    error: activeProjectError,
    refetch: refetchActiveProject,
  } = useProject(activeProjectId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract current tenant from query
  const tenant = typeof queryTenant === 'string' ? queryTenant : undefined;

  return (
    <AppLayout>
      <div
        className={cn(
          'absolute inset-0 overflow-hidden pt-[60px]',
          isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
        )}
      >
        <div
          className={cn(
            'transition-all duration-300 ease-out',
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          )}
        >
          <main className="p-6 flex-grow w-full max-w-[1400px] mx-auto">
            <div className="w-full max-w-[1200px] mx-auto">
              {/* Clean Header Design */}
              <div className="mb-8">
                <div
                  className={cn(
                    'rounded-xl border p-8',
                    isDarkMode
                      ? 'bg-gray-900 border-gray-800'
                      : 'bg-white border-gray-200 shadow-sm'
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                      <h1
                        className={cn(
                          'text-3xl font-semibold tracking-tight',
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        )}
                      >
                        Amendment Builder
                      </h1>
                      <p
                        className={cn(
                          'text-base',
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        )}
                      >
                        Respond to Office Actions with AI-powered amendment
                        generation
                      </p>
                                              <div className="flex items-center gap-6 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            )}
                          >
                            {projects?.length || 0} Office Action Responses
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={onOpenNewProjectModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
                      >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Create New Project
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {isMounted && (
                <>
                  {/* Clean Search and Filter Bar */}
                  <div className="mb-6 transition-opacity duration-300 ease-out">
                    <div
                      className={cn(
                        'rounded-xl border',
                        isDarkMode
                          ? 'bg-gray-900 border-gray-800'
                          : 'bg-white border-gray-200 shadow-sm'
                      )}
                    >
                      <ProjectSearchFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={handleSortChange}
                        filterBy={filterBy}
                        onFilterChange={handleFilterChange}
                        projectCount={projects.length}
                        filteredCount={projects.length}
                      />
                    </div>
                  </div>

                  {/* Project List Section */}
                  <div
                    className={cn(
                      'w-full max-h-[calc(100vh-420px)] overflow-y-auto px-2 pt-4',
                      'custom-scrollbar scroll-smooth'
                    )}
                  >
                    {/* Minimal loading state */}
                    {isLoadingProjects && <LoadingProjects />}

                    {/* Main project list - only show when not loading */}
                    {!isLoadingProjects &&
                      (projects.length === 0 ? (
                        <div className="animate-fade-in duration-300">
                          <EmptyProjectState
                            onOpenNewProjectModal={onOpenNewProjectModal}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4 pb-6">
                          {projects.map((project, index) => (
                            <ProjectCard
                              key={project.id}
                              project={{
                                id: project.id,
                                name: project.name,
                                createdAt:
                                  project.createdAt instanceof Date
                                    ? project.createdAt.toISOString()
                                    : project.createdAt,
                                lastUpdated: project.lastUpdated,
                                applicationNumber: (project as any).patentApplication?.applicationNumber,
                                inventionData: {}, // No longer using structuredData
                              }}
                              handleSelectProject={handleSelectProject}
                              handleDeleteProject={handleDeleteProject}
                              handleDocumentSelect={handleDocumentSelect}
                              isDarkMode={isDarkMode}
                              index={index}
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>

            {/* Enhanced loading overlay for project switching */}
            {isAnimating && (
              <LoadingOverlay
                title={
                  transitionState?.targetProjectName
                    ? `Loading ${transitionState.targetProjectName}`
                    : 'Loading Project'
                }
                subtitle={
                  transitionState?.targetView ||
                  'Preparing your project data...'
                }
              />
            )}

            {/* New Project Modal */}
            <NewProjectModal
              isOpen={isNewProjectModalOpen}
              onClose={onCloseNewProjectModal}
              handleCreateProject={handleCreateProject}
            />

            {/* Delete Project Dialog */}
            <DeleteProjectDialog
              isOpen={isDeleteOpen}
              onClose={onCloseDelete}
              onConfirm={confirmDeleteProject}
              projectName={projectToDelete?.name || ''}
              cancelRef={cancelRef}
              isDeleting={isDeleting}
            />
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
