import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useToast,
  Collapse,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimQueryKeys } from '@/hooks/api/useClaims';
import { ClaimApiService } from '@/client/services/claim.client-service';
import { emitClaimUpdateEvent } from '@/features/claim-refinement/utils/claimUpdateEvents';
import { logger } from '@/lib/monitoring/logger';
import { chatKeys } from '@/lib/queryKeys';

interface DiffChange {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

interface RevisionDiffProps {
  claimId: string;
  claimNumber: number;
  changes: DiffChange[];
  projectId: string;
  proposedText?: string;
}

export const ClaimRevisionDiff: React.FC<RevisionDiffProps> = ({
  claimId,
  claimNumber,
  changes,
  projectId,
  proposedText,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasBeenApplied, setHasBeenApplied] = useState(false);

  // Colors for diff display
  const addedBg = useColorModeValue('#d1fae5', '#064e3b');
  const addedColor = useColorModeValue('#065f46', '#a7f3d0');
  const removedBg = useColorModeValue('#fee2e2', '#7f1d1d');
  const removedColor = useColorModeValue('#991b1b', '#fca5a5');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  // Mutation to apply the revision
  const applyRevisionMutation = useMutation({
    mutationFn: async () => {
      if (!proposedText) {
        // Extract proposed text from changes if not provided
        const proposed = changes
          .filter(c => c.type !== 'removed')
          .map(c => c.value)
          .join('');
        return ClaimApiService.updateClaim(projectId, claimId, proposed);
      }
      return ClaimApiService.updateClaim(projectId, claimId, proposedText);
    },
    onSuccess: () => {
      // Invalidate claims queries
      queryClient.invalidateQueries({ queryKey: claimQueryKeys.list(projectId) });
      
      // Emit claim update event
      emitClaimUpdateEvent({
        projectId,
        action: 'edited',
      });
      
      // Store last action context for chat
      queryClient.setQueryData(
        [...chatKeys.context(projectId)],
        { 
          lastAction: {
            type: 'claim-revised' as const,
            claimNumber: claimNumber,
          }
        }
      );
      
      setHasBeenApplied(true);
      
      toast({
        title: 'Claim Updated',
        description: `Claim ${claimNumber} has been successfully revised.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      logger.error('[ClaimRevisionDiff] Failed to apply revision', { error });
      toast({
        title: 'Update Failed',
        description: 'Failed to apply the revision. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleApply = () => {
    applyRevisionMutation.mutate();
  };

  const handleReject = () => {
    setIsExpanded(false);
    toast({
      title: 'Revision Rejected',
      description: 'The proposed revision has been discarded.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  if (hasBeenApplied) {
    return (
      <Box
        p={4}
        borderRadius="md"
        bg="green.50"
        _dark={{ bg: 'green.900' }}
        border="1px solid"
        borderColor="green.300"
      >
        <Flex align="center" gap={2}>
          <FiCheck color="green" />
          <Text fontSize="sm" fontWeight="medium" color="green.700" _dark={{ color: 'green.300' }}>
            Revision applied successfully to claim {claimNumber}
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="md"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      mb={2}
    >
      {/* Header */}
      <Flex
        p={3}
        bg="gray.50"
        _dark={{ bg: 'gray.800' }}
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Text fontSize="sm" fontWeight="medium">
          Proposed Revision for Claim {claimNumber}
        </Text>
        <IconButton
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          size="xs"
          variant="ghost"
        />
      </Flex>

      {/* Content */}
      <Collapse in={isExpanded}>
        <Box p={4}>
          {/* Diff display */}
          <Box
            p={3}
            bg="gray.50"
            _dark={{ bg: 'gray.900' }}
            borderRadius="md"
            fontFamily="mono"
            fontSize="sm"
            lineHeight="1.6"
            mb={4}
            overflowX="auto"
          >
            {changes.map((change, idx) => {
              if (change.type === 'added') {
                return (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: addedBg,
                      color: addedColor,
                      fontWeight: 600,
                      padding: '0 2px',
                    }}
                  >
                    {change.value}
                  </span>
                );
              } else if (change.type === 'removed') {
                return (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: removedBg,
                      color: removedColor,
                      textDecoration: 'line-through',
                      opacity: 0.7,
                      padding: '0 2px',
                    }}
                  >
                    {change.value}
                  </span>
                );
              } else {
                return <span key={idx}>{change.value}</span>;
              }
            })}
          </Box>

          {/* Action buttons */}
          <Flex gap={3} justify="flex-end">
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              leftIcon={<FiX />}
              onClick={handleReject}
              isDisabled={applyRevisionMutation.isPending}
            >
              Reject
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FiCheck />}
              onClick={handleApply}
              isLoading={applyRevisionMutation.isPending}
              loadingText="Applying..."
            >
              Apply Revision
            </Button>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
}; 