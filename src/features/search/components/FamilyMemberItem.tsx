import React, { useCallback } from 'react';
import { HStack, Text, Badge, Tooltip } from '@chakra-ui/react';
import {
  FamilyMemberReference,
  PriorArtReference,
} from '../../../types/claimTypes';
import {
  getRelevancyColor,
  formatRelevancePercentage,
} from '../utils/searchHistoryUtils';
import { ReferenceActionButtons } from './ReferenceActionButtons';

interface FamilyMemberItemProps {
  member: FamilyMemberReference;
  index: number;
  colors: {
    textColor: string;
    hoverBg: string;
  };
  isSaved: boolean;
  isExcluded: boolean;
  getCitationIcon: (referenceNumber: string) => React.ReactNode;
  onSave: (reference: PriorArtReference) => Promise<void> | void;
  onExclude: (reference: PriorArtReference) => void;
}

/**
 * Component for rendering a single family member item
 */
export const FamilyMemberItem: React.FC<FamilyMemberItemProps> = React.memo(
  ({
    member,
    index,
    colors,
    isSaved,
    isExcluded,
    getCitationIcon,
    onSave,
    onExclude,
  }) => {
    const memberNumber = member.number;
    // Check both relevance and relevancy fields
    const memberRelevanceScore = member.relevance ?? member.relevancy;
    const badgeColor =
      memberRelevanceScore !== undefined
        ? getRelevancyColor(memberRelevanceScore)
        : 'gray';

    const handleSave = useCallback(() => {
      onSave({
        number: memberNumber,
      } as PriorArtReference);
    }, [memberNumber, onSave]);

    const handleExclude = useCallback(() => {
      onExclude({
        number: memberNumber,
      } as PriorArtReference);
    }, [memberNumber, onExclude]);

    if (!memberNumber) return null;

    return (
      <HStack
        key={`${memberNumber}-${index}`}
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        py={0.5}
        opacity={isExcluded ? 0.5 : 1}
        _hover={{ bg: colors.hoverBg }}
        borderRadius="sm"
        px={1}
      >
        {/* Left side: Number and Badge */}
        <HStack spacing={2} flex={1} overflow="hidden" minWidth={0}>
          <Text
            fontSize="xs"
            color={colors.textColor}
            textDecoration={isExcluded ? 'line-through' : 'none'}
            noOfLines={1}
            title={memberNumber}
            flexShrink={1}
            mr={1}
          >
            {memberNumber.replace(/-/g, '')}
          </Text>
          {memberRelevanceScore !== undefined && (
            <Tooltip
              label={`Relevance: ${formatRelevancePercentage(memberRelevanceScore)}`}
              placement="top"
            >
              <Badge
                px={1.5}
                py={0.5}
                fontSize="2xs"
                fontWeight="medium"
                borderRadius="sm"
                colorScheme={badgeColor}
                variant="solid"
                flexShrink={0}
              >
                {formatRelevancePercentage(memberRelevanceScore)}
              </Badge>
            </Tooltip>
          )}
        </HStack>

        {/* Right side: Action buttons */}
        <ReferenceActionButtons
          referenceNumber={memberNumber}
          isSaved={isSaved}
          isExcluded={isExcluded}
          onSave={handleSave}
          onExclude={handleExclude}
          getCitationIcon={getCitationIcon}
          isDisabled={false}
        />
      </HStack>
    );
  }
);

FamilyMemberItem.displayName = 'FamilyMemberItem';
