import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { FiPlus, FiEdit } from 'react-icons/fi';

interface Figure {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'diagram' | 'mermaid' | 'reactflow';
  elements?: { id: string; label: string; description: string }[];
}

interface FigureSectionProps {
  figures: Figure[];
  onAddFigure: () => void;
  onEditFigure: (id: string) => void;
  onViewFigure: (id: string) => void;
  FigureCarouselComponent: React.ComponentType<{ figures: Figure[] }>;
  ReferenceNumeralsComponent: React.ComponentType<{
    elements: Record<string, string>;
  }>;
}

/**
 * Component for displaying and managing figures
 */
const FigureSection: React.FC<FigureSectionProps> = ({
  figures,
  onAddFigure,
  onEditFigure,
  onViewFigure,
  FigureCarouselComponent,
  ReferenceNumeralsComponent,
}) => {
  return (
    <Box w="100%" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Figures
        </Text>
        <HStack>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            variant="secondary"
            size="action"
            onClick={onAddFigure}
          >
            Add Figure
          </Button>
        </HStack>
      </Flex>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Carousel View</Tab>
          <Tab>Element Labels</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0} pt={4}>
            <FigureCarouselComponent figures={figures} />

            {figures.length > 0 && (
              <Flex mt={4} justifyContent="center">
                {figures.map((figure, index) => (
                  <Button
                    key={figure.id}
                    size="action"
                    variant={index === 0 ? 'primary' : 'secondary'}
                    mx={1}
                    onClick={() => onViewFigure(figure.id)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Flex>
            )}
          </TabPanel>

          <TabPanel p={0} pt={4}>
            {figures.length === 0 ? (
              <Box p={4} borderWidth="1px" borderRadius="md" bg="bg.secondary">
                <Text color="text.secondary" textAlign="center">
                  No figures added yet. Add a figure to see its element labels
                  here.
                </Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {figures.map(figure => (
                  <Box
                    key={figure.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      mb={3}
                    >
                      <Text fontWeight="bold">{figure.title}</Text>
                      <Button
                        size="action"
                        variant="secondary"
                        leftIcon={<Icon as={FiEdit} />}
                        onClick={() => onEditFigure(figure.id)}
                      >
                        Edit
                      </Button>
                    </Flex>

                    {figure.elements && figure.elements.length > 0 ? (
                      <ReferenceNumeralsComponent
                        elements={figure.elements.reduce(
                          (acc, el) => {
                            acc[el.id] = el.description;
                            return acc;
                          },
                          {} as Record<string, string>
                        )}
                      />
                    ) : (
                      <Text color="text.secondary">
                        No element labels for this figure.
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default FigureSection;
