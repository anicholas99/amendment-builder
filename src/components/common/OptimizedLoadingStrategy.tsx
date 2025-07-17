import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { useProjects } from '@/hooks/api/useProjects';
import { cn } from '@/lib/utils';

interface LoadingState {
  type: 'auth' | 'tenant' | 'navigation' | 'projects';
  message: string;
  priority: number; // Higher = more important
  showSpinner: boolean;
}

interface OptimizedLoadingProps {
  children: React.ReactNode;
}

export const OptimizedLoadingProvider: React.FC<OptimizedLoadingProps> = ({
  children,
}) => {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const { isLoading: tenantLoading, currentTenant } = useTenant();
  const [activeLoading, setActiveLoading] = useState<LoadingState | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if we're on a projects page and need to coordinate project loading
  const shouldCoordinateProjects = router.asPath.includes('/projects');

  // NOTE: useProjects will always run (React hooks can't be conditional)
  // But React Query's caching makes this efficient - multiple calls to the same query
  // will be deduplicated and cached. This is a common pattern in React Query apps.
  const projectsQuery = useProjects({
    filterBy: 'all',
    sortBy: 'modified',
    sortOrder: 'desc',
  });

  // Only consider projects loading state when we're actually on a projects page
  const isProjectsLoading =
    shouldCoordinateProjects &&
    user &&
    currentTenant &&
    projectsQuery.isLoading;

  // Debounce rapid loading state changes
  const [debouncedLoading, setDebouncedLoading] = useState<LoadingState | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(activeLoading);
    }, 100); // Only show loading after 100ms to prevent flashes

    return () => clearTimeout(timer);
  }, [activeLoading]);

  // Handle route changes
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Determine the most important loading state
  useEffect(() => {
    const loadingStates: LoadingState[] = [];

    // Only show auth loading if it's taking a while AND we don't have user
    if (authLoading && !user) {
      loadingStates.push({
        type: 'auth',
        message: 'Signing in...',
        priority: 100,
        showSpinner: true,
      });
    }

    // Only show tenant loading if we have user but it's taking a while
    if (user && tenantLoading && !currentTenant) {
      loadingStates.push({
        type: 'tenant',
        message: 'Loading workspace...',
        priority: 90,
        showSpinner: true,
      });
    }

    // Projects loading (only if we have user and tenant and are on a projects page)
    if (isProjectsLoading) {
      loadingStates.push({
        type: 'projects',
        message: 'Loading projects...',
        priority: 85,
        showSpinner: true,
      });
    }

    // Navigation loading (only for major route changes)
    if (isNavigating && router.asPath.includes('/projects/')) {
      loadingStates.push({
        type: 'navigation',
        message: 'Switching projects...',
        priority: 80,
        showSpinner: false, // Use our ProjectTransitionLoader instead
      });
    }

    // Find highest priority loading state
    const highestPriority = loadingStates.reduce(
      (max, state) => (state.priority > max.priority ? state : max),
      { priority: -1 } as LoadingState
    );

    setActiveLoading(highestPriority.priority > -1 ? highestPriority : null);
  }, [
    authLoading,
    user,
    tenantLoading,
    currentTenant,
    isProjectsLoading,
    isNavigating,
    router.asPath,
  ]);

  // Don't show loading for very quick operations
  if (!debouncedLoading || !debouncedLoading.showSpinner) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {children}

      {/* Overlay for critical loading states only */}
      {debouncedLoading && (
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-foreground/80">
              {debouncedLoading.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook to manage data loading states without showing full-screen spinners
export const useOptimizedDataLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Set<string>>(new Set());

  const addLoading = useCallback((key: string) => {
    setLoadingStates(prev => new Set(prev).add(key));
  }, []);

  const removeLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isLoading = loadingStates.size > 0;

  return { isLoading, addLoading, removeLoading };
};
