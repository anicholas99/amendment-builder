import React, { useCallback } from 'react';
import {
  Box,
  VStack,
  Tooltip,
  Icon,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Text,
  Collapse,
  Spinner,
  HStack,
} from '@chakra-ui/react';
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
import { DocumentType } from '@/types/project';
import { logger } from '@/lib/monitoring/logger';
import {
  MdOutlineScience,
  MdOutlineEditNote,
  MdOutlineDescription,
  MdOutlineLightbulb,
  MdOutlineFolderOpen,
} from 'react-icons/md';
import { useColorModeValue } from '@chakra-ui/react';
import { hasProcessedInvention } from '@/features/technology-details/utils/inventionUtils';

interface Project {
  id: string;
  name: string;
  invention?: { id: string; title?: string; description?: string; abstract?: string } | null;
  [key: string]: unknown;
}

interface CollapsedProjectViewProps {
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
  onLoadMore?: () => void;  // For pagination
  hasNextPage?: boolean;     // For pagination
  isFetchingNextPage?: boolean;  // For pagination
}

const CollapsedProjectView: React.FC<CollapsedProjectViewProps> = ({
  projects,
  activeProject,
  activeDocument,
  expandedIndices,
  isAnimating,
  onOpenModal: _onOpenModal,
  onProjectClick,
  onDocumentSelect,
  onLoadMore,
  hasNextPage = false,
  isFetchingNextPage = false,
}) => {
  // Move all color values outside of render
  const activeProjectBg = useColorModeValue('blue.600', 'blue.600');
  const inactiveProjectBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const activeProjectColor = useColorModeValue('white', 'white');
  const inactiveProjectColor = useColorModeValue('gray.600', 'gray.300');
  const inactiveProjectHoverBg = useColorModeValue(
    'gray.200',
    'whiteAlpha.200'
  );
  const menuBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const newProjectBtnBg = useColorModeValue('blue.500', 'blue.500');
  const newProjectBtnHoverBg = useColorModeValue('blue.400', 'blue.400');
  const newProjectBtnColor = useColorModeValue('white', 'white');
  const { isDarkMode } = useThemeContext();
  
  // Add state for active project expansion
  const [isActiveProjectExpanded, setIsActiveProjectExpanded] = React.useState(true);
  
  // Add state for showing/hiding all projects with localStorage persistence
  const [showAllProjects, setShowAllProjects] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-show-all-projects');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  
  // Save preference to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-show-all-projects', JSON.stringify(showAllProjects));
    }
  }, [showAllProjects]);
  
  // Auto-expand the active project when it changes
  React.useEffect(() => {
    setIsActiveProjectExpanded(true);
  }, [activeProject]);

  const handleProjectClick = useCallback(
    (project: Project, index: number) => {
      // Create a safe event object without circular references
      const safeEvent = {
        stopPropagation: () => {},
        preventDefault: () => {},
      } as unknown as React.MouseEvent;

      // Call the handler with cloned data to prevent reference leaks
      onProjectClick(String(project.id), index, safeEvent);
    },
    [onProjectClick]
  );

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
    onDocumentSelect,
    isDarkMode,
  }) => {
    const isExpanded =
      Array.isArray(expandedIndices) && expandedIndices.includes(index);

    // Check if invention has been processed
    const inventionProcessed = hasProcessedInvention(project.invention ?? null);
    
    // Debug logging
    logger.debug('[CollapsedProjectView] Checking invention processed state', {
      projectId: project.id,
      inventionProcessed,
      inventionData: project.invention,
      hasTitle: !!project.invention?.title,
      hasFeatures: Array.isArray(project.invention?.features) && project.invention.features.length > 0,
    });

    return (
      <AccordionItem my={1} border="none">
        <AccordionButton
          p={0}
          justifyContent="center"
          _focus={{ boxShadow: 'none' }}
        >
          <Tooltip label={project.name} placement="right" openDelay={400}>
            <Box
              w="40px"
              h="40px"
              borderRadius="md"
              bg={
                isActive
                  ? isDarkMode
                    ? 'whiteAlpha.200'
                    : 'gray.200'
                  : 'transparent'
              }
              color={
                isActive
                  ? isDarkMode
                    ? 'blue.300'
                    : 'blue.400'
                  : isDarkMode
                    ? 'gray.500'
                    : 'gray.500'
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              transition="background-color 0.15s ease-out"
              onClick={e => handleProjectClick(project, index)}
              _hover={{
                bg: isDarkMode ? 'whiteAlpha.200' : 'gray.100',
              }}
            >
              <Icon
                as={isExpanded ? FiFolderPlus : FiFolder}
                boxSize={5}
                color={
                  isActive
                    ? isDarkMode
                      ? 'blue.300'
                      : 'blue.400'
                    : isDarkMode
                      ? 'gray.500'
                      : 'gray.500'
                }
                transition="color 0.15s ease-out"
              />
            </Box>
          </Tooltip>
        </AccordionButton>

        {/* Show navigation icons when project is expanded - with smooth transitions */}
        {isExpanded && (
          <AccordionPanel>
            <VStack spacing={2} mt={2} align="center" width="full">
              <Tooltip label="Technology Details" placement="right">
                <IconButton
                  aria-label="Technology Details"
                  icon={<FiLayers />}
                  size="sm"
                  variant={
                    isActive && activeDocument?.documentType === 'technology'
                      ? 'solid'
                      : 'ghost'
                  }
                  colorScheme={
                    isActive && activeDocument?.documentType === 'technology'
                      ? 'blue'
                      : 'gray'
                  }
                  onClick={e => handleDocumentClick(project.id, 'technology')}
                  transition="background-color 0.15s ease-out"
                  _hover={{
                    transform: 'scale(1.05)',
                    bg:
                      isActive && activeDocument?.documentType === 'technology'
                        ? isDarkMode
                          ? 'blue.600'
                          : 'blue.600'
                        : isDarkMode
                          ? 'gray.700'
                          : 'gray.200',
                  }}
                />
              </Tooltip>

              <Tooltip label="Claim Refinement" placement="right">
                <IconButton
                  aria-label="Claim Refinement"
                  icon={<FiEdit />}
                  size="sm"
                  variant={
                    isActive &&
                    activeDocument?.documentType === 'claim-refinement'
                      ? 'solid'
                      : 'ghost'
                  }
                  colorScheme={
                    isActive &&
                    activeDocument?.documentType === 'claim-refinement'
                      ? 'blue'
                      : 'gray'
                  }
                  isDisabled={!inventionProcessed}
                  opacity={inventionProcessed ? 1 : 0.5}
                  cursor={inventionProcessed ? 'pointer' : 'not-allowed'}
                  onClick={() =>
                    inventionProcessed &&
                    handleDocumentClick(project.id, 'claim-refinement')
                  }
                  transition="background-color 0.15s ease-out"
                  _hover={{
                    transform: inventionProcessed ? 'scale(1.05)' : 'none',
                    bg:
                      isActive &&
                      activeDocument?.documentType === 'claim-refinement'
                        ? isDarkMode
                          ? 'blue.600'
                          : 'blue.600'
                        : !inventionProcessed
                          ? 'transparent'
                          : isDarkMode
                            ? 'gray.700'
                            : 'gray.200',
                  }}
                />
              </Tooltip>

              <Tooltip label="Patent Application" placement="right">
                <IconButton
                  aria-label="Patent Application"
                  icon={<FiFileText />}
                  size="sm"
                  variant={
                    isActive && activeDocument?.documentType === 'patent'
                      ? 'solid'
                      : 'ghost'
                  }
                  colorScheme={
                    isActive && activeDocument?.documentType === 'patent'
                      ? 'blue'
                      : 'gray'
                  }
                  isDisabled={!inventionProcessed}
                  opacity={inventionProcessed ? 1 : 0.5}
                  cursor={inventionProcessed ? 'pointer' : 'not-allowed'}
                  onClick={() =>
                    inventionProcessed &&
                    handleDocumentClick(project.id, 'patent')
                  }
                  transition="background-color 0.15s ease-out"
                  _hover={{
                    transform: inventionProcessed ? 'scale(1.05)' : 'none',
                    bg:
                      isActive && activeDocument?.documentType === 'patent'
                        ? isDarkMode
                          ? 'blue.600'
                          : 'blue.600'
                        : !inventionProcessed
                          ? 'transparent'
                          : isDarkMode
                            ? 'gray.700'
                            : 'gray.200',
                  }}
                />
              </Tooltip>
            </VStack>
          </AccordionPanel>
        )}
      </AccordionItem>
    );
  };

  return (
    <Box
      width="full"
      height="full"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={2}
    >
      {projects.length > 0 ? (
        <>
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
                <Box width="full" mb={2}>
                  <Tooltip label="Active Project" placement="right">
                    <Box
                      width="full"
                      display="flex"
                      justifyContent="center"
                      mb={2}
                    >
                      <Icon
                        as={MdOutlineFolderOpen}
                        color={isDarkMode ? 'blue.300' : 'blue.500'}
                        boxSize={4}
                      />
                    </Box>
                  </Tooltip>
                  <Box
                    borderRadius="md"
                    bg={isDarkMode ? 'whiteAlpha.100' : 'gray.100'}
                    p={2}
                    mb={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="40px"
                  >
                    {hasNextPage ? (
                      <Tooltip label="Loading active project..." placement="right">
                        <Spinner size="sm" color={isDarkMode ? 'blue.300' : 'blue.500'} />
                      </Tooltip>
                    ) : (
                      <Tooltip label="Active project not found" placement="right">
                        <Icon
                          as={FiFolder}
                          boxSize={4}
                          color={isDarkMode ? 'gray.500' : 'gray.400'}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Divider 
                    borderColor={isDarkMode ? 'whiteAlpha.200' : 'gray.300'}
                  />
                </Box>
              );
            }
            
            const activeProjectIndex = projects.findIndex(p => p.id === activeProject);
            
            return (
              <Box width="full" mb={2}>
                <Tooltip label="Active Project" placement="right">
                  <Box
                    width="full"
                    display="flex"
                    justifyContent="center"
                    mb={2}
                  >
                    <Icon
                      as={MdOutlineFolderOpen}
                      color={isDarkMode ? 'blue.300' : 'blue.500'}
                      boxSize={4}
                    />
                  </Box>
                </Tooltip>
                <Box
                  borderRadius="md"
                  bg={isDarkMode ? 'whiteAlpha.100' : 'gray.100'}
                  p={1}
                  mb={2}
                >
                  <Accordion
                    allowToggle
                    width="full"
                    index={isActiveProjectExpanded ? [0] : []}
                    onChange={() => setIsActiveProjectExpanded(!isActiveProjectExpanded)}
                  >
                    <CollapsedProjectItem
                      key={`active-${activeProjectData.id}`}
                      project={activeProjectData}
                      index={0}
                      isActive={true}
                      activeDocument={activeDocument}
                      expandedIndices={isActiveProjectExpanded ? [0] : []}
                      onProjectClick={(projectId, _, e) => {
                        // Active project is already selected
                      }}
                      onDocumentSelect={onDocumentSelect}
                      isDarkMode={isDarkMode}
                    />
                  </Accordion>
                </Box>
                <Divider 
                  borderColor={isDarkMode ? 'whiteAlpha.200' : 'gray.300'}
                />
              </Box>
            );
          })()}

          {/* All Projects Section */}
          {(showAllProjects || projects.filter(p => p.id !== activeProject).length > 0) && (
            <Box width="full" mt={2}>
              <Box
                opacity={showAllProjects ? 1 : 0.4}
                transition="opacity 0.2s"
                _hover={{ opacity: 1 }}
                display="flex"
                justifyContent="center"
              >
                <Tooltip label={showAllProjects ? "Hide all projects" : "Show all projects"} placement="right">
                  <IconButton
                    aria-label={showAllProjects ? "Hide all projects" : "Show all projects"}
                    icon={<Icon as={showAllProjects ? FiEyeOff : FiEye} boxSize={3} />}
                    size="xs"
                    variant="ghost"
                    color={isDarkMode ? 'gray.500' : 'gray.500'}
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    mb={showAllProjects ? 2 : 0}
                    opacity={0.6}
                    _hover={{
                      opacity: 1,
                      color: isDarkMode ? 'gray.300' : 'gray.700',
                      bg: isDarkMode ? 'whiteAlpha.100' : 'gray.100',
                    }}
                  />
                </Tooltip>
              </Box>
              
              <Collapse in={showAllProjects} animateOpacity>
                <Accordion
                  allowToggle
                  width="full"
                  index={[]}
                  onChange={() => {}}
                >
                  {projects
                    .filter(project => project.id !== activeProject)
                    .map((project, originalIndex) => {
                      const actualIndex = projects.findIndex(p => p.id === project.id);
                      
                      const inventionKey = project.invention ? 
                        `${project.id}-${!!project.invention.title}-${!!project.invention.features}-${!!project.invention.abstract}-${!!project.invention.components}-${!!project.invention.advantages}` : 
                        `${project.id}-no-invention`;
                      
                      return (
                        <CollapsedProjectItem
                          key={inventionKey}
                          project={project}
                          index={actualIndex}
                          isActive={false}
                          activeDocument={activeDocument}
                          expandedIndices={[]}
                          onProjectClick={onProjectClick}
                          onDocumentSelect={onDocumentSelect}
                          isDarkMode={isDarkMode}
                        />
                      );
                    })}
                </Accordion>
              </Collapse>
            </Box>
          )}
          
          {/* Load More button for pagination - always accessible */}
          {hasNextPage && (
            <Box width="full" mt={2} display="flex" justifyContent="center">
              <Tooltip label="Load More Projects" placement="right">
                <IconButton
                  aria-label="Load More Projects"
                  icon={isFetchingNextPage ? <Spinner size="xs" /> : <Icon as={FiFolder} boxSize={3} />}
                  size="xs"
                  variant="outline"
                  onClick={onLoadMore}
                  isLoading={isFetchingNextPage}
                  opacity={0.8}
                  _hover={{
                    opacity: 1,
                    bg: isDarkMode ? 'whiteAlpha.100' : 'gray.100',
                  }}
                />
              </Tooltip>
            </Box>
          )}
        </>
      ) : null}

      {/* Removed New Project button to reduce redundancy with Projects dashboard */}
    </Box>
  );
};

export default CollapsedProjectView;
