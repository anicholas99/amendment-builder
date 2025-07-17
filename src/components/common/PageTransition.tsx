import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
}) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    const handleStart = () => {
      setIsTransitioning(true);
    };

    const handleComplete = () => {
      setIsTransitioning(false);
      setDisplayChildren(children);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router, children]);

  // Update display children when not transitioning
  useEffect(() => {
    if (!isTransitioning) {
      setDisplayChildren(children);
    }
  }, [children, isTransitioning]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isTransitioning
          ? 'opacity-0 translate-x-1'
          : 'opacity-100 translate-x-0',
        className
      )}
    >
      {displayChildren}
    </div>
  );
};

// Optimistic loading wrapper for instant feedback
export const OptimisticTransition: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  skeleton?: React.ReactNode;
}> = ({ children, isLoading, skeleton }) => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Show skeleton after a tiny delay to prevent flash
      const timer = setTimeout(() => setShowSkeleton(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  if (showSkeleton && skeleton) {
    return <>{skeleton}</>;
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isLoading ? 'opacity-50' : 'opacity-100'
      )}
    >
      {children}
    </div>
  );
};
