import React from 'react';
import {
  VStack,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface TechnologyDetail {
  id: string;
  title: string;
  description: string;
  category?: string;
}

interface TechnologyDetailsFormProps {
  details: TechnologyDetail[];
  onAddDetail: () => void;
  onUpdateDetail: (id: string, field: string, value: string) => void;
  onDeleteDetail: (id: string) => void;
  inventionTitle: string;
  inventionDescription: string;
  onUpdateInvention: (field: string, value: string) => void;
  problemSolved: string;
  onUpdateProblemSolved: (value: string) => void;
  advantages: string[];
  onAddAdvantage: () => void;
  onUpdateAdvantage: (index: number, value: string) => void;
  onDeleteAdvantage: (index: number) => void;
}

/**
 * Form component for entering and managing technology details
 */
const TechnologyDetailsForm: React.FC<TechnologyDetailsFormProps> = ({
  details,
  onAddDetail,
  onUpdateDetail,
  onDeleteDetail,
  inventionTitle,
  inventionDescription,
  onUpdateInvention,
  problemSolved,
  onUpdateProblemSolved,
  advantages,
  onAddAdvantage,
  onUpdateAdvantage,
  onDeleteAdvantage,
}) => {
  return (
    <Box w="100%" p={4}>
      <VStack spacing={6} align="stretch">
        {/* Basic Invention Information */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Basic Information
          </Text>

          <FormControl mb={4}>
            <FormLabel>Invention Title</FormLabel>
            <Input
              value={inventionTitle}
              onChange={e => onUpdateInvention('title', e.target.value)}
              placeholder="Enter the title of your invention"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Invention Description</FormLabel>
            <Textarea
              value={inventionDescription}
              onChange={e => onUpdateInvention('description', e.target.value)}
              placeholder="Provide a brief description of your invention"
              minH="100px"
              resize="vertical"
            />
          </FormControl>
        </Box>

        <Divider />

        {/* Problem Solved */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Problem Solved
          </Text>

          <FormControl>
            <FormLabel>What problem does your invention solve?</FormLabel>
            <Textarea
              value={problemSolved}
              onChange={e => onUpdateProblemSolved(e.target.value)}
              placeholder="Describe the problem that your invention addresses"
              minH="100px"
              resize="vertical"
            />
          </FormControl>
        </Box>

        <Divider />

        {/* Advantages */}
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              Advantages
            </Text>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="blue"
              variant="outline"
              onClick={onAddAdvantage}
            >
              Add Advantage
            </Button>
          </Flex>

          <VStack spacing={3} align="stretch">
            {advantages.map((advantage, index) => (
              <Flex key={index} alignItems="center">
                <Badge colorScheme="green" mr={2}>
                  {index + 1}
                </Badge>
                <Input
                  value={advantage}
                  onChange={e => onUpdateAdvantage(index, e.target.value)}
                  flex="1"
                />
                <Button
                  ml={2}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => onDeleteAdvantage(index)}
                >
                  <Icon as={FiTrash2} />
                </Button>
              </Flex>
            ))}

            {advantages.length === 0 && (
              <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text color="gray.500" textAlign="center">
                  No advantages added yet. Click "Add Advantage" to add one.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        <Divider />

        {/* Technical Details */}
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              Technical Details
            </Text>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="blue"
              variant="outline"
              onClick={onAddDetail}
            >
              Add Detail
            </Button>
          </Flex>

          <VStack spacing={4} align="stretch">
            {details.map(detail => (
              <Box
                key={detail.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="sm"
              >
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={detail.title}
                      onChange={e =>
                        onUpdateDetail(detail.id, 'title', e.target.value)
                      }
                      placeholder="Detail title"
                    />
                  </FormControl>

                  <Button
                    ml={2}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onDeleteDetail(detail.id)}
                  >
                    <Icon as={FiTrash2} />
                  </Button>
                </Flex>

                <FormControl mt={3}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={detail.description}
                    onChange={e =>
                      onUpdateDetail(detail.id, 'description', e.target.value)
                    }
                    placeholder="Detailed description"
                    minH="100px"
                    resize="vertical"
                  />
                </FormControl>

                {detail.category && (
                  <FormControl mt={3}>
                    <FormLabel>Category</FormLabel>
                    <Input
                      value={detail.category}
                      onChange={e =>
                        onUpdateDetail(detail.id, 'category', e.target.value)
                      }
                      placeholder="Category (optional)"
                    />
                  </FormControl>
                )}
              </Box>
            ))}

            {details.length === 0 && (
              <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text color="gray.500" textAlign="center">
                  No technical details added yet. Click "Add Detail" to add one.
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default TechnologyDetailsForm;
