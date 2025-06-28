import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Input,
  Text,
  Divider,
  Container,
  useToast,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Textarea,
} from '@chakra-ui/react';
import ViewLayout from '../components/layouts/ViewLayout';
import { useBulkPatentLookup } from '@/hooks/api/usePatentLookup';

/**
 * Patent Bulk Lookup Page
 *
 * This page allows looking up multiple patents at once using PatBase.
 */
export default function PatentLookup() {
  const [patentReferences, setPatentReferences] = useState(
    'US20150148005A1\nUS9467515B1\nUS73404388B2'
  );

  // React Query hook
  const patentLookup = useBulkPatentLookup();

  // Clean patent reference numbers
  const cleanPatentNumbers = (inputText: string): string[] => {
    return inputText
      .split(/[\n,;]/) // Split by newline, comma, or semicolon
      .map(ref => ref.trim())
      .filter(ref => ref.length > 0); // Remove empty lines
  };

  // Clean up title text
  const cleanTitle = (title: string, patentNumber: string): string => {
    if (!title) return 'No title available';

    // Remove common patent number formats from the title
    // Format 1: US-20150148005-A1
    let cleaned = title.replace(/^[A-Z]{2}-\d+-[A-Z]\d\s*/, '');

    // Format 2: US20150148005A1
    const cleanNumber = patentNumber.replace(/-/g, '');
    cleaned = cleaned.replace(new RegExp(cleanNumber, 'i'), '');

    // Remove additional common patent number patterns
    cleaned = cleaned.replace(/^[A-Z]{2}\d+[A-Z]\d\s*/, '');

    return cleaned.trim() || 'No title available';
  };

  // Lookup patents using the enhance API
  const lookupPatents = () => {
    const references = cleanPatentNumbers(patentReferences);

    if (references.length === 0) {
      // Use manual toast for validation error
      const toast = useToast();
      toast({
        title: 'Validation Error',
        description: 'Please enter at least one patent reference number',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      return;
    }

    patentLookup.mutate(references);
  };

  // Header content for ViewLayout
  const header = (
    <Flex justify="space-between" align="center" px={8} py={4}>
      <Heading size="lg">Patent Bulk Lookup</Heading>
    </Flex>
  );

  // Main content for ViewLayout
  const mainContent = (
    <Container maxW="100%" p={5} h="100%" overflowY="auto">
      <VStack spacing={8} align="stretch">
        {patentLookup.error && (
          <Box p={4} bg="red.100" borderRadius="md">
            <Text color="red.800">{patentLookup.error.message}</Text>
          </Box>
        )}

        {/* Patent References Input */}
        <Box p={5} borderWidth="1px" borderRadius="lg" bg="bg.card">
          <Heading size="md" mb={4}>
            Bulk Patent Lookup
          </Heading>
          <Text mb={4}>
            Enter patent reference numbers (one per line or comma-separated) to
            retrieve details from PatBase.
          </Text>

          <VStack spacing={4} align="stretch" mb={4}>
            <Textarea
              value={patentReferences}
              onChange={e => setPatentReferences(e.target.value)}
              placeholder="Enter patent numbers (e.g., US9467515B1)"
              rows={5}
            />

            <Button
              colorScheme="blue"
              onClick={lookupPatents}
              isLoading={patentLookup.isPending}
              width="full"
            >
              Lookup Patents
            </Button>
          </VStack>
        </Box>

        <Divider />

        {/* Results Table */}
        {(patentLookup.isPending || patentLookup.data) && (
          <Box p={5} borderWidth="1px" borderRadius="lg" bg="bg.card">
            <Heading size="md" mb={4}>
              Results
            </Heading>

            {patentLookup.isPending ? (
              <Flex justify="center" align="center" direction="column" py={8}>
                <Spinner size="xl" mb={4} />
                <Text>Looking up patent details...</Text>
              </Flex>
            ) : patentLookup.data ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Patent Number</Th>
                      <Th>Title</Th>
                      <Th>Date</Th>
                      <Th>Assignee</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {patentLookup.data.results.map((result, index) => (
                      <Tr key={index}>
                        <Td>
                          <Text fontWeight="normal">
                            {result.referenceNumber}
                          </Text>
                        </Td>
                        <Td maxW="300px">
                          {result.found ? (
                            <Text noOfLines={2}>
                              {cleanTitle(
                                result.title || '',
                                result.referenceNumber || result.patentNumber
                              )}
                            </Text>
                          ) : (
                            <Text color="gray.500">Not available</Text>
                          )}
                        </Td>
                        <Td>{result.publicationDate || 'N/A'}</Td>
                        <Td>{result.assignee || 'N/A'}</Td>
                        <Td>
                          {result.found ? (
                            <Badge colorScheme="green">Found</Badge>
                          ) : (
                            <Badge colorScheme="red">Not Found</Badge>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : null}
          </Box>
        )}
      </VStack>
    </Container>
  );

  return (
    <ViewLayout
      header={header}
      mainContent={mainContent}
      sidebarContent={null}
    />
  );
}
