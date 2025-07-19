import React from 'react';
import { logger } from '@/utils/clientLogger';
import { FileText, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TechSectionProps } from '../types';
import { hasSectionData } from '../../../../../utils/sectionUtils';
import { useRouter } from 'next/router';
import { NavigationButton } from '@/components/common/NavigationButton';

// This component displays the claims section of the technology details, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const TechClaimsSectionShadcn: React.FC<TechSectionProps> = React.memo(
  ({ analyzedInvention, getFontSize }) => {
    const router = useRouter();

    /**
     * Robustly resolve projectId & tenant.
     * router.query can briefly be undefined on first render – e.g. when navigating
     * via shallow routing or during fast refresh – causing our button to render
     * in a disabled state even though the values are available a few ms later.
     *
     * We therefore:
     *   1. Try to grab them from `router.query`.
     *   2. Fallback to parsing the current `asPath` when they are missing.
     */
    const queryProjectId = router.query.projectId as string | undefined;
    const queryTenant = router.query.tenant as string | undefined;

    const projectId =
      queryProjectId ?? router.asPath.match(/projects\/([^/]+)/)?.[1] ?? '';
    const tenant = queryTenant ?? router.asPath.match(/^\/([^/]+)/)?.[1] ?? '';

    /**
     * Build the navigation target.
     * When both `tenant` & `projectId` are present we construct the canonical
     * route directly. Otherwise, we fall back to a simple string replacement on
     * the current pathname so the user can still navigate even during the brief
     * window before dynamic route params are populated.
     */
    const claimRefinementHref = React.useMemo(() => {
      if (tenant && projectId) {
        return `/${tenant}/projects/${projectId}/amendments/studio`;
      }
      // Fallback: replace trailing documentType segment (e.g. "technology")
      // with "amendments/studio".
      return router.asPath.replace(/\/[^/]+$/, '/amendments/studio');
    }, [tenant, projectId, router.asPath]);

    if (!hasSectionData(analyzedInvention?.claims)) {
      return null;
    }

    return (
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-text-secondary" />
            <span
              className={cn(
                'font-bold text-text-primary',
                getFontSize('lg') === '1.125rem' && 'text-lg',
                getFontSize('lg') === '1.25rem' && 'text-xl',
                getFontSize('lg') === '1.5rem' && 'text-2xl'
              )}
            >
              Claims
            </span>
          </div>
          <NavigationButton
            href={claimRefinementHref}
            viewType="claims"
            projectId={projectId || undefined}
            size="sm"
            variant="outline"
            aria-label="Navigate to claim refinement view"
            className="hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            <Edit className="w-4 h-4 mr-2" />
            Refine Claims
          </NavigationButton>
        </div>

        {/* Content */}
        {hasSectionData(analyzedInvention?.claims) ? (
          <div className="flex flex-col gap-3">
            {Object.entries(analyzedInvention?.claims || {}).map(
              ([number, claim]) => (
                <div
                  key={number}
                  className="p-4 bg-muted rounded-md border border-border hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <p
                    className={cn(
                      'leading-relaxed',
                      getFontSize('md') === '1rem' && 'text-base',
                      getFontSize('md') === '1.125rem' && 'text-lg',
                      getFontSize('md') === '1.25rem' && 'text-xl'
                    )}
                  >
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {number}.
                    </span>{' '}
                    {claim}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-base">
              No claims have been generated yet
            </p>
          </div>
        )}
      </div>
    );
  }
);

TechClaimsSectionShadcn.displayName = 'TechClaimsSectionShadcn';

export default TechClaimsSectionShadcn;
