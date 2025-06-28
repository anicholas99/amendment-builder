import React, { useCallback } from 'react';
import { Flex, Icon, Text, Box } from '@chakra-ui/react';
import {
  FiFileText,
  FiLayers,
  FiGitPullRequest,
  FiCheck,
  FiEdit,
  FiChevronsUp,
} from 'react-icons/fi';
import { HiChevronRight } from 'react-icons/hi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectApiService } from '@/client/services/project.client-service';
import { projectKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/time';

interface DocumentLinkProps {
  projectId: string;
  documentType: string;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: (projectId: string, documentType: string) => void;
}

const documentIcons: Record<string, React.ElementType> = {
  technology: FiLayers,
  'claim-refinement': FiEdit,
  'claim-sync': FiChevronsUp,
  patent: FiFileText,
  'prior-art': FiGitPullRequest,
  verification: FiCheck,
};

const DocumentLink: React.FC<DocumentLinkProps> = React.memo(
  ({
    projectId,
    documentType,
    label,
    isActive = false,
    isDisabled = false,
    onClick,
  }) => {
    const { isDarkMode } = useThemeContext();
    const { activeProjectId: activeProject } = useProjectData();

    const queryClient = useQueryClient();

    const handleClick = useCallback(() => {
      if (isDisabled) return;
      onClick(projectId, documentType);
    }, [onClick, projectId, documentType, isDisabled]);

    const IconComponent = documentIcons[documentType] || FiFileText;

    return (
      <Flex
        align="center"
        py={1.5}
        px={3}
        fontSize="13px"
        borderRadius="md"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        opacity={isDisabled ? 0.5 : 1}
        onClick={handleClick}
        bg={isActive ? (isDarkMode ? 'blue.800' : 'blue.50') : 'transparent'}
        color={
          isActive
            ? isDarkMode
              ? 'blue.200'
              : 'blue.600'
            : isDisabled
              ? isDarkMode
                ? 'gray.600'
                : 'gray.400'
              : isDarkMode
                ? 'gray.400'
                : 'gray.600'
        }
        _hover={
          isDisabled
            ? {}
            : {
                bg: isDarkMode ? 'gray.700' : 'gray.100',
                color: isDarkMode ? 'gray.100' : 'gray.800',
              }
        }
        transition="background-color 0.15s ease-out, color 0.15s ease-out"
        width="100%"
        sx={{
          '&:hover svg': isDisabled
            ? {}
            : {
                transition: 'color 0.15s ease-out',
                color: isDarkMode ? 'gray.100' : 'gray.800',
              },
        }}
      >
        <Icon as={IconComponent} boxSize={3} mr={2} flexShrink={0} />
        <Text
          fontSize="13px"
          flex="1"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {label}
        </Text>
        {isActive && (
          <Icon
            as={HiChevronRight}
            boxSize={3}
            ml={1}
            flexShrink={0}
            color={isDarkMode ? 'blue.200' : 'blue.600'}
          />
        )}
      </Flex>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    return (
      prevProps.projectId === nextProps.projectId &&
      prevProps.documentType === nextProps.documentType &&
      prevProps.label === nextProps.label &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isDisabled === nextProps.isDisabled
    );
  }
);

DocumentLink.displayName = 'DocumentLink';

export { DocumentLink };
