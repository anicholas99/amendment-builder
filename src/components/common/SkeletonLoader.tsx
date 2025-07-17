import React from 'react';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
} from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  type?:
    | 'document'
    | 'project'
    | 'sidebar'
    | 'projects-dashboard'
    | 'table'
    | 'list'
    | 'search-history'
    | 'project-list'
    | 'card'
    | 'form'
    | 'chat'
    | 'detailed-card';
  count?: number;
  variant?: 'default' | 'shimmer' | 'wave' | 'pulse' | 'glow';
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}

/**
 * Enhanced skeleton loader component with modern animations and patterns
 * Uses shadcn/ui skeleton components with improved visual design
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'document',
  count = 1,
  variant = 'shimmer',
  className,
  showAvatar = true,
  showActions = true,
}) => {
  // Enhanced document skeleton with better visual hierarchy
  if (type === 'document') {
    return (
      <div className={cn('w-full space-y-6', className)}>
        {/* Document Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-lg" variant={variant} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/5" variant={variant} />
              <Skeleton className="h-4 w-2/5 opacity-60" variant={variant} />
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/3" variant={variant} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" variant={variant} />
              <Skeleton className="h-4 w-5/6" variant={variant} />
              <Skeleton className="h-4 w-4/5" variant={variant} />
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/5" variant={variant} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" variant={variant} />
              <Skeleton className="h-4 w-11/12" variant={variant} />
              <Skeleton className="h-4 w-4/5" variant={variant} />
              <Skeleton className="h-4 w-3/4" variant={variant} />
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4" variant={variant} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" variant={variant} />
              <Skeleton className="h-4 w-5/6" variant={variant} />
            </div>
          </div>

          {/* Visual elements placeholder */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/5" variant={variant} />
            <div className="flex space-x-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-20 rounded-lg flex-shrink-0"
                  variant={variant}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced projects dashboard with modern card design
  if (type === 'projects-dashboard') {
    return (
      <div className={cn('space-y-4 w-full', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* Project header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {showAvatar && (
                    <SkeletonAvatar className="h-8 w-8" variant={variant} />
                  )}
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-48" variant={variant} />
                    <Skeleton className="h-4 w-32" variant={variant} />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" variant={variant} />
              </div>

              {/* Project metadata */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Skeleton
                    className="h-4 w-4 rounded-full"
                    variant={variant}
                  />
                  <Skeleton className="h-4 w-24" variant={variant} />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton
                    className="h-4 w-4 rounded-full"
                    variant={variant}
                  />
                  <Skeleton className="h-4 w-20" variant={variant} />
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-24 rounded-md" variant={variant} />
                <Skeleton className="h-6 w-16 rounded-md" variant={variant} />
                <Skeleton className="h-6 w-20 rounded-md" variant={variant} />
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex justify-end space-x-3 pt-2">
                  <SkeletonButton className="h-8 w-16" variant={variant} />
                  <SkeletonButton className="h-8 w-20" variant={variant} />
                  <SkeletonButton className="h-8 w-16" variant={variant} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Enhanced sidebar with better hierarchy
  if (type === 'sidebar') {
    return (
      <div className={cn('space-y-6 w-full', className)}>
        {/* Tab navigation area */}
        <div className="space-y-3">
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 w-12 rounded-md"
                variant={variant}
              />
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="space-y-4">
          {/* Section 1 */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" variant={variant} />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4 rounded" variant={variant} />
                  <Skeleton className="h-4 flex-1" variant={variant} />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2" variant={variant} />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full rounded-lg"
                  variant={variant}
                />
              ))}
            </div>
          </div>

          {/* Section 3 - More content */}
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" variant={variant} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced table with modern design
  if (type === 'table') {
    return (
      <div
        className={cn('overflow-hidden rounded-lg border bg-card', className)}
      >
        {/* Table header */}
        <div className="border-b bg-muted/50 px-6 py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2">
              <Skeleton className="h-4 w-20" variant={variant} />
            </div>
            <div className="col-span-5">
              <Skeleton className="h-4 w-32" variant={variant} />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-4 w-24" variant={variant} />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-4 w-16" variant={variant} />
            </div>
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {Array.from({ length: count || 5 }).map((_, index) => (
            <div key={index} className="p-6">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2">
                  <Skeleton className="h-4 w-full" variant={variant} />
                </div>
                <div className="col-span-5">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" variant={variant} />
                    <Skeleton className="h-3 w-3/4" variant={variant} />
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <Skeleton
                      className="h-5 w-5 rounded-full"
                      variant={variant}
                    />
                    <Skeleton className="h-4 w-16" variant={variant} />
                  </div>
                </div>
                <div className="col-span-2">
                  <Skeleton
                    className="h-8 w-8 rounded-full"
                    variant={variant}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced search history
  if (type === 'search-history') {
    return (
      <div className={cn('space-y-0 w-full', className)}>
        {Array.from({ length: count || 3 }).map((_, index) => (
          <div key={index} className="border-b bg-card">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton
                    className="h-5 w-5 rounded-full"
                    variant={variant}
                  />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" variant={variant} />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-3 w-20" variant={variant} />
                      <Skeleton className="h-3 w-28" variant={variant} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton
                    className="h-5 w-16 rounded-full"
                    variant={variant}
                  />
                  <Skeleton
                    className="h-8 w-8 rounded-full"
                    variant={variant}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Enhanced project list
  if (type === 'project-list') {
    return (
      <div className={cn('space-y-4 w-full', className)}>
        {/* Active project section */}
        <div>
          <Skeleton className="h-4 w-32 mb-3 ml-4" variant={variant} />
          <div className="bg-primary/5 rounded-lg mx-1 p-1">
            <div className="flex items-center py-3 px-4">
              <SkeletonAvatar className="h-6 w-6 mr-3" variant={variant} />
              <Skeleton className="h-4 w-40" variant={variant} />
              <div className="flex-1" />
              <Skeleton className="h-4 w-4 rounded-full" variant={variant} />
            </div>
          </div>
        </div>

        {/* All projects section */}
        <div>
          <Skeleton className="h-4 w-24 mb-3 ml-4" variant={variant} />
          <div className="space-y-1">
            {Array.from({ length: count || 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center py-3 px-4 hover:bg-muted/50 rounded-md"
              >
                <SkeletonAvatar className="h-6 w-6 mr-3" variant={variant} />
                <Skeleton
                  className={cn('h-4', `w-${32 + index * 4}`)}
                  variant={variant}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // New card pattern
  if (type === 'card') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} variant={variant} />
        ))}
      </div>
    );
  }

  // New detailed card pattern
  if (type === 'detailed-card') {
    return (
      <div className={cn('space-y-6', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border rounded-lg bg-card p-6 shadow-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SkeletonAvatar className="h-12 w-12" variant={variant} />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" variant={variant} />
                    <Skeleton className="h-4 w-24" variant={variant} />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Skeleton
                    className="h-6 w-6 rounded-full"
                    variant={variant}
                  />
                  <Skeleton
                    className="h-6 w-6 rounded-full"
                    variant={variant}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <SkeletonText lines={3} variant={variant} />
                <div className="flex space-x-2">
                  <Skeleton
                    className="h-6 w-16 rounded-full"
                    variant={variant}
                  />
                  <Skeleton
                    className="h-6 w-20 rounded-full"
                    variant={variant}
                  />
                  <Skeleton
                    className="h-6 w-12 rounded-full"
                    variant={variant}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-16" variant={variant} />
                  <Skeleton className="h-4 w-20" variant={variant} />
                </div>
                <div className="flex space-x-2">
                  <SkeletonButton className="h-8 w-16" variant={variant} />
                  <SkeletonButton className="h-8 w-20" variant={variant} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // New form pattern
  if (type === 'form') {
    return (
      <div className={cn('space-y-6 max-w-md', className)}>
        {Array.from({ length: count || 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" variant={variant} />
            <Skeleton className="h-10 w-full rounded-md" variant={variant} />
          </div>
        ))}
        <div className="flex space-x-3 pt-4">
          <SkeletonButton className="h-10 w-24" variant={variant} />
          <SkeletonButton className="h-10 w-20" variant={variant} />
        </div>
      </div>
    );
  }

  // New chat pattern
  if (type === 'chat') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: count || 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'flex',
              index % 2 === 0 ? 'justify-start' : 'justify-end'
            )}
          >
            <div
              className={cn(
                'flex space-x-3 max-w-xs',
                index % 2 === 0
                  ? 'flex-row'
                  : 'flex-row-reverse space-x-reverse'
              )}
            >
              <SkeletonAvatar className="h-8 w-8" variant={variant} />
              <div
                className={cn(
                  'bg-card border rounded-lg p-3',
                  index % 2 === 0 ? 'rounded-tl-sm' : 'rounded-tr-sm'
                )}
              >
                <SkeletonText lines={2} variant={variant} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Legacy project pattern (kept for compatibility)
  if (type === 'project') {
    return (
      <div className={cn('space-y-4 w-full', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded-md" variant={variant} />
                <Skeleton className="h-5 w-32" variant={variant} />
              </div>
              <Skeleton className="h-6 w-16" variant={variant} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default list pattern
  return (
    <div className={cn('space-y-4 w-full', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-full" variant={variant} />
          <Skeleton className="h-4 w-4/5" variant={variant} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
