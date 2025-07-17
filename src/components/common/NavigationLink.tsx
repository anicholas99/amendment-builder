/**
 * NavigationLink component with hover prefetching
 * Provides instant navigation by preloading data on hover intent
 */
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePrefetchViewData } from '@/hooks/navigation/usePrefetchViewData';
import { logger } from '@/utils/clientLogger';
import Link from 'next/link';

export interface NavigationLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  viewType?: 'technology' | 'claim-refinement' | 'patent';
  projectId?: string;
  children: React.ReactNode;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  viewType,
  projectId,
  children,
  onMouseEnter,
  className,
  ...props
}) => {
  const router = useRouter();
  const {
    prefetchTechnology,
    prefetchClaimRefinement,
    prefetchPatentApplication,
  } = usePrefetchViewData();

  const handleMouseEnter = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call the original onMouseEnter if provided
      onMouseEnter?.(e);

      // Only prefetch if we have both viewType and projectId
      if (!viewType || !projectId) return;

      try {
        logger.debug('[NavigationLink] Prefetching on hover', {
          viewType,
          projectId,
        });

        switch (viewType) {
          case 'technology':
            await prefetchTechnology(projectId);
            break;
          case 'claim-refinement':
            await prefetchClaimRefinement(projectId);
            break;
          case 'patent':
            await prefetchPatentApplication(projectId);
            break;
        }
      } catch (error) {
        // Silently fail prefetch - it's just an optimization
        logger.debug('[NavigationLink] Prefetch failed', { error, viewType });
      }
    },
    [
      viewType,
      projectId,
      prefetchTechnology,
      prefetchClaimRefinement,
      prefetchPatentApplication,
      onMouseEnter,
    ]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(href);
    },
    [router, href]
  );

  return (
    <Link href={href} passHref legacyBehavior>
      <a
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={`text-blue-600 hover:text-blue-800 hover:underline ${className || ''}`}
        {...props}
      >
        {children}
      </a>
    </Link>
  );
};
