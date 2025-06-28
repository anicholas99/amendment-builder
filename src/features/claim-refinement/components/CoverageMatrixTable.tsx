import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { CoverageMatrix } from '../../../types/priorArtAnalysisTypes';

interface CoverageMatrixTableProps {
  coverageMatrix: CoverageMatrix;
  referenceIds: string[];
}

/**
 * Component to display a table showing which claim elements are covered by which references.
 * Uses a color-coded table (Yes=Red, Partial=Yellow, No=Green) for quick visual assessment.
 */
const CoverageMatrixTable: React.FC<CoverageMatrixTableProps> = ({
  coverageMatrix,
  referenceIds,
}) => {
  // Get all unique element names and reference IDs from the matrix
  const elements = Object.keys(coverageMatrix);

  // Color schemes for different coverage levels
  const getBadgeProps = (value: 'Yes' | 'Partial' | 'No') => {
    switch (value) {
      case 'Yes':
        return {
          bg: useColorModeValue('red.100', 'red.800'),
          color: useColorModeValue('red.800', 'red.100'),
          text: 'Yes',
          tooltipText: 'This element is fully disclosed in the reference',
        };
      case 'Partial':
        return {
          bg: useColorModeValue('orange.100', 'orange.800'),
          color: useColorModeValue('orange.800', 'orange.100'),
          text: 'Partial',
          tooltipText:
            'This element is partially disclosed or has relevant teachings in the reference',
        };
      case 'No':
        return {
          bg: useColorModeValue('green.100', 'green.800'),
          color: useColorModeValue('green.800', 'green.100'),
          text: 'No',
          tooltipText: 'This element is not disclosed in the reference',
        };
      default:
        return {
          bg: useColorModeValue('gray.100', 'gray.800'),
          color: useColorModeValue('gray.800', 'gray.100'),
          text: 'Unknown',
          tooltipText: 'Unknown coverage status',
        };
    }
  };

  // Return placeholder if no data or empty matrix
  if (!coverageMatrix || elements.length === 0 || referenceIds.length === 0) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="md"
        bg={useColorModeValue('gray.50', 'gray.700')}
      >
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          No coverage matrix data available.
        </Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto" borderWidth="1px" borderRadius="md" shadow="sm">
      <Table size="sm" variant="simple">
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th width="40%">Claim Element</Th>
            {referenceIds.map(refId => (
              <Th
                key={refId}
                textAlign="center"
                width={`${60 / referenceIds.length}%`}
              >
                {refId}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {elements.map(element => (
            <Tr key={element}>
              <Td>
                <Text fontSize="xs">{element}</Text>
              </Td>
              {referenceIds.map(refId => {
                // Get the coverage value or use 'No' as fallback if not specified
                const coverageValue = coverageMatrix[element][refId] || 'No';
                const { bg, color, text, tooltipText } = getBadgeProps(
                  coverageValue as 'Yes' | 'Partial' | 'No'
                );

                return (
                  <Td key={`${element}-${refId}`} textAlign="center">
                    <Tooltip label={tooltipText} placement="top">
                      <Badge
                        px={2}
                        py={1}
                        borderRadius="full"
                        bg={bg}
                        color={color}
                      >
                        {text}
                      </Badge>
                    </Tooltip>
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CoverageMatrixTable;
