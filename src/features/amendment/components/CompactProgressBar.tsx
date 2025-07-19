/**
 * Compact Progress Bar - Space-efficient status flow visualization
 * 
 * Replaces multiple KPI tiles with a single horizontal progress indicator
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressSegment {
  label: string;
  count: number;
  color: string;
  isActive?: boolean;
}

interface CompactProgressBarProps {
  segments: ProgressSegment[];
  className?: string;
}

export const CompactProgressBar: React.FC<CompactProgressBarProps> = ({
  segments,
  className,
}) => {
  const totalCount = segments.reduce((sum, seg) => sum + seg.count, 0);

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {segments.map((segment, index) => {
          const widthPercent = totalCount > 0 ? (segment.count / totalCount) * 100 : 0;
          
          if (segment.count === 0) return null;
          
          return (
            <div
              key={segment.label}
              className={cn(
                'flex items-center justify-center text-xs font-medium transition-all',
                segment.color,
                segment.isActive && 'ring-2 ring-offset-2 ring-blue-500'
              )}
              style={{ width: `${widthPercent}%` }}
            >
              {segment.count}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center space-x-1">
            <span className="font-medium">{segment.label}</span>
            <span className="text-gray-400">({segment.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};