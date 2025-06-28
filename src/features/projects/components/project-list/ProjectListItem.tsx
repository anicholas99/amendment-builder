// TODO: This component is deprecated and relies on a legacy `structuredData` prop.
// It uses a local `Project` interface and passes outdated props to child components.
// It should be rebuilt using the new Invention model and hooks.
import React from 'react';
import {
  Box,
  AccordionItem,
  AccordionPanel,
  Flex,
  Icon,
  Text,
  AccordionButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiFolder,
  FiFolderPlus,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { DocumentLink } from './DocumentLink';
import { ProjectData } from '@/types/project';
import { ProjectSidebarProject } from '../../types/projectSidebar';
import { hasProcessedInvention } from '@/features/technology-details/utils/inventionUtils';

// Custom styled accordion button with hover effect
const CustomAccordionButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof AccordionButton>
>((props, ref) => (
  <AccordionButton
    ref={ref}
    {...props}
    transition="background-color 0.15s ease-out"
    _hover={{
      ...props._hover,
    }}
  />
));

CustomAccordionButton.displayName = 'CustomAccordionButton';

interface DocumentType {
  projectId: string;
  documentType: string;
  content: string;
}

export interface ProjectListItemProps {
  project: ProjectSidebarProject;
  index: number;
  isActive: boolean;
  activeProject: string | null;
  activeDocument: DocumentType | null;
  expandedIndices: number[];
  setExpandedIndices?: React.Dispatch<React.SetStateAction<number[]>>;
  projectClickHandler: (
    projectId: string,
    index: number,
    e?: React.MouseEvent
  ) => void;
  handleDocumentSelect: (projectId: string, documentType: string) => void;
  handleDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  isDarkMode: boolean;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = React.memo(
  ({
    project,
    index,
    isActive,
    activeProject,
    activeDocument,
    expandedIndices,
    setExpandedIndices,
    projectClickHandler,
    handleDocumentSelect,
    handleDeleteProject,
    isDarkMode,
  }) => {
    const isExpanded =
      Array.isArray(expandedIndices) && expandedIndices.includes(index);

    // Check if invention has been processed
    const inventionProcessed = hasProcessedInvention(project.invention ?? null);

    return (
      <AccordionItem key={project.id} border="none" mb={2}>
        {({ isExpanded: isAccordionExpanded }) => (
          <>
            <CustomAccordionButton
              py={2}
              px={3}
              bg={
                isActive ? (isDarkMode ? 'blue.900' : 'blue.50') : 'transparent'
              }
              color={
                isActive
                  ? isDarkMode
                    ? 'blue.200'
                    : 'blue.700'
                  : isDarkMode
                    ? 'gray.300'
                    : 'gray.700'
              }
              _hover={{ bg: isDarkMode ? 'gray.700' : 'gray.100' }}
              borderRadius="md"
              className={`project-item ${isActive ? 'active' : ''}`}
              boxShadow={
                isActive
                  ? isDarkMode
                    ? 'inset 0 0 0 1px rgba(66, 153, 225, 0.3)'
                    : 'inset 0 0 0 1px rgba(66, 153, 225, 0.3)'
                  : 'none'
              }
              width="100%"
              maxWidth="100%"
              onClick={e => projectClickHandler(project.id, index, e)}
            >
              <Flex
                align="center"
                flex="1"
                height="24px"
                maxWidth="100%"
                overflow="hidden"
              >
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  w="24px"
                  h="24px"
                  borderRadius="md"
                  bg={
                    isActive
                      ? isDarkMode
                        ? 'blue.800'
                        : 'blue.100'
                      : isDarkMode
                        ? 'gray.800'
                        : 'gray.50'
                  }
                  mr={2.5}
                  transition="background-color 0.15s ease-out"
                  flexShrink={0}
                >
                  <Icon
                    as={isExpanded ? FiFolderPlus : FiFolder}
                    color={
                      isActive
                        ? isDarkMode
                          ? 'blue.300'
                          : 'blue.500'
                        : isDarkMode
                          ? 'gray.400'
                          : 'gray.500'
                    }
                    fontSize="15px"
                  />
                </Flex>
                <Flex
                  align="center"
                  flex="1"
                  position="relative"
                  height="24px"
                  overflow="hidden"
                >
                  <Text
                    fontWeight={isActive ? 'medium' : 'normal'}
                    fontSize="sm"
                    transition="font-weight 0.15s ease-out"
                    flex="1"
                    lineHeight="24px"
                    display="flex"
                    alignItems="center"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxWidth="calc(100% - 10px)"
                  >
                    <Tooltip
                      label={project.name}
                      placement="top"
                      openDelay={500}
                      isDisabled={project.name.length < 20}
                    >
                      <Box as="span" overflow="hidden" textOverflow="ellipsis">
                        {project.name}
                      </Box>
                    </Tooltip>
                  </Text>
                </Flex>
              </Flex>
              <Icon
                as={isExpanded ? FiChevronDown : FiChevronRight}
                color={isDarkMode ? 'gray.400' : 'gray.500'}
                transition="transform 0.15s ease-out"
                transform={isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'}
                flexShrink={0}
                ml={2}
              />
            </CustomAccordionButton>

            <AccordionPanel pb={2} px={2} maxWidth="100%" overflow="hidden">
              <Box maxWidth="100%" overflow="hidden">
                <DocumentLink
                  projectId={project.id}
                  documentType="technology"
                  label="Technology Details"
                  isActive={
                    activeProject === project.id &&
                    activeDocument?.documentType === 'technology'
                  }
                  onClick={handleDocumentSelect}
                />
                <DocumentLink
                  projectId={project.id}
                  documentType="claim-refinement"
                  label="Claim Refinement"
                  isActive={
                    activeProject === project.id &&
                    activeDocument?.documentType === 'claim-refinement'
                  }
                  isDisabled={!inventionProcessed}
                  onClick={handleDocumentSelect}
                />
                <DocumentLink
                  projectId={project.id}
                  documentType="patent"
                  label="Patent Application"
                  isActive={
                    activeProject === project.id &&
                    activeDocument?.documentType === 'patent'
                  }
                  isDisabled={!inventionProcessed}
                  onClick={handleDocumentSelect}
                />
              </Box>
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.project.id === nextProps.project.id &&
      prevProps.project.name === nextProps.project.name &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isDarkMode === nextProps.isDarkMode &&
      prevProps.expandedIndices === nextProps.expandedIndices &&
      prevProps.activeDocument?.documentType ===
        nextProps.activeDocument?.documentType
    );
  }
);

ProjectListItem.displayName = 'ProjectListItem';
