import React from 'react';
import {
  VStack,
  Box,
  Heading,
  Text,
  Icon,
  Button,
  Textarea,
  FormControl,
  Badge,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiInfo, FiCopy, FiCheck } from 'react-icons/fi';
import { QuerySectionProps } from './types';

const QuerySection: React.FC<QuerySectionProps> = React.memo(
  ({
    editableSearchQueries,
    handleQueryChange,
    onCopy,
    hasCopied,
    copyQuery,
    copiedQueryIndex,
  }) => {
    const queryBgColor = useColorModeValue('green.50', 'green.900');
    const queryBorderColor = useColorModeValue('green.200', 'green.700');

    return (
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading size="md" mb={2}>
            Review Search Queries
          </Heading>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Based on your emphasized elements, we've generated the following
            search queries. You can edit these queries before executing the
            search.
          </Text>

          <Box p={3} bg="green.50" borderRadius="md" mb={4}>
            <Text fontSize="sm" fontStyle="italic">
              <Icon as={FiInfo} mr={2} color="green.500" />
              The emphasized elements have been given priority in these queries
              with additional synonyms and variations. The final query combines
              all aspects of the claim.
            </Text>
          </Box>

          <Button
            leftIcon={<FiCopy />}
            size="sm"
            onClick={onCopy}
            mb={4}
            colorScheme="teal"
            variant="outline"
          >
            {hasCopied ? 'Copied all queries!' : 'Copy all queries'}
          </Button>
        </Box>

        {editableSearchQueries.map((query, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor={queryBorderColor}
            bg={queryBgColor}
            position="relative"
            transition="box-shadow 0.15s ease-out"
            _hover={{ shadow: 'md' }}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Badge
                colorScheme="green"
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="md"
              >
                {index === editableSearchQueries.length - 1
                  ? 'Consolidated Query'
                  : `Query ${index + 1}`}
              </Badge>

              <Button
                size="xs"
                leftIcon={copiedQueryIndex === index ? <FiCheck /> : <FiCopy />}
                onClick={() => copyQuery(index, query)}
                colorScheme={copiedQueryIndex === index ? 'green' : 'gray'}
                variant="ghost"
              >
                {copiedQueryIndex === index ? 'Copied!' : 'Copy'}
              </Button>
            </Flex>

            <FormControl>
              <Textarea
                value={query}
                onChange={e => handleQueryChange(index, e.target.value)}
                fontSize="md"
                resize="vertical"
                rows={Math.max(3, query.split('\n').length)}
                minHeight={
                  index === editableSearchQueries.length - 1 ? '200px' : '100px'
                }
                maxHeight={
                  index === editableSearchQueries.length - 1 ? 'none' : '200px'
                }
                onInput={e => {
                  // Auto-resize the textarea to fit content
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
                className={
                  index === editableSearchQueries.length - 1
                    ? 'hide-scrollbar'
                    : ''
                }
                sx={{
                  // Remove scrollbar for consolidated query
                  ...(index === editableSearchQueries.length - 1 && {
                    overflowY: 'visible',
                  }),
                }}
              />
            </FormControl>
          </Box>
        ))}
      </VStack>
    );
  }
);

QuerySection.displayName = 'QuerySection';

export default QuerySection;
