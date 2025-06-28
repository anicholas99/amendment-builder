import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Stack,
  Fade,
  Icon,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { FiPlus } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Layout and contexts
import AppLayout from '@/components/layouts/AppLayout';
import { useTenant } from '@/contexts/TenantContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProject } from '@/hooks/api/useProjects';

// Components
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import {
  ProjectCard,
  ProjectSearchFilter,
  EmptyProjectState,
  DeleteProjectDialog,
} from '@/features/projects/components/dashboard';

// Hooks
import { useProjectDashboard } from '@/features/projects/hooks';
import { useProjectsDashboardTheme } from '@/features/projects/utils/themeValues';

// Utils
import { environment } from '@/config/environment';

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
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={isDarkMode ? 'gray.900' : 'gray.50'}
        overflow="hidden"
        pt="60px"
      >
        <Fade in={isMounted} transition={{ enter: { duration: 0.4 } }}>
          <Box
            as="main"
            p={5}
            flexGrow={1}
            width="100%"
            maxW="1400px"
            mx="auto"
          >
            <Box
              width="100%"
              maxWidth="1200px"
              mx="auto"
              style={{
                background: 'transparent',
              }}
            >
              {/* Static header - renders immediately without waiting for JS */}
              <Box width="100%" mb={6}>
                <Flex
                  direction="row"
                  justify="space-between"
                  align="center"
                  mb={6}
                >
                  <Box>
                    <Heading
                      as="h2"
                      size="lg"
                      fontWeight="700"
                      color={isDarkMode ? 'white' : 'gray.700'}
                      mb={1}
                    >
                      Projects Dashboard
                    </Heading>
                    <Text
                      color={isDarkMode ? 'gray.300' : 'gray.600'}
                      fontSize="md"
                    >
                      Manage your invention projects or create new ones
                    </Text>
                  </Box>
                  <Box mt={4}>
                    <Stack direction="row" spacing={6} align="center">
                      <Box>
                        <Text
                          color={isDarkMode ? 'gray.400' : 'gray.500'}
                          fontSize="sm"
                        >
                          Total Projects
                        </Text>
                        <Text
                          color={isDarkMode ? 'white' : 'gray.700'}
                          fontSize="xl"
                          fontWeight="600"
                        >
                          {projects.length}
                        </Text>
                      </Box>
                      <Button
                        leftIcon={<Icon as={FiPlus} />}
                        colorScheme="blue"
                        onClick={onOpenNewProjectModal}
                        size="md"
                      >
                        New Project
                      </Button>
                    </Stack>
                  </Box>
                </Flex>
              </Box>

              {/* Interactive components load after initial paint */}
              {isMounted && (
                <>
                  {/* Search and Filter Bar */}
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

                  {/* Project List Section */}
                  <Box
                    mt={6}
                    width="100%"
                    maxHeight="calc(100vh - 240px)"
                    overflowY="auto"
                    pr={4}
                    className="custom-scrollbar"
                  >
                    {/* Loading state - show skeleton while actually loading */}
                    {isLoadingProjects && (
                      <SkeletonLoader type="projects-dashboard" count={6} />
                    )}

                    {/* Main project list - only show when not loading */}
                    {!isLoadingProjects &&
                      (projects.length === 0 ? (
                        <EmptyProjectState
                          onOpenNewProjectModal={onOpenNewProjectModal}
                        />
                      ) : (
                        <Stack spacing={4} align="stretch" pb={6}>
                          {projects.map(project => (
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
                                inventionData: {}, // No longer using structuredData
                              }}
                              handleSelectProject={handleSelectProject}
                              handleDeleteProject={handleDeleteProject}
                              handleDocumentSelect={handleDocumentSelect}
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </Stack>
                      ))}
                  </Box>
                </>
              )}
            </Box>

            {/* Loading overlay for project switching */}
            {isAnimating && <LoadingOverlay />}

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
          </Box>
        </Fade>
      </Box>
    </AppLayout>
  );
}

// Server-side props to handle authentication
export const getServerSideProps: GetServerSideProps = async () => {
  // In development, skip auth and return mock session
  if (environment.isDevelopment) {
    return {
      props: {
        sessionData: {
          user: {
            id: 'dev-user',
            email: 'dev@example.com',
            name: 'Development User',
          },
        },
      },
    };
  }

  // Production auth logic here...
  return {
    props: {
      sessionData: null,
    },
  };
};
