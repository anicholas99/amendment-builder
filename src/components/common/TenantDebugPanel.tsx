import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import {
  getTenantDebugInfo,
  fixTenantContext,
  clearAllTenantCaches,
  clearProjectCaches,
} from '@/utils/tenantDebug';
import { getCachedTenantSlug, getLastPathChecked } from '@/utils/tenant';
import { RefreshCw, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export const TenantDebugPanel: React.FC = () => {
  const { currentTenant, userTenants } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [debugInfo, setDebugInfo] = useState(getTenantDebugInfo());
  const [isFixing, setIsFixing] = useState(false);
  const [isClearingProjects, setIsClearingProjects] = useState(false);

  // Get project cache info
  const projectQueries = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['projects'] });
  const hasProjectCache = projectQueries.length > 0;
  const projectCacheData = projectQueries[0]?.state?.data as any;
  const cachedProjectCount =
    projectCacheData?.pages?.[0]?.projects?.length || 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(getTenantDebugInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFixTenant = async (targetTenant: string) => {
    setIsFixing(true);
    await fixTenantContext(targetTenant);
  };

  const handleClearProjectCache = async () => {
    setIsClearingProjects(true);
    clearProjectCaches();

    // Also invalidate and refetch immediately
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
    await queryClient.refetchQueries({ queryKey: ['projects'] });

    // Wait a bit for the refetch to complete
    setTimeout(() => {
      setIsClearingProjects(false);
    }, 2000);
  };

  const cachedSlug = getCachedTenantSlug();
  const lastPath = getLastPathChecked();

  // Detect issues
  const issues = [];
  if (debugInfo.extractedTenant !== currentTenant?.slug) {
    issues.push(
      `URL tenant (${debugInfo.extractedTenant}) doesn't match context tenant (${currentTenant?.slug})`
    );
  }
  if (cachedSlug && cachedSlug !== debugInfo.extractedTenant) {
    issues.push(
      `Cached tenant (${cachedSlug}) doesn't match URL tenant (${debugInfo.extractedTenant})`
    );
  }
  if (
    debugInfo.pathname.includes('/oop/') ||
    debugInfo.extractedTenant === 'oop'
  ) {
    issues.push('You are currently in the "oop" tenant context');
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[9999] w-full max-w-[400px]',
        'bg-card shadow-xl rounded-lg p-4 border',
        issues.length > 0 ? 'border-red-500' : 'border-green-500'
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">🏢 Tenant Debug</h3>
          {issues.length > 0 ? (
            <Badge variant="destructive">Issues Detected</Badge>
          ) : (
            <Badge className="bg-green-600 hover:bg-green-700">All Good</Badge>
          )}
        </div>

        <Separator />

        {issues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col gap-1">
                {issues.map((issue, i) => (
                  <p key={i} className="text-xs">
                    {issue}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs font-bold">Current URL:</p>
            <code className="text-xs w-full p-1 bg-muted rounded block">
              {debugInfo.pathname}
            </code>
          </div>

          <div>
            <p className="text-xs font-bold">Extracted Tenant:</p>
            <code
              className={cn(
                'text-xs px-2 py-1 rounded inline-block',
                debugInfo.extractedTenant === 'development'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              )}
            >
              {debugInfo.extractedTenant}
            </code>
          </div>

          <div>
            <p className="text-xs font-bold">Context Tenant:</p>
            <code
              className={cn(
                'text-xs px-2 py-1 rounded inline-block',
                currentTenant?.slug === 'development'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              )}
            >
              {currentTenant?.slug || 'None'}
            </code>
          </div>

          <div>
            <p className="text-xs font-bold">Cached Tenant:</p>
            <code
              className={cn(
                'text-xs px-2 py-1 rounded inline-block',
                cachedSlug === 'development'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              )}
            >
              {cachedSlug || 'None'}
            </code>
          </div>

          <div>
            <p className="text-xs font-bold">Project Cache:</p>
            <code
              className={cn(
                'text-xs px-2 py-1 rounded inline-block',
                hasProjectCache
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              )}
            >
              {hasProjectCache
                ? `${cachedProjectCount} projects cached`
                : 'No cache'}
            </code>
          </div>

          <div>
            <p className="text-xs font-bold">Available Tenants:</p>
            <div className="flex flex-wrap gap-2">
              {userTenants.map(tenant => (
                <Badge
                  key={tenant.id}
                  variant={
                    tenant.slug === currentTenant?.slug
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {tenant.slug}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleClearProjectCache}
            disabled={isClearingProjects}
          >
            <Database className="mr-2 h-4 w-4" />
            {isClearingProjects
              ? 'Clearing...'
              : 'Clear Project Cache & Refetch'}
          </Button>

          <Button
            size="sm"
            className="w-full"
            onClick={() => handleFixTenant('development')}
            disabled={isFixing}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isFixing ? 'Fixing...' : 'Fix to Development Tenant'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={clearAllTenantCaches}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear All Caches & Reload
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          User: {user?.email || 'Not logged in'}
        </p>
      </div>
    </div>
  );
};
