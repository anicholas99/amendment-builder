import React from 'react';
import {
  HStack,
  IconButton,
  Icon,
  Link,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiExternalLink, FiBookmark, FiX } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';

interface ReferenceActionButtonsProps {
  referenceNumber: string;
  isSaved: boolean;
  isExcluded: boolean;
  onSave: () => void;
  onExclude: () => void;
  getCitationIcon: (referenceNumber: string) => React.ReactNode;
  isDisabled?: boolean;
}

/**
 * Reusable action buttons for reference cards (save, exclude, view external, citation)
 */
export const ReferenceActionButtons: React.FC<ReferenceActionButtonsProps> =
  React.memo(
    ({
      referenceNumber,
      isSaved,
      isExcluded,
      onSave,
      onExclude,
      getCitationIcon,
      isDisabled = false,
    }) => {
      const defaultIconColor = useColorModeValue('gray.700', 'white');
      const hoverIconColor = useColorModeValue('text.primary', 'gray.200');

      const handleExternalLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
      };

      const handleSaveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDisabled && !isExcluded) {
          onSave();
        }
      };

      const handleExcludeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDisabled && !isExcluded && !isSaved) {
          onExclude();
        }
      };

      return (
        <HStack spacing={0} onClick={e => e.stopPropagation()}>
          {/* View on Google Patents */}
          <Tooltip label="View on Google Patents" placement="top">
            <IconButton
              as={Link}
              href={`https://patents.google.com/patent/${referenceNumber.replace(/-/g, '')}/en`}
              isExternal
              aria-label="View external link"
              icon={<Icon as={FiExternalLink} />}
              variant="ghost"
              size="xs"
              color={defaultIconColor}
              onClick={handleExternalLinkClick}
              _hover={{
                color: hoverIconColor,
                bg: 'bg.hover',
              }}
            />
          </Tooltip>

          {/* Save/Unsave button */}
          <Tooltip
            label={isSaved ? 'Unsave prior art' : 'Save prior art'}
            placement="top"
          >
            <IconButton
              aria-label={isSaved ? 'Unsave prior art' : 'Save prior art'}
              icon={<Icon as={isSaved ? BsBookmarkFill : FiBookmark} />}
              variant="ghost"
              size="xs"
              color={isSaved ? 'blue.500' : defaultIconColor}
              onClick={handleSaveClick}
              isDisabled={isDisabled || isExcluded}
              _hover={{
                color: isSaved ? 'blue.600' : hoverIconColor,
                bg: isSaved ? 'blue.50' : 'bg.hover',
              }}
            />
          </Tooltip>

          {/* Citation icon (always rendered) */}
          {getCitationIcon(referenceNumber)}

          {/* Exclude button */}
          {!isExcluded && (
            <Tooltip label="Exclude reference" placement="top">
              <IconButton
                aria-label="Exclude reference"
                icon={<Icon as={FiX} />}
                variant="ghost"
                colorScheme="red"
                size="xs"
                color={'red.500'}
                isDisabled={isDisabled || isExcluded || isSaved}
                onClick={handleExcludeClick}
                _hover={{
                  color: 'red.600',
                  bg: 'red.50',
                }}
              />
            </Tooltip>
          )}
        </HStack>
      );
    }
  );

ReferenceActionButtons.displayName = 'ReferenceActionButtons';
