import React from 'react';
import { cn } from '@/lib/utils';

interface ClaimReferenceLinkProps {
  claimNumber: number;
  projectId: string;
  onClick?: (claimNumber: number) => void;
}

export const ClaimReferenceLink: React.FC<ClaimReferenceLinkProps> = ({
  claimNumber,
  projectId: _projectId, // Unused but kept for compatibility
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(claimNumber);
    }
  };

  return (
    <span
      className={cn(
        // Base styles for exact visual consistency
        'text-blue-600 dark:text-blue-300 underline font-medium transition-opacity',
        // Conditional cursor and hover
        onClick
          ? 'cursor-pointer hover:no-underline hover:opacity-80'
          : 'cursor-default'
      )}
      onClick={onClick ? handleClick : undefined}
    >
      claim {claimNumber}
    </span>
  );
};
