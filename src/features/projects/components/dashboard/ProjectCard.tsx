import React, { useState, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Icon,
  Grid,
  GridItem,
  Badge,
  HStack,
  useColorModeValue,
  Tag,
  TagLabel,
  Spacer,
  useDisclosure,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiEdit, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { RenameProjectModal } from './RenameProjectModal';
import { useRouter } from 'next/router';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    createdAt?: string | number;
    lastUpdated?: string | number;
    inventionData?: {
      technologyDetails?: unknown;
      claims?: unknown[];
      patentDraft?: unknown;
    };
  };
  handleSelectProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  handleDocumentSelect: (projectId: string, documentType: string) => void;
  isDarkMode: boolean;
}

// Helper to format dates nicely
const formatRelativeDate = (date: string | number): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
};

// Memoized ProjectCard to prevent unnecessary re-renders
export const ProjectCard = React.memo<ProjectCardProps>(
  ({
    project,
    handleSelectProject,
    handleDeleteProject,
    handleDocumentSelect,
    isDarkMode,
  }) => {
    // Add rename modal disclosure
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const { tenant = 'development' } = router.query;

    // Extract color mode values - improved for dark mode
    const cardBg = isDarkMode ? 'gray.800' : 'white';
    const hoverBg = isDarkMode ? 'gray.700' : 'gray.50';
    const borderColor = isDarkMode ? 'gray.600' : 'gray.200';
    const headingColor = isDarkMode ? 'white' : 'gray.800';
    const textColor = isDarkMode ? 'gray.300' : 'gray.600';
    const iconColor = isDarkMode ? 'gray.400' : 'gray.500';
    const buttonHoverBg = isDarkMode ? 'gray.600' : 'gray.100';
    const deleteButtonColor = isDarkMode ? 'red.300' : 'red.500';
    const deleteButtonHoverColor = isDarkMode ? 'red.200' : 'red.600';

    const hasTechDetails = !!project.inventionData?.technologyDetails;
    const hasClaims = (project.inventionData?.claims?.length ?? 0) > 0;
    const hasPatentDraft = !!project.inventionData?.patentDraft;

    const isRecent =
      project.lastUpdated &&
      Date.now() - Number(project.lastUpdated) < 48 * 60 * 60 * 1000;

    // Memoize handlers
    const handleCardClick = useCallback(() => {
      if (project.id) {
        handleSelectProject(project.id);
      }
    }, [project.id, handleSelectProject]);

    const handleRenameClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpen();
      },
      [onOpen]
    );

    const handleOpenClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.id) {
          handleSelectProject(project.id);
        }
      },
      [project.id, handleSelectProject]
    );

    const handleDeleteClick = useCallback(
      (e: React.MouseEvent) => {
        if (project.id) {
          handleDeleteProject(project.id, e);
        }
      },
      [project.id, handleDeleteProject]
    );

    // Handle tag clicks for direct navigation
    const handleTagClick = useCallback(
      (documentType: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.id) {
          handleDocumentSelect(project.id, documentType);
        }
      },
      [project.id, handleDocumentSelect]
    );

    return (
      <>
        <Box
          p={5}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={cardBg}
          cursor="pointer"
          onClick={handleCardClick}
          _hover={{
            bg: hoverBg,
            shadow: 'lg',
            borderColor: isDarkMode ? 'blue.400' : 'blue.300',
          }}
          transition="background-color 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out"
          shadow="md"
        >
          <Flex direction="column" height="100%">
            <Flex alignItems="center" mb={3}>
              <Heading
                size="md"
                fontWeight="600"
                color={headingColor}
                wordBreak="break-word"
                flex="1"
                mr={3}
              >
                {project.name}
              </Heading>
              {isRecent && (
                <Badge colorScheme="cyan" variant="subtle" flexShrink={0}>
                  Recent
                </Badge>
              )}
            </Flex>

            <HStack spacing={6} mb={4} color={textColor} fontSize="sm">
              <Flex align="center">
                <Icon as={FiCalendar} mr={1.5} color={iconColor} />
                <Text>
                  Created:{' '}
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : project.lastUpdated
                      ? new Date(project.lastUpdated).toLocaleDateString()
                      : 'Unknown'}
                </Text>
              </Flex>
              <Flex align="center">
                <Icon as={FiClock} mr={1.5} color={iconColor} />
                <Text>
                  Modified:{' '}
                  {project.lastUpdated
                    ? formatRelativeDate(project.lastUpdated)
                    : 'Unknown'}
                </Text>
              </Flex>
            </HStack>

            <HStack spacing={2} mb={5}>
              {/* Technology Details Tag - Clickable */}
              <Tag
                size="sm"
                colorScheme={hasTechDetails ? 'green' : 'gray'}
                variant={hasTechDetails ? 'solid' : 'outline'}
                onClick={handleTagClick('technology')}
                cursor="pointer"
                _hover={{
                  opacity: 0.8,
                  transform: 'translateY(-1px)',
                  boxShadow: 'sm',
                }}
                transition="opacity 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
              >
                <TagLabel>Technology Details</TagLabel>
              </Tag>

              {/* Claims Tag - Clickable */}
              <Tag
                size="sm"
                colorScheme={hasClaims ? 'blue' : 'gray'}
                variant={hasClaims ? 'solid' : 'outline'}
                onClick={handleTagClick('claim-refinement')}
                cursor="pointer"
                _hover={{
                  opacity: 0.8,
                  transform: 'translateY(-1px)',
                  boxShadow: 'sm',
                }}
                transition="opacity 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
              >
                <TagLabel>Claims</TagLabel>
              </Tag>

              {/* Patent Tag - Clickable */}
              <Tag
                size="sm"
                colorScheme={hasPatentDraft ? 'purple' : 'gray'}
                variant={hasPatentDraft ? 'solid' : 'outline'}
                onClick={handleTagClick('patent')}
                cursor="pointer"
                _hover={{
                  opacity: 0.8,
                  transform: 'translateY(-1px)',
                  boxShadow: 'sm',
                }}
                transition="opacity 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
              >
                <TagLabel>Patent</TagLabel>
              </Tag>
            </HStack>

            <Spacer />

            <Flex justify="flex-end">
              <HStack spacing={3}>
                {/* Rename Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRenameClick}
                  leftIcon={
                    <Icon
                      as={FiEdit2}
                      boxSize={4}
                      color={isDarkMode ? 'teal.300' : 'teal.600'}
                    />
                  }
                  color={isDarkMode ? 'teal.300' : 'teal.600'}
                  _hover={{
                    bg: buttonHoverBg,
                    color: isDarkMode ? 'teal.200' : 'teal.700',
                  }}
                >
                  Rename
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleOpenClick}
                  leftIcon={
                    <Icon
                      as={FiEdit}
                      boxSize={4}
                      color={isDarkMode ? 'blue.300' : 'blue.600'}
                    />
                  }
                  color={isDarkMode ? 'blue.300' : 'blue.600'}
                  _hover={{
                    bg: buttonHoverBg,
                    color: isDarkMode ? 'blue.200' : 'blue.700',
                  }}
                >
                  Open
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteClick}
                  leftIcon={
                    <Icon as={FiTrash2} boxSize={4} color={deleteButtonColor} />
                  }
                  color={deleteButtonColor}
                  _hover={{
                    bg: buttonHoverBg,
                    color: deleteButtonHoverColor,
                  }}
                >
                  Delete
                </Button>
              </HStack>
            </Flex>
          </Flex>
        </Box>

        {/* Rename Project Modal */}
        <RenameProjectModal
          projectId={project.id}
          currentName={project.name}
          isOpen={isOpen}
          onClose={onClose}
        />
      </>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';
