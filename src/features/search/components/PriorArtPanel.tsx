import React from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Badge,
  VStack,
  HStack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from '@chakra-ui/react';
import { FiBook } from 'react-icons/fi';
import { PriorArtReference } from '../../../types/claimTypes';

interface PriorArtPanelProps {
  references: PriorArtReference[];
}

const PriorArtPanel: React.FC<PriorArtPanelProps> = ({ references }) => {
  // Sort by composite score: relevancy * (1 + 0.2 * (searchAppearanceCount - 1))
  // This gives a 20% boost per additional appearance
  const sortedReferences = [...references].sort((a, b) => {
    // Convert relevancy to decimal (e.g., 68% -> 0.68)
    const aRelevancy = (a.relevance ?? 0) / 100;
    const bRelevancy = (b.relevance ?? 0) / 100;
    const aCount = a.searchAppearanceCount ?? 1;
    const bCount = b.searchAppearanceCount ?? 1;

    // Calculate composite score with appearance boost
    const aScore = aRelevancy * (1 + 0.2 * (aCount - 1));
    const bScore = bRelevancy * (1 + 0.2 * (bCount - 1));

    // If scores are equal, sort by year (newer first)
    if (Math.abs(aScore - bScore) < 0.001) {
      const aYear = parseInt(a.year ?? '0');
      const bYear = parseInt(b.year ?? '0');
      return bYear - aYear;
    }

    return bScore - aScore;
  });

  // Debug logging to verify sorting
  logger.log('Sorted References:', {
    references: sortedReferences.map(ref => ({
      number: ref.number,
      relevance: ref.relevance,
      count: ref.searchAppearanceCount,
      year: ref.year,
      score:
        ((ref.relevance ?? 0) / 100) *
        (1 + 0.2 * ((ref.searchAppearanceCount ?? 1) - 1)),
    })),
  });

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <HStack flex="1">
              <Icon as={FiBook} />
              <Text>Prior Art References</Text>
              <Badge colorScheme="blue">{sortedReferences.length}</Badge>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          {references.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Reference</Th>
                  <Th>Year</Th>
                  <Th>Relevancy</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedReferences.map(ref => (
                  <Tr key={ref.number}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <Text as="span" fontWeight="bold">
                            {ref.number}
                          </Text>
                          <Text as="span">{ref.title}</Text>
                        </HStack>
                        <Tooltip label={ref.relevantText}>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            noOfLines={2}
                            cursor="pointer"
                            _hover={{ color: 'blue.500' }}
                          >
                            {ref.relevantText}
                          </Text>
                        </Tooltip>
                      </VStack>
                    </Td>
                    <Td>{ref.year}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          (ref.relevance ?? 0) > 0.8
                            ? 'high'
                            : (ref.relevance ?? 0) > 0.6
                              ? 'medium'
                              : (ref.relevance ?? 0) > 0.4
                                ? 'low'
                                : 'minimal'
                        }
                      >
                        {((ref.relevance ?? 0) * 100).toFixed(0)}%
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">No prior art references found</Text>
            </Box>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default PriorArtPanel;
