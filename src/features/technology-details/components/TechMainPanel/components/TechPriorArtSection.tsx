import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import EditableList from '../../../../../components/common/EditableList';
import ContentEditableList from '../../../../../components/common/ContentEditableList';
import { TechSectionProps } from '../types';
import { PriorArtReference } from '../../../../../types/api';

interface TechPriorArtSectionProps extends TechSectionProps {
  onUpdatePriorArt: (items: PriorArtReference[]) => void;
}

/**
 * Component for displaying and editing the invention's prior art
 */
export const TechPriorArtSection: React.FC<TechPriorArtSectionProps> = ({
  analyzedInvention,
  getFontSize,
  onUpdatePriorArt,
}) => {
  return (
    <Box mb={4}>
      <Text fontSize={getFontSize('lg')} fontWeight="semibold" mb={2}>
        Prior Art
      </Text>
      <ContentEditableList
        items={(analyzedInvention?.priorArt || []).map((art: any) => {
          // Ensure art is treated as PriorArtReference with required title property
          const priorArt = art as PriorArtReference;
          return priorArt.title || '';
        })}
        onChange={titles => {
          // Create new PriorArtReference objects with titles
          const newPriorArt = titles.map((title, index) => {
            // Try to preserve existing prior art data
            const existingArt = analyzedInvention?.priorArt?.[index] as
              | PriorArtReference
              | undefined;
            return {
              id: existingArt?.id || `prior-art-${index}`,
              referenceNumber: existingArt?.referenceNumber || `ref-${index}`,
              number: String(
                existingArt?.number ||
                  existingArt?.referenceNumber ||
                  `ref-${index}`
              ),
              patentNumber: String(
                existingArt?.patentNumber ||
                  existingArt?.number ||
                  existingArt?.referenceNumber ||
                  `ref-${index}`
              ),
              title,
              abstract: existingArt?.abstract || '',
              relevance: existingArt?.relevance || 0,
              source: existingArt?.source || ('Manual' as const),
              metadata: existingArt?.metadata || {},
            };
          });
          onUpdatePriorArt(newPriorArt);
        }}
        placeholder="Add prior art reference..."
        fontSize={getFontSize('md')}
        lineHeight={1.8}
      />
    </Box>
  );
};

export default TechPriorArtSection;
