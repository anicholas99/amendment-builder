import React from 'react';
import { Box, Flex, HStack, Icon, Text, Button } from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';

interface HistoricalViewBannerProps {
  viewingJobId: string;
  allCitationJobs: CitationJob[];
  onReturnToLatest: () => void;
}

export const HistoricalViewBanner: React.FC<HistoricalViewBannerProps> = ({
  viewingJobId,
  allCitationJobs,
  onReturnToLatest,
}) => {
  const job = allCitationJobs.find(j => j.id === viewingJobId);

  if (!job) return null;

  return (
    <Box
      bg="blue.50"
      p={2}
      borderBottomWidth="1px"
      borderBottomColor="blue.200"
    >
      <Flex justify="space-between" align="center">
        <HStack>
          <Icon as={FiClock} color="blue.600" />
          <Text fontSize="sm" color="blue.800">
            Viewing historical extraction from{' '}
            {new Date(job.createdAt).toLocaleString()}
          </Text>
        </HStack>
        <Button
          size="xs"
          variant="outline"
          colorScheme="blue"
          onClick={onReturnToLatest}
        >
          Return to Latest
        </Button>
      </Flex>
    </Box>
  );
};
