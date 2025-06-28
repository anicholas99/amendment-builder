import React from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  Icon,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  IconButton,
  HStack,
  Flex,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiInfo, FiX } from 'react-icons/fi';
import { ElementSectionProps } from './types';

const ElementSection: React.FC<ElementSectionProps> = ({
  editableParsedElements,
  handleElementLabelChange,
  handleElementEmphasisToggle,
  handleElementTextChange,
  handleRemoveElement,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Heading size="md" mb={2}>
          Select Elements to Emphasize
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={4}>
          We have parsed your claim into its elements. Please check any that you
          believe are particularly novel or need deeper coverage in the search.
          The system will still consider the entire claim, but the checked
          elements will receive extra emphasis in semantic queries.
        </Text>
        <Box p={3} bg="blue.50" borderRadius="md" mb={4}>
          <Text fontSize="sm" fontStyle="italic">
            <Icon as={FiInfo} mr={2} color="blue.500" />
            We will search for the entire claim, focusing on the emphasized
            elements in our semantic queries.
          </Text>
        </Box>
      </Box>

      <VStack spacing={3} align="stretch" width="100%">
        {editableParsedElements.map((element, index) => (
          <Box
            key={index}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderColor={element.emphasized ? 'blue.400' : 'gray.200'}
          >
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between" align="center">
                <Input
                  value={element.label}
                  onChange={e =>
                    handleElementLabelChange(index, e.target.value)
                  }
                  size="sm"
                  fontWeight="bold"
                  width="auto"
                  maxW="150px"
                />
                <HStack spacing={2}>
                  <FormControl display="flex" alignItems="center" width="auto">
                    <FormLabel
                      htmlFor={`emphasis-${index}`}
                      mb="0"
                      fontSize="xs"
                      mr={2}
                    >
                      Emphasized
                    </FormLabel>
                    <Switch
                      id={`emphasis-${index}`}
                      isChecked={element.emphasized}
                      onChange={() => handleElementEmphasisToggle(index)}
                      colorScheme="blue"
                      size="sm"
                    />
                  </FormControl>
                  <Tooltip label="Remove this element from search">
                    <IconButton
                      aria-label="Remove element"
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveElement(index)}
                    />
                  </Tooltip>
                </HStack>
              </Flex>
              <Textarea
                value={element.text}
                onChange={e => handleElementTextChange(index, e.target.value)}
                size="sm"
                minH="60px"
                resize="vertical"
              />
            </VStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};

export default ElementSection;
