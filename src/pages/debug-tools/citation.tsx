import React, { useState } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  useToast,
  Code,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import {
  useCheckCitationJobStatus,
  useResetCitationExtraction,
  useGetDebugInfo,
} from '@/hooks/api/useDebug';

export default function DebugCitationPage() {
  const [jobId, setJobId] = useState<string>('1579');
  const toast = useToast();

  // React Query hooks
  const {
    data: statusData,
    isLoading: isCheckingStatus,
    refetch: checkStatus,
  } = useCheckCitationJobStatus(jobId);
  const resetExtraction = useResetCitationExtraction();
  const {
    data: debugInfoData,
    isLoading: isLoadingDebugInfo,
    refetch: getDebugInfo,
  } = useGetDebugInfo();

  // Handle status check with toast notifications
  const handleCheckStatus = async () => {
    const result = await checkStatus();
    if (result.data) {
      toast({
        title: `Job Status: ${result.data.status === 1 ? 'Complete' : result.data.status === 2 ? 'Failed' : 'Processing'}`,
        status:
          result.data.status === 1
            ? 'success'
            : result.data.status === 2
              ? 'error'
              : 'info',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  // Handle reset extraction
  const handleResetExtraction = () => {
    resetExtraction.mutate(parseInt(jobId, 10));
  };

  // Determine which result to show
  const resultStatus = statusData
    ? JSON.stringify(statusData, null, 2)
    : debugInfoData
      ? JSON.stringify(debugInfoData, null, 2)
      : resetExtraction.data
        ? JSON.stringify(resetExtraction.data, null, 2)
        : resetExtraction.error
          ? `Error: ${resetExtraction.error.message}`
          : '';

  // Combined loading state
  const isLoading =
    isCheckingStatus || resetExtraction.isPending || isLoadingDebugInfo;

  return (
    <Box p={8} maxWidth="800px" mx="auto">
      <Heading mb={6}>Citation Extraction Debug</Heading>

      <Alert status="info" mb={6}>
        <AlertIcon />
        This page helps debug citation extraction issues. Use it to check job
        status or reset the UI state.
      </Alert>

      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={3}>
            Job ID
          </Heading>
          <HStack>
            <Input
              value={jobId}
              onChange={e => setJobId(e.target.value)}
              placeholder="Enter job ID"
              type="number"
              width="200px"
            />
            <Button
              onClick={handleCheckStatus}
              colorScheme="blue"
              isLoading={isCheckingStatus}
            >
              Check Status
            </Button>
            <Button
              onClick={handleResetExtraction}
              colorScheme="orange"
              isLoading={resetExtraction.isPending}
            >
              Reset UI State
            </Button>
            <Button
              onClick={() => getDebugInfo()}
              variant="outline"
              isLoading={isLoadingDebugInfo}
            >
              Debug Info
            </Button>
          </HStack>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>
            Result
          </Heading>
          {resultStatus ? (
            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              overflowX="auto"
              _dark={{ bg: 'gray.800' }}
            >
              <pre>{resultStatus}</pre>
            </Box>
          ) : (
            <Text color="gray.500">
              No results yet. Click one of the buttons above.
            </Text>
          )}
        </Box>

        <Divider />

        <VStack align="stretch" spacing={3}>
          <Heading size="md">Instructions</Heading>
          <Text>1. Enter the job ID (default: 1579)</Text>
          <Text>2. Click "Check Status" to see if the job is complete</Text>
          <Text>
            3. If the UI is stuck, click "Reset UI State" to try resetting the
            extraction state
          </Text>
          <Text>
            4. Return to the main app and try clicking the citation extraction
            button again
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
