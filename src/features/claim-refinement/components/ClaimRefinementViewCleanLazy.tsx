import React, { lazy, Suspense } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

// Lazy load the component that includes react-dnd
const ClaimRefinementViewClean = lazy(
  () => import('./ClaimRefinementViewClean')
);

interface ClaimRefinementViewCleanProps {
  analyzedInvention?: Record<string, unknown>;
  setAnalyzedInvention?: (invention: Record<string, unknown>) => void;
}

const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <LoadingState
        variant="spinner"
        size="xl"
        message="Loading claim refinement view..."
      />
    </div>
  );
};

/**
 * Lazy-loaded wrapper for ClaimRefinementViewClean to improve initial page load performance
 */
const ClaimRefinementViewCleanLazy: React.FC<
  ClaimRefinementViewCleanProps
> = props => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClaimRefinementViewClean {...props} />
    </Suspense>
  );
};

export default ClaimRefinementViewCleanLazy;
