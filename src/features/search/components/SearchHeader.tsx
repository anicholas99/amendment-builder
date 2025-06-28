import React from 'react';
import {
  Box,
  VStack,
  Button,
  Icon,
  Text,
  Heading,
  HStack,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { ClaimSyncIndicator } from '@/features/claim-refinement/components/ClaimSyncIndicator';
import type { UseClaimSyncStateReturn } from '@/features/claim-refinement/hooks/useClaimSyncState';

interface SearchHeaderProps {
  // Claim sync state
  claimSyncState?: UseClaimSyncStateReturn & {
    onOpenModal?: () => void;
  };

  // Loading states
  isSearching: boolean;
  debouncedParsing: boolean;
  hasProcessingSearch: boolean;
  hasOptimisticSearch: boolean;

  // Search state
  outOfSync: boolean;
  hasQueries: boolean;

  // Handlers
  onSearch: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  claimSyncState,
  isSearching,
  debouncedParsing,
  hasProcessingSearch,
  hasOptimisticSearch,
  outOfSync,
  hasQueries,
  onSearch,
}) => {
  const showSearchLoadingState =
    isSearching || hasProcessingSearch || hasOptimisticSearch;

  return (
    <Box p={4} borderBottomWidth="1px" borderColor="border.primary">
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading size="md" mb={1}>
            Patent Search
          </Heading>
          <Text fontSize="sm" color="text.secondary">
            Use AI to find relevant patents based on your claims
          </Text>
        </Box>

        {/* Claim Sync Status */}
        {claimSyncState && (
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" fontWeight="medium">
              Claim 1 Analysis:
            </Text>
            <ClaimSyncIndicator
              syncStatus={claimSyncState.syncStatus}
              error={claimSyncState.error}
              lastSyncTime={claimSyncState.lastSyncTime}
              onResync={claimSyncState.resync}
              onOpenModal={claimSyncState.onOpenModal}
            />
          </HStack>
        )}

        {/* Search Button */}
        <Button
          size="md"
          colorScheme="blue"
          leftIcon={<Icon as={FiSearch} />}
          onClick={onSearch}
          isLoading={showSearchLoadingState || debouncedParsing}
          isDisabled={
            showSearchLoadingState ||
            debouncedParsing ||
            (!hasQueries && !outOfSync) // Only disable if no queries AND not out-of-sync
          }
          width="100%"
        >
          {showSearchLoadingState ? 'Searching...' : 'Run New Search'}
        </Button>

        {/* Show processing indicator when search is running in background */}
        {(hasProcessingSearch || hasOptimisticSearch) && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="medium">Search in progress</Text>
              <Text fontSize="sm">
                Results will appear automatically when ready.
              </Text>
            </Box>
            <Spinner size="sm" ml={3} />
          </Alert>
        )}

        {/* Out of sync warning removed per request */}
      </VStack>
    </Box>
  );
};
