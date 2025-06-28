/* eslint-disable no-restricted-imports */
import React, { useEffect } from 'react';
import {
  Box,
  Icon,
  IconButton,
  Tooltip,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEye, FiList } from 'react-icons/fi';
import { hasReferenceWithCitations } from '../hooks/useCitationMatches';
import { logger } from '@/lib/monitoring/logger';

interface GetCitationIconParams {
  referenceNumber: string;
  entryId: string;
  citationJobNumbers: Set<string>;
  extractingReferenceRef: React.MutableRefObject<string | null>;
  onViewCitationsForReference?: (
    searchId: string,
    referenceNumber: string
  ) => void;
  onExtractCitationForReference?: (
    searchId: string,
    referenceNumber: string,
    claimSetVersionId?: string
  ) => Promise<{ id?: string | number; isSuccess?: boolean } | undefined>;
  claimSetVersionId?: string;
}

export const getCitationIcon = ({
  referenceNumber,
  entryId,
  citationJobNumbers,
  extractingReferenceRef,
  onViewCitationsForReference,
  onExtractCitationForReference,
  claimSetVersionId,
}: GetCitationIconParams) => {
  const iconColor = useColorModeValue('gray.600', 'blue.300');
  const iconHoverColor = useColorModeValue('gray.800', 'blue.100');

  const commonProps = {
    variant: 'ghost' as const,
    size: 'xs' as const,
    colorScheme: 'gray' as const,
  };

  // Generate a reference key
  const referenceKey = `${entryId}_${referenceNumber}`;
  const isExtracting = extractingReferenceRef.current === referenceKey;
  const hasJob = citationJobNumbers.has(referenceNumber);

  if (isExtracting) {
    return (
      <Tooltip
        label="Requesting citation extraction..."
        placement="top"
        hasArrow
        gutter={8}
        closeOnMouseDown
        closeOnPointerDown
      >
        <Box p={1}>
          <Spinner size="xs" color="blue.500" />
        </Box>
      </Tooltip>
    );
  } else if (hasJob) {
    return (
      <Tooltip
        label="View citations"
        placement="top"
        hasArrow
        gutter={8}
        closeOnMouseDown
        closeOnPointerDown
      >
        <IconButton
          {...commonProps}
          icon={<Icon as={FiEye} color={iconColor} />}
          aria-label="View citations for this search"
          onClick={e => {
            e.stopPropagation();
            requestAnimationFrame(() => {
              if (onViewCitationsForReference) {
                onViewCitationsForReference(entryId, referenceNumber);
              }
            });
          }}
          _hover={{
            color: iconHoverColor,
            bg: 'bg.hover',
          }}
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip
        label="Extract citation data"
        placement="top"
        hasArrow
        gutter={8}
        closeOnMouseDown
        closeOnPointerDown
      >
        <IconButton
          {...commonProps}
          aria-label="Extract citation data"
          icon={<Icon as={FiList} color={iconColor} />}
          onClick={e => {
            e.stopPropagation();
            if (onExtractCitationForReference) {
              onExtractCitationForReference(
                entryId,
                referenceNumber,
                claimSetVersionId
              );
            }
          }}
          _hover={{
            color: iconHoverColor,
            bg: 'bg.hover',
          }}
        />
      </Tooltip>
    );
  }
};

export const normalizePatentNumber = (patentNumber: string): string => {
  return patentNumber.replace(/-/g, '').toUpperCase();
};
