import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/utils/clientLogger';
import { getTenantSlugFromPath } from '@/utils/tenant';
import { MinimalSpinner } from '../common/MinimalSpinner';

interface TenantGuardProps {
  children: React.ReactNode;
  requireTenant?: boolean;
}

/**
 * TenantGuard - Validates that the current URL tenant is valid for the authenticated user
 *
 * Security Features:
 * - Validates tenant exists in user's available tenants
 * - Redirects to appropriate tenant if invalid
 * - Shows loading states during validation
 * - Provides error handling for tenant access issues
 */
export function TenantGuard({
  children,
  requireTenant = true,
}: TenantGuardProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userTenants, isLoading: tenantLoading } = useTenant();
  const [validationState, setValidationState] = useState<
    'loading' | 'valid' | 'invalid' | 'redirecting'
  >('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Track if we've completed initial validation
  const hasInitialized = useRef(false);
  const previousUrlTenant = useRef<string | null>(null);

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) {
      // Only show loading on initial mount
      if (!hasInitialized.current) {
        setValidationState('loading');
      }
      return;
    }

    // If auth is still loading on initial mount, show loading
    if (authLoading && !hasInitialized.current) {
      setValidationState('loading');
      return;
    }

    // If not authenticated, let auth handle the redirect
    if (!user) {
      // Only reset to loading if we haven't initialized yet
      if (!hasInitialized.current) {
        setValidationState('loading');
      }
      return;
    }

    // If tenants are still loading on initial mount, wait
    if (tenantLoading && !hasInitialized.current) {
      setValidationState('loading');
      return;
    }

    // Get tenant slug from URL
    const urlTenantSlug = getTenantSlugFromPath();

    // Check if we've already validated this tenant
    if (
      hasInitialized.current &&
      urlTenantSlug === previousUrlTenant.current &&
      validationState === 'valid'
    ) {
      // Same tenant, already validated - no need to re-validate
      return;
    }

    previousUrlTenant.current = urlTenantSlug;

    // If no tenant in URL and tenant is required
    if (!urlTenantSlug && requireTenant) {
      logger.warn('No tenant in URL but tenant is required');
      handleInvalidTenant('No organization specified in URL');
      hasInitialized.current = true;
      return;
    }

    // If no tenant required and no tenant in URL, allow access
    if (!urlTenantSlug && !requireTenant) {
      setValidationState('valid');
      hasInitialized.current = true;
      return;
    }

    // Check if user has access to any tenants
    if (!userTenants || userTenants.length === 0) {
      logger.warn('User has no available tenants');
      handleInvalidTenant('No organizations available for this user');
      hasInitialized.current = true;
      return;
    }

    // Validate the URL tenant against user's available tenants
    const tenantFromUrl = userTenants.find(t => t.slug === urlTenantSlug);

    if (!tenantFromUrl) {
      logger.warn('User does not have access to tenant from URL', {
        urlTenant: urlTenantSlug,
        userTenants: userTenants.map(t => t.slug),
      });
      handleInvalidTenant(`Access denied to organization "${urlTenantSlug}"`);
      hasInitialized.current = true;
      return;
    }

    // Valid tenant - allow access
    logger.debug('Tenant validation passed', { tenant: urlTenantSlug });
    setValidationState('valid');
    hasInitialized.current = true;
  }, [
    router.isReady,
    authLoading,
    user,
    tenantLoading,
    userTenants,
    requireTenant,
    validationState,
  ]);

  const handleInvalidTenant = (message: string) => {
    setErrorMessage(message);
    setValidationState('invalid');
  };

  const handleRedirectToValidTenant = async () => {
    if (!userTenants || userTenants.length === 0) {
      // No tenants available - redirect to home
      router.push('/');
      return;
    }

    setValidationState('redirecting');

    if (userTenants.length === 1) {
      // Single tenant - redirect to their projects
      await router.push(`/${userTenants[0].slug}/projects`);
    } else {
      // Multiple tenants - go to tenant selector
      await router.push('/select-tenant');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Only show loading for slow validation (most users won't see this) - with higher z-index
  if (authLoading || tenantLoading || validationState === 'loading') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <MinimalSpinner size="md" />
      </div>
    );
  }

  // No user or tenants - minimal loading (auth will handle redirect) - with higher z-index
  if (!user || userTenants.length === 0) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <MinimalSpinner size="md" />
      </div>
    );
  }

  // Redirecting state - minimal feedback - with higher z-index
  if (validationState === 'redirecting') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <MinimalSpinner size="md" message="Redirecting..." />
      </div>
    );
  }

  // Invalid tenant state
  if (validationState === 'invalid') {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-4" />
              <AlertTitle className="text-lg mb-2">
                Organization Access Denied
              </AlertTitle>
              <AlertDescription className="max-w-sm">
                {errorMessage}
              </AlertDescription>
            </div>
          </Alert>

          <div className="flex flex-col gap-3 mt-6 items-center">
            <Button
              onClick={handleRedirectToValidTenant}
              disabled={!userTenants || userTenants.length === 0}
              className="w-full max-w-xs"
            >
              {userTenants && userTenants.length === 1
                ? `Go to ${userTenants[0].name}`
                : userTenants && userTenants.length > 1
                  ? 'Choose Organization'
                  : 'No Organizations Available'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className="w-full max-w-xs"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Valid tenant - render children
  return <>{children}</>;
}

export default TenantGuard;
