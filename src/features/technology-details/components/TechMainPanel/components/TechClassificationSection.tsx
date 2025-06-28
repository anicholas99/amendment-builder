import React from 'react';
import {
  Box,
  Text,
  Flex,
  Select,
  Icon,
  VStack,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiGrid } from 'react-icons/fi';
import CustomEditable from '../../../../../components/common/CustomEditable';
import { TechSectionProps } from '../types';
import { useThemeContext } from '../../../../../contexts/ThemeContext';
import {
  mapAiFieldToDisplayValue,
  mapDisplayValueToAiField,
  getTechnicalFieldOptions,
} from '../../../utils/technicalFieldMapping';
import { hasSectionData } from '../../../../../utils/sectionUtils';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

interface TechClassificationSectionProps extends TechSectionProps {
  onUpdatePatentCategory: (value: string) => void;
  onUpdateTechnicalField: (value: string) => void;
}

/**
 * Component for displaying and editing the technology classification
 */
export const TechClassificationSection: React.FC<
  TechClassificationSectionProps
> = ({
  analyzedInvention,
  getFontSize,
  onUpdatePatentCategory,
  onUpdateTechnicalField,
}) => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const fieldBg = useColorModeValue('gray.50', 'gray.700');
  const titleColor = useColorModeValue('gray.700', 'gray.300');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('#E2E8F0', '#4A5568');

  // Get the mapped technical field value for the dropdown
  const mappedTechnicalField =
    analyzedInvention?.technicalField &&
    typeof analyzedInvention.technicalField === 'string'
      ? mapAiFieldToDisplayValue(analyzedInvention.technicalField)
      : '';

  // Get all available dropdown options
  const technicalFieldOptions = getTechnicalFieldOptions();

  const handleTechnicalFieldChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const displayValue = e.target.value;
    // Convert display value back to AI format for consistency
    const aiFieldValue = mapDisplayValueToAiField(displayValue);
    onUpdateTechnicalField(aiFieldValue);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <HStack spacing={3}>
          <Icon as={FiGrid} className="w-5 h-5" color={iconColor} />
          <Text
            fontSize={getFontSize('lg')}
            fontWeight="bold"
            color={titleColor}
          >
            Technology Classification
          </Text>
        </HStack>
      </Box>

      {/* Content */}
      <Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
          <Box>
            <HStack spacing={2} mb={2}>
              <Icon as={FiGrid} boxSize={4} color="text.secondary" />
              <Text
                fontSize={getFontSize('md')}
                fontWeight="semibold"
                color="text.primary"
              >
                Patent Category
              </Text>
            </HStack>
            <CustomEditable
              value={analyzedInvention?.patentCategory || ''}
              onChange={onUpdatePatentCategory}
              placeholder="e.g., Software, Hardware, etc."
              fontSize={getFontSize('md')}
            />
          </Box>
          <Box>
            <HStack spacing={2} mb={2}>
              <Icon as={FiGrid} boxSize={4} color="text.secondary" />
              <Text
                fontSize={getFontSize('md')}
                fontWeight="semibold"
                color="text.primary"
              >
                Technical Field
              </Text>
            </HStack>
            <Select
              value={mappedTechnicalField}
              onChange={handleTechnicalFieldChange}
              placeholder="Select technical field"
              fontSize={getFontSize('md')}
              bg="bg.primary"
              borderColor="border.primary"
              _hover={{ borderColor: 'border.hover' }}
              _focus={{ borderColor: 'border.focus', boxShadow: 'outline' }}
            >
              {technicalFieldOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default TechClassificationSection;
