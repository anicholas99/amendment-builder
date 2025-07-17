import React from 'react';
import { useRouter } from 'next/router';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/utils/clientLogger';
import { useQueryClient } from '@tanstack/react-query';
import { resetTenantCache } from '@/utils/tenant';
import { clearApiCache } from '@/lib/api/apiClient';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TenantSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentTenant, userTenants, getUrlTenantSlug } = useTenant();

  // Get the URL tenant slug to display even if it's invalid
  const urlTenantSlug = getUrlTenantSlug();

  // Show tenant switcher if:
  // 1. User has multiple tenants available
  // 2. OR user has at least one tenant but current URL tenant is invalid
  const shouldShowSwitcher =
    userTenants &&
    (userTenants.length > 1 ||
      (userTenants.length >= 1 &&
        urlTenantSlug &&
        !userTenants.some(t => t.slug === urlTenantSlug)));

  if (!shouldShowSwitcher) {
    return null;
  }

  // Display name priority: valid current tenant > URL tenant slug > "Select Organization"
  const displayName =
    currentTenant?.name ||
    currentTenant?.slug ||
    (urlTenantSlug && !userTenants.some(t => t.slug === urlTenantSlug)
      ? `Invalid: ${urlTenantSlug}`
      : null) ||
    'Select Organization';

  const handleTenantSwitch = async (tenantSlug: string) => {
    if (tenantSlug === currentTenant?.slug) return;

    try {
      // Reset tenant cache BEFORE navigation to update query key generation
      resetTenantCache();

      // Clear API request cache to prevent stale responses
      clearApiCache();

      // Navigate to the new tenant's projects page
      // The tenant context will update based on the URL change
      // React Query will automatically fetch new data with the new tenant prefix
      await router.push(`/${tenantSlug}/projects`);

      // After navigation, invalidate all queries to force refetch with new tenant context
      // This follows the pattern used in useSwitchTenantMutation
      await queryClient.invalidateQueries();
    } catch (error) {
      logger.error('Failed to switch tenant:', error);
    }
  };

  const isInvalidTenant =
    urlTenantSlug && !userTenants.some(t => t.slug === urlTenantSlug);

  return (
    <DropdownMenu key={currentTenant?.id || 'no-tenant'}>
      <DropdownMenuTrigger
        className={cn(
          'h-9 px-3 rounded-lg flex items-center gap-2',
          'transition-all duration-200 cursor-pointer',
          'border border-transparent hover:border-border/50',
          isInvalidTenant
            ? 'text-destructive hover:bg-destructive/10 hover:border-destructive/20'
            : 'text-foreground hover:bg-accent/50'
        )}
      >
        <span className="text-sm font-medium">{displayName}</span>
        <FiChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-card border-border shadow-lg p-1">
        {userTenants.map(tenant => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleTenantSwitch(tenant.slug)}
            className={cn(
              'cursor-pointer flex items-center',
              tenant.id === currentTenant?.id
                ? 'bg-accent'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700',
              'text-gray-700 dark:text-gray-300'
            )}
          >
            <div className="w-4 mr-2 flex justify-center">
              {tenant.id === currentTenant?.id ? (
                <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : null}
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{tenant.name || tenant.slug}</span>
              <span className="text-xs text-muted-foreground">
                {tenant.slug}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="border-border" />
        <DropdownMenuItem
          onClick={() => router.push('/select-tenant')}
          className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Manage Organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
