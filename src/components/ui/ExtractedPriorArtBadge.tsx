import React from 'react';
import { Badge, Tooltip } from '@chakra-ui/react';
import { FiFileText } from 'react-icons/fi';

interface ExtractedPriorArtBadgeProps {
  /** The context in which the reference was mentioned */
  context?: string;
  /** The relevance of the reference */
  relevance?: string;
  /** The original reference text from the disclosure */
  originalReference?: string;
}

/**
 * Badge component to indicate prior art extracted from invention disclosure
 */
export const ExtractedPriorArtBadge: React.FC<ExtractedPriorArtBadgeProps> = ({
  context,
  relevance,
  originalReference,
}) => {
  const tooltipContent = (
    <div>
      <strong>Extracted from invention disclosure</strong>
      {originalReference && (
        <div className="mt-1">
          <em>Original:</em> {originalReference}
        </div>
      )}
      {context && (
        <div className="mt-1">
          <em>Context:</em> {context}
        </div>
      )}
      {relevance && (
        <div className="mt-1">
          <em>Relevance:</em> {relevance}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip label={tooltipContent} hasArrow placement="top">
      <Badge
        colorScheme="purple"
        fontSize="xs"
        display="inline-flex"
        alignItems="center"
        gap={1}
      >
        <FiFileText size={10} />
        From Disclosure
      </Badge>
    </Tooltip>
  );
};
