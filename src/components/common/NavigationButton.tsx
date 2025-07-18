/**
 * Navigation button with hover prefetching
 * Ensures data is loaded before user clicks
 */
import React, { useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { usePrefetchViewData } from '@/hooks/navigation/usePrefetchViewData';
import { logger } from '@/utils/clientLogger';
import { Button, ButtonProps } from '@/components/ui/button';

interface NavigationButtonProps extends Omit<ButtonProps, 'size'> {
  href: string;
  viewType?: 'technology' | 'claims' | 'patent' | 'all';
  projectId?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  href,
  viewType,
  projectId,
  children,
  onClick,
  size = 'md',
  colorScheme,
  variant,
  ...buttonProps
}) => {
  const router = useRouter();
  const prefetchTimer = useRef<NodeJS.Timeout>();
  const hasPrefetched = useRef(false);

  const {
    prefetchTechnology,
    prefetchClaimRefinement,
    prefetchPatentApplication,
    prefetchAllViews,
  } = usePrefetchViewData();

  // Start prefetching on hover
  const handleMouseEnter = useCallback(() => {
    if (hasPrefetched.current || !projectId || !viewType) return;

    // Delay prefetch slightly to avoid unnecessary calls
    prefetchTimer.current = setTimeout(async () => {
      hasPrefetched.current = true;

      try {
        switch (viewType) {
          case 'technology':
            await prefetchTechnology(projectId);
            break;
          case 'claims':
            await prefetchClaimRefinement(projectId);
            break;
          case 'patent':
            await prefetchPatentApplication(projectId);
            break;
          case 'all':
            await prefetchAllViews(projectId);
            break;
        }
      } catch (error) {
        logger.error('[NavigationButton] Prefetch failed', { error });
      }
    }, 150); // 150ms delay
  }, [
    viewType,
    projectId,
    prefetchTechnology,
    prefetchClaimRefinement,
    prefetchPatentApplication,
    prefetchAllViews,
  ]);

  // Cancel prefetch if mouse leaves quickly
  const handleMouseLeave = useCallback(() => {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
    }
  }, []);

  // Handle navigation - now instant without waiting
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      logger.debug('[NavigationButton] Clicked', {
        href,
        viewType,
        projectId,
      });

      // Call original onClick if provided
      if (onClick) {
        onClick(e);
      }

      // Navigate immediately - the cache will preserve our edits
      router.push(href);
    },
    [href, router, onClick, projectId]
  );

  // Reset prefetch state when projectId changes
  React.useEffect(() => {
    hasPrefetched.current = false;
  }, [projectId]);

  // Map props to shadcn/tailwind classes
  const getVariantClass = () => {
    if (variant === 'ghost') return 'ghost';
    if (variant === 'outline') return 'outline';
    if (variant === 'link') return 'link';
    if (colorScheme === 'red') return 'destructive';
    return 'default';
  };

  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'sm';
      case 'sm':
        return 'sm';
      case 'md':
        return 'default';
      case 'lg':
        return 'lg';
      default:
        return 'default';
    }
  };

  return (
    <Button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      variant={getVariantClass()}
      size={getSizeClass()}
      style={{
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
        ...buttonProps.style,
      }}
      className={buttonProps.className}
    >
      {children}
    </Button>
  );
};
