import React from 'react';
import { Box, Text, Icon, VStack, HStack, Divider } from '@chakra-ui/react';
import { FiLayers } from 'react-icons/fi';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import CustomEditable from '../../../../../components/common/CustomEditable';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import { useThemeContext } from '../../../../../contexts/ThemeContext';

interface TechBackgroundSectionProps extends TechSectionProps {
  onUpdateBackgroundTechnicalField: (value: string) => void;
  onUpdateProblemsSolved: (items: string[]) => void;
  onUpdateExistingSolutions: (items: string[]) => void;
}

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

/**
 * Component for displaying and editing the technology background
 */
export const TechBackgroundSection: React.FC<TechBackgroundSectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdateBackgroundTechnicalField,
  onUpdateProblemsSolved,
  onUpdateExistingSolutions,
}) => {
  // Helper functions to get array data
  const getProblemsArray = () => {
    const background = analyzedInvention?.background;
    if (typeof background === 'object' && background?.problemsSolved) {
      return Array.isArray(background.problemsSolved)
        ? background.problemsSolved
        : [String(background.problemsSolved)];
    }
    return [];
  };

  const getExistingSolutionsArray = () => {
    const background = analyzedInvention?.background;
    if (typeof background === 'object' && background?.existingSolutions) {
      return Array.isArray(background.existingSolutions)
        ? background.existingSolutions
        : [String(background.existingSolutions)];
    }
    return [];
  };

  // Get technical field from background object or top-level
  const getTechnicalField = () => {
    const background = analyzedInvention?.background;
    if (typeof background === 'object' && background?.technicalField) {
      return String(background.technicalField);
    }
    return String(analyzedInvention?.technicalField || '');
  };

  if (
    !hasSectionData(getTechnicalField()) &&
    !hasSectionData(getProblemsArray()) &&
    !hasSectionData(getExistingSolutionsArray())
  ) {
    return null;
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <HStack spacing={3}>
          <Icon as={FiLayers} boxSize={5} color="text.secondary" />
          <Text
            fontSize={getFontSize('lg')}
            fontWeight="bold"
            color="text.primary"
          >
            Background
          </Text>
        </HStack>
      </Box>

      {/* Content */}
      <VStack spacing={4} align="stretch">
        {/* Technical Field */}
        {hasSectionData(getTechnicalField()) && (
          <Box>
            <Box mb={3}>
              <HStack spacing={2}>
                <Icon as={FiLayers} boxSize={4} color="text.secondary" />
                <Text
                  fontSize={getFontSize('md')}
                  fontWeight="semibold"
                  color="text.primary"
                >
                  Technical Field
                </Text>
              </HStack>
            </Box>
            <CustomEditable
              value={getTechnicalField()}
              onChange={onUpdateBackgroundTechnicalField}
              placeholder="Describe the technical field..."
              fontSize={getFontSize('md')}
            />
          </Box>
        )}

        {/* Problems Solved */}
        {hasSectionData(getProblemsArray()) && (
          <>
            <Divider borderColor="border.light" />
            <Box>
              <Box mb={3}>
                <HStack spacing={2}>
                  <Icon as={FiLayers} boxSize={4} color="text.secondary" />
                  <Text
                    fontSize={getFontSize('md')}
                    fontWeight="semibold"
                    color="text.primary"
                  >
                    Problems Solved
                  </Text>
                </HStack>
              </Box>
              <ContentEditableList
                items={getProblemsArray()}
                onChange={onUpdateProblemsSolved}
                placeholder="Add a problem being solved..."
                fontSize={getFontSize('md')}
                lineHeight={1.6}
              />
            </Box>
          </>
        )}

        {/* Existing Solutions */}
        {hasSectionData(getExistingSolutionsArray()) && (
          <>
            <Divider borderColor="border.light" />
            <Box>
              <Box mb={3}>
                <HStack spacing={2}>
                  <Icon as={FiLayers} boxSize={4} color="text.secondary" />
                  <Text
                    fontSize={getFontSize('md')}
                    fontWeight="semibold"
                    color="text.primary"
                  >
                    Existing Solutions
                  </Text>
                </HStack>
              </Box>
              <ContentEditableList
                items={getExistingSolutionsArray()}
                onChange={onUpdateExistingSolutions}
                placeholder="Add an existing solution..."
                fontSize={getFontSize('md')}
                lineHeight={1.6}
              />
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TechBackgroundSection;
