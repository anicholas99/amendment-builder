import React, { useCallback, useState, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  VStack,
  Button,
  Spinner,
  Text,
  Accordion,
  useToast,
  Divider,
  IconButton,
  HStack,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useDeleteProject } from '../hooks';
import { FiChevronDown, FiChevronUp, FiEye, FiEyeOff } from 'react-icons/fi';

import { useProjectData } from '@/contexts/ProjectDataContext';
import { useActiveDocument } from '@/contexts/ActiveDocumentContext';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { ProjectData } from '@/types/project';
import { ProjectSidebarProject } from '../types/projectSidebar';
import {
  ProjectListItem,
  ProjectSwitchModal,
  EmptyProjectList,
} from './project-list';

// Add interface for ProjectList props
interface ProjectListProps {
  projects: ProjectSidebarProject[];  // Accept sidebar projects from parent
  isLoading?: boolean;      // Accept loading state from parent
  error?: Error | null;     // Accept error state from parent
  handleProjectClick?: (
    projectId: string,
    index: number,
    e?: React.MouseEvent
  ) => void;
  expandedIndices: number[];
  onDocumentSelect?: (projectId: string, documentType: string) => void;
  onExpandedChange: (indices: number[]) => void;
  onLoadMore?: () => void;  // For pagination
  hasNextPage?: boolean;     // For pagination
  isFetchingNextPage?: boolean;  // For pagination
}

/**
 * Efficient non-virtualized project list component
 */
const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading = false,
  error = null,
  handleProjectClick,
  expandedIndices,
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

  const router = useRouter();
  const toast = useToast();
  const { isDarkMode } = useThemeContext();

  // Modal state for project switching
  const [isOpen, setIsOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string | null>(null);
  const [targetDocumentType, setTargetDocumentType] = useState<string | null>(
    null
  );
  
  // Add state for active project expansion
  const [isActiveProjectExpanded, setIsActiveProjectExpanded] = useState(true);
  
  // Add state for showing/hiding all projects with localStorage persistence
  const [showAllProjects, setShowAllProjects] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-show-all-projects');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  
  // Save preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-show-all-projects', JSON.stringify(showAllProjects));
    }
  }, [showAllProjects]);

  // Auto-expand the active project when it changes
  useEffect(() => {
    setIsActiveProjectExpanded(true);
  }, [activeProject]);

  // Auto-expand the active project when it changes, but only on initial mount
  // Only do this if we're managing internal state
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
  }, []); // Empty dependency array - only run on mount

  // Find target project for modal
  const targetProject = projects.find(p => p.id === targetProjectId) || null;

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
    if (!targetProjectId) {
      setIsOpen(false);
      return;
    }

    try {
      const project = projects.find(p => p.id === targetProjectId);
      if (project) {
        setActiveProject(targetProjectId);

        if (targetDocumentType) {
          const { tenant = 'development' } = router.query;
          router.push(
            `/${tenant}/projects/${targetProjectId}/${targetDocumentType}`
          );
        } else {
          // Default to technology view when opening project without specifying a doc type
          const { tenant = 'development' } = router.query;
          router.push(`/${tenant}/projects/${targetProjectId}/technology`);
        }
      }

      setIsOpen(false);
    } catch (error) {
      logger.error('Error switching project:', error);
      toast({
        title: 'Failed to switch project',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  // Cancel handler for project switch modal
  const handleCancel = () => {
    setIsOpen(false);
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
        setTargetProjectId(projectId);
        setTargetDocumentType(documentType);
        setIsOpen(true);
      } else {
        // Same project, just navigate
        const { tenant = 'development' } = router.query;
        router.push(`/${tenant}/projects/${projectId}/${documentType}`);
      }
    },
    [activeProject, setIsOpen, router, externalOnDocumentSelect]
  );

  // Handle project selection with confirmation
  const oldHandleProjectSelect = useCallback(
    (projectId: string) => {
      if (projectId !== activeProject) {
        // Show confirmation for project switch
        setTargetProjectId(projectId);
        setTargetDocumentType(null);
        setIsOpen(true);
      }
    },
    [activeProject, setIsOpen]
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

  // Show loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">Error loading projects: {error.message}</Text>
        <Button onClick={() => window.location.reload()} mt={2}>
          Retry
        </Button>
      </Box>
    );
  }

  // If no projects, show empty state
  if (!projects || projects.length === 0) {
    return <EmptyProjectList />;
  }

  return (
    <>
      <Box width="100%" maxWidth="100%" overflow="hidden">
        {/* Active Project Section */}
        {activeProject && (() => {
          const activeProjectData = projects.find(p => p.id === activeProject);
          
          // If active project is not found in current pages, show a loading placeholder and try to load more
          if (!activeProjectData) {
            // Auto-load more pages if we haven't found the active project yet
            if (hasNextPage && !isFetchingNextPage) {
              // Use setTimeout to avoid calling onLoadMore during render
              setTimeout(() => {
                onLoadMore?.();
              }, 0);
            }
            
            return (
              <Box mb={3}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color={isDarkMode ? 'gray.400' : 'gray.600'}
                  textTransform="uppercase"
                  letterSpacing="wider"
                  px={3}
                  mb={2}
                >
                  Active Project
                </Text>
                <Box
                  borderRadius="md"
                  bg={isDarkMode ? 'gray.800' : 'gray.50'}
                  mx={1}
                  p={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="60px"
                >
                  {/* Don't show loading state, just show nothing or a subtle placeholder */}
                  {!hasNextPage && (
                    <Text fontSize="sm" color={isDarkMode ? 'gray.400' : 'gray.600'}>
                      Active project not found
                    </Text>
                  )}
                </Box>
                {!hasNextPage && (
                  <Divider 
                    mt={3} 
                    borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
                  />
                )}
              </Box>
            );
          }
          
          const activeProjectIndex = projects.findIndex(p => p.id === activeProject);
          
          return (
            <Box mb={3}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={isDarkMode ? 'gray.400' : 'gray.600'}
                textTransform="uppercase"
                letterSpacing="wider"
                px={3}
                mb={2}
              >
                Active Project
              </Text>
              <Box
                borderRadius="md"
                bg={isDarkMode ? 'gray.800' : 'gray.50'}
                mx={1}
                p={1}
              >
                <Accordion
                  allowToggle
                  index={isActiveProjectExpanded ? [0] : []}
                  onChange={() => setIsActiveProjectExpanded(!isActiveProjectExpanded)}
                  reduceMotion
                >
                  <VStack align="stretch" spacing={0}>
                    <ProjectListItem
                      key={`active-${activeProjectData.id}`}
                      project={activeProjectData}
                      index={0}
                      isActive={true}
                      activeProject={activeProject}
                      activeDocument={activeDocument}
                      expandedIndices={isActiveProjectExpanded ? [0] : []}
                      projectClickHandler={(projectId, _, e) => {
                        // Active project is already selected, no need to switch
                      }}
                      handleDocumentSelect={handleDocumentSelect}
                      handleDeleteProject={handleDeleteProject}
                      isDarkMode={isDarkMode}
                    />
                  </VStack>
                </Accordion>
              </Box>
              <Divider 
                mt={3} 
                borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
              />
            </Box>
          );
        })()}

        {/* All Projects Section */}
        {(showAllProjects || projects.filter(p => p.id !== activeProject).length > 0) && (
          <Box>
            <HStack
              px={3}
              mb={showAllProjects ? 2 : 0}
              justify="space-between"
              align="center"
              opacity={showAllProjects ? 1 : 0.4}
              transition="opacity 0.2s"
              _hover={{ opacity: 1 }}
            >
              {projects.length > 0 && showAllProjects && (
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color={isDarkMode ? 'gray.400' : 'gray.600'}
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  All Projects
                </Text>
              )}
              {!showAllProjects && <Box />} {/* Spacer when text is hidden */}
              <IconButton
                aria-label={showAllProjects ? "Hide all projects" : "Show all projects"}
                icon={showAllProjects ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                size="xs"
                variant="ghost"
                color={isDarkMode ? 'gray.500' : 'gray.500'}
                onClick={() => setShowAllProjects(!showAllProjects)}
                opacity={0.6}
                _hover={{
                  opacity: 1,
                  color: isDarkMode ? 'gray.300' : 'gray.700',
                  bg: isDarkMode ? 'whiteAlpha.50' : 'gray.50',
                }}
                ml={showAllProjects ? 0 : 'auto'}
                mr={showAllProjects ? 0 : 2}
              />
            </HStack>
            
            <Collapse in={showAllProjects} animateOpacity>
              <Accordion
                allowToggle
                index={[]}
                onChange={() => {}}
                reduceMotion
              >
                <VStack align="stretch" spacing={1} px={0} pb={2}>
                  {projects
                    .filter(project => project.id !== activeProject) // Filter out active project
                    .map((project: ProjectSidebarProject, originalIndex: number) => {
                      // Find the actual index in the full projects array
                      const actualIndex = projects.findIndex(p => p.id === project.id);
                      return (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          index={actualIndex}
                          isActive={false} // Never active in this section
                          activeProject={activeProject}
                          activeDocument={activeDocument}
                          expandedIndices={[]} // Always pass empty array to keep all projects collapsed
                          projectClickHandler={projectClickHandler}
                          handleDocumentSelect={handleDocumentSelect}
                          handleDeleteProject={handleDeleteProject}
                          isDarkMode={isDarkMode}
                        />
                      );
                    })}
                </VStack>
              </Accordion>
            </Collapse>
            
            {/* Load More button for pagination - moved outside Collapse so it's always accessible */}
            {hasNextPage && showAllProjects && (
              <Box display="flex" justifyContent="center" mt={4} mb={2}>
                <Button
                  onClick={onLoadMore}
                  isLoading={isFetchingNextPage}
                  loadingText="Loading more..."
                  variant="outline"
                  size="sm"
                  opacity={isFetchingNextPage ? 1 : 0.6}
                  _hover={{ opacity: 1 }}
                >
                  Load More Projects
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Project Switch Modal */}
      <ProjectSwitchModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirmSwitch}
        targetProject={targetProject}
        isLoading={false}
      />
    </>
  );
};

export default ProjectList;
