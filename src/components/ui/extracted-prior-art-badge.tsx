import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200"
          >
            <FiFileText size={10} />
            From Disclosure
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
