import React from 'react';
import {
  Box,
  Text,
  HStack,
  Badge,
  Tooltip,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import ReferenceRelevancySummary, {
  CitationMatchSummary,
} from '../ReferenceRelevancySummary';
import { parseAndFormatDate } from '../../utils/dateFormatting';

export interface DisplayableMetadata {
  title?: string | null;
  applicant?: string | null;
  assignee?: string | null;
  publicationDate?: string | null;
  isMetadataOnly?: boolean;
}

interface MetadataDisplayProps {
  referenceMetadata: DisplayableMetadata | null;
  selectedReference: string | null;
  isLoading: boolean;
  citationMatches?: CitationMatchSummary[];
}

export function MetadataDisplay({
  referenceMetadata,
  selectedReference,
  isLoading,
  citationMatches = [],
}: MetadataDisplayProps) {
  if (isLoading && !referenceMetadata && selectedReference) {
    return (
      <Flex align="center">
        <Spinner size="xs" mr={2} />
        <Text fontSize="sm" color="text.secondary">
          Loading reference details...
        </Text>
      </Flex>
    );
  }

  if (referenceMetadata) {
    return (
      <Box>
        <Tooltip
          label={referenceMetadata.title || ''}
          placement="bottom-start"
          openDelay={1000}
          hasArrow
        >
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
            {referenceMetadata.title || 'No Title Available'}
            {referenceMetadata.isMetadataOnly && (
              <Badge size="xs" ml={2} colorScheme="gray" fontSize="10px">
                No citations in this version
              </Badge>
            )}
          </Text>
        </Tooltip>
        <HStack spacing={2} fontSize="xs" color="text.secondary">
          {/* Force display the Relevancy Summary if we have a selected reference */}
          {selectedReference && !referenceMetadata.isMetadataOnly && (
            <ReferenceRelevancySummary
              referenceNumber={selectedReference}
              citationMatches={citationMatches}
            />
          )}
          {/* Add line separator after relevancy score */}
          {selectedReference && !referenceMetadata.isMetadataOnly && (
            <Text>|</Text>
          )}
          <Text>{referenceMetadata?.applicant || 'Unknown Applicant'}</Text>
          <Text>|</Text>
          <Text>{parseAndFormatDate(referenceMetadata?.publicationDate)}</Text>
        </HStack>
      </Box>
    );
  }

  if (!isLoading && selectedReference && !referenceMetadata) {
    return (
      <Text fontSize="sm" color="text.secondary">
        Metadata not found for {selectedReference}.
      </Text>
    );
  }

  return null;
}
