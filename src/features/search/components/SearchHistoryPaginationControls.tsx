/* eslint-disable no-restricted-imports */
import React from 'react';
import { Text, Icon } from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface SearchHistoryPaginationControlsProps {
  totalResults: number;
  visibleResultsCount: number;
  initialVisibleCount: number;
  incrementCount: number;
  onShowMore: () => void;
  onShowLess: () => void;
}

export const SearchHistoryPaginationControls: React.FC<
  SearchHistoryPaginationControlsProps
> = ({
  totalResults,
  visibleResultsCount,
  initialVisibleCount,
  incrementCount,
  onShowMore,
  onShowLess,
}) => {
  return (
    <>
      {totalResults > visibleResultsCount && (
        <Text
          mt={3}
          fontSize="sm"
          textAlign="center"
          color="text.secondary"
          _hover={{
            color: 'text.primary',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={onShowMore}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {(() => {
            const remainingResults = totalResults - visibleResultsCount;
            const showNextCount = Math.min(incrementCount, remainingResults);
            return `Show ${remainingResults <= incrementCount ? 'all' : showNextCount} ${remainingResults === 1 ? 'remaining result' : `more results (${remainingResults} remaining)`}`;
          })()}
          <Icon as={FiChevronDown} ml={1} boxSize={3} />
        </Text>
      )}
      {visibleResultsCount > initialVisibleCount && (
        <Text
          mt={3}
          fontSize="sm"
          textAlign="center"
          color="text.secondary"
          _hover={{
            color: 'text.primary',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={onShowLess}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          Show less
          <Icon as={FiChevronUp} ml={1} boxSize={3} />
        </Text>
      )}
    </>
  );
};
