import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { getLastSelectedTenant } from '@/utils/tenantPreferences';
import { logger } from '@/utils/clientLogger';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userTenants, isLoading: tenantsLoading } = useTenant();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;

    // If not authenticated, redirect to login immediately
    if (!user) {
      router.push('/api/auth/login');
      return;
    }

    // Don't process tenant logic while tenants are still loading
    if (tenantsLoading) return;

    // Prevent multiple redirects
    if (isRedirecting) return;

    // Check for last selected tenant
    const lastSelectedTenant = getLastSelectedTenant();

    // If we have a last selected tenant and user still has access to it, go there
    if (lastSelectedTenant && userTenants && userTenants.length > 0) {
      const hasAccess = userTenants.some(t => t.slug === lastSelectedTenant);
      if (hasAccess) {
        setIsRedirecting(true);
        router.push(`/${lastSelectedTenant}/projects`);
        return;
      }
    }

    // If user has only one tenant, auto-redirect to it
    if (userTenants && userTenants.length === 1) {
      setIsRedirecting(true);
      // Remove deprecated call - just navigate directly
      router.push(`/${userTenants[0].slug}/projects`);
      return;
    }

    // If user has multiple tenants, go to tenant selector
    if (userTenants && userTenants.length > 1) {
      setIsRedirecting(true);
      router.push('/select-tenant');
      return;
    }

    // If no tenants, stay on this page to show the message
  }, [user, authLoading, tenantsLoading, userTenants, router, isRedirecting]);

  // No user - let AuthGuard handle this
  if (!user && !authLoading) {
    return null; // AuthGuard will redirect
  }

  // No tenants (edge case)
  if (
    !authLoading &&
    !tenantsLoading &&
    user &&
    (!userTenants || userTenants.length === 0)
  ) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-semibold">No Organization Access</h1>
          <p className="text-foreground">
            You don't have access to any organizations.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Show minimal loading only for slow redirects - with higher z-index to appear above layout
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Default case - minimal loading with higher z-index to appear above layout
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
