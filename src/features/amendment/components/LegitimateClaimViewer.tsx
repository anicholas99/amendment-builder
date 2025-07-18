/**
 * LegitimateClaimViewer - Professional claim display for final documents
 * 
 * Shows claims in clean, USPTO-compliant format without diff highlighting
 * Suitable for official document previews and exports
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LegitimateClaimViewerProps {
  claimNumber: string;
  amendedText: string;
  status?: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
  className?: string;
}

const STATUS_PREFIX = {
  CURRENTLY_AMENDED: '(Currently Amended)',
  PREVIOUSLY_PRESENTED: '(Previously Presented)',
  NEW: '(New)',
  CANCELLED: '(Cancelled)',
} as const;

export const LegitimateClaimViewer: React.FC<LegitimateClaimViewerProps> = ({
  claimNumber,
  amendedText,
  status = 'CURRENTLY_AMENDED',
  className,
}) => {
  const prefix = STATUS_PREFIX[status];

  return (
    <div className={cn('mb-6', className)}>
      <div className="text-black leading-relaxed">
        <p className="mb-2">
          <span className="font-bold">{claimNumber}. {prefix} </span>
          <span className="whitespace-pre-wrap">{amendedText}</span>
        </p>
      </div>
    </div>
  );
};

export default LegitimateClaimViewer; 