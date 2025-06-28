import React from 'react';
import { Box, Badge, HStack, Icon } from '@chakra-ui/react';
import { FiRefreshCw, FiXCircle } from 'react-icons/fi';
import { removeDashes } from '../../utils/dateFormatting';

export interface ReferenceJobStatus {
  referenceNumber: string;
  status: string;
  relevancyScore?: number;
  isOptimistic?: boolean;
  wasOptimistic?: boolean;
  createdAt?: string;
}

interface ReferenceBadgesProps {
  referenceJobStatuses: ReferenceJobStatus[];
  selectedReference: string | null;
  onSelectReference: (refNumber: string | null) => void;
}

export const ReferenceBadges = React.memo(function ReferenceBadges({
  referenceJobStatuses,
  selectedReference,
  onSelectReference,
}: ReferenceBadgesProps) {
  if (referenceJobStatuses.length === 0) {
    return null;
  }

  return (
    <HStack
      spacing={2}
      overflowX="auto"
      pt={1}
      pb={2}
      mb={1}
      className="citation-references"
    >
      {referenceJobStatuses.map(({ referenceNumber, status }) => {
        const isSelected = selectedReference === referenceNumber;
        const isProcessing = status === 'processing' || status === 'pending';
        const isFailed = status === 'failed';
        const isCompleted = status === 'completed';

        return (
          <Box key={referenceNumber} display="flex" alignItems="center">
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              cursor="pointer"
              onClick={() => onSelectReference(referenceNumber)}
              bg={
                isSelected
                  ? 'blue.500'
                  : isProcessing
                    ? 'yellow.100'
                    : isFailed
                      ? 'red.100'
                      : 'bg.card'
              }
              color={
                isSelected
                  ? 'white'
                  : isProcessing
                    ? 'yellow.800'
                    : isFailed
                      ? 'red.700'
                      : 'text.primary'
              }
              borderWidth="1px"
              borderColor={
                isSelected
                  ? 'blue.500'
                  : isProcessing
                    ? 'yellow.300'
                    : isFailed
                      ? 'red.300'
                      : 'border.primary'
              }
              _hover={{
                bg: isSelected
                  ? 'blue.600'
                  : isProcessing
                    ? 'yellow.200'
                    : isFailed
                      ? 'red.200'
                      : 'bg.hover',
                borderColor: isSelected
                  ? 'blue.600'
                  : isProcessing
                    ? 'yellow.400'
                    : isFailed
                      ? 'red.400'
                      : 'border.primary',
                transform: 'translateY(-1px)',
                boxShadow: 'sm',
              }}
              _active={{
                transform: 'translateY(0px)',
                boxShadow: 'xs',
              }}
              display="inline-flex"
              alignItems="center"
              transition="background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
            >
              {/* Status Indicator */}
              {isProcessing && (
                <Box
                  as="span"
                  display="inline-flex"
                  mr={1.5}
                  animation="spin 1s linear infinite"
                  sx={{
                    '@keyframes spin': {
                      from: { transform: 'rotate(0deg)' },
                      to: { transform: 'rotate(360deg)' },
                    },
                  }}
                >
                  <Icon
                    as={FiRefreshCw}
                    size="xs"
                    color={isSelected ? 'white' : 'blue.500'}
                  />
                </Box>
              )}
              {isFailed && (
                <Icon
                  as={FiXCircle}
                  mr={1.5}
                  color={isSelected ? 'white' : 'red.500'}
                />
              )}

              {/* Reference Number - Remove dashes */}
              {removeDashes(referenceNumber)}
            </Badge>
          </Box>
        );
      })}
    </HStack>
  );
});
