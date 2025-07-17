import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Quick test component to verify shimmer animation is working
 */
export const ShimmerTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Shimmer Animation Test</h1>
        <p className="text-muted-foreground">
          This page tests the shimmer animation to ensure it's working
          correctly.
        </p>
      </div>

      {/* Individual skeleton components */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Individual Skeleton Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Basic Shimmer</h3>
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
            <Skeleton className="h-4 w-1/2" variant="shimmer" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Different Sizes</h3>
            <Skeleton className="h-8 w-full" variant="shimmer" />
            <Skeleton className="h-6 w-3/4" variant="shimmer" />
            <Skeleton className="h-4 w-1/2" variant="shimmer" />
          </div>
        </div>
      </div>

      {/* Skeleton patterns */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Skeleton Patterns</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="font-medium mb-3">Document Pattern</h3>
            <SkeletonLoader type="document" variant="shimmer" />
          </div>

          <div>
            <h3 className="font-medium mb-3">Projects Dashboard</h3>
            <SkeletonLoader
              type="projects-dashboard"
              variant="shimmer"
              count={2}
            />
          </div>

          <div>
            <h3 className="font-medium mb-3">Table Pattern</h3>
            <SkeletonLoader type="table" variant="shimmer" count={3} />
          </div>

          <div>
            <h3 className="font-medium mb-3">Form Pattern</h3>
            <SkeletonLoader type="form" variant="shimmer" count={4} />
          </div>
        </div>
      </div>

      {/* Animation comparison */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Animation Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium">Shimmer</h3>
            <Skeleton className="h-4 w-full" variant="shimmer" />
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Wave</h3>
            <Skeleton className="h-4 w-full" variant="wave" />
            <Skeleton className="h-4 w-3/4" variant="wave" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Pulse</h3>
            <Skeleton className="h-4 w-full" variant="pulse" />
            <Skeleton className="h-4 w-3/4" variant="pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Glow</h3>
            <Skeleton className="h-4 w-full" variant="glow" />
            <Skeleton className="h-4 w-3/4" variant="glow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShimmerTest;
