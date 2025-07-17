import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/utils/clientLogger';
import { MinimalSpinner } from '@/components/common/MinimalSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SelectTenant() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userTenants, isLoading: tenantsLoading } = useTenant();
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !user) {
      router.push('/api/auth/login');
      return;
    }

    // Don't process tenant logic while still loading
    if (tenantsLoading) return;

    // If user has only one tenant, auto-redirect
    if (userTenants && userTenants.length === 1) {
      handleTenantSelect(userTenants[0].slug);
    }
  }, [user, authLoading, userTenants, tenantsLoading]);

  const handleTenantSelect = async (tenantSlug: string) => {
    setIsSelecting(true);

    try {
      // Navigate directly without saving preference
      // Tenant context is determined by URL, not stored preferences
      await router.push(`/${tenantSlug}/projects`);
    } catch (error) {
      logger.error('Failed to select tenant:', error);
      setIsSelecting(false);
    }
  };

  const isLoading = authLoading || tenantsLoading || isSelecting;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <MinimalSpinner
          size="md"
          message={isSelecting ? 'Switching organizations...' : undefined}
        />
      </div>
    );
  }

  // No tenants
  if (!userTenants || userTenants.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">No Organizations</h1>
          <p className="text-muted-foreground">
            You don't have access to any organizations.
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  // Multiple tenants - show selector
  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-8">
      <div className="w-full max-w-3xl px-4">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Select Organization</h1>
            <p className="text-muted-foreground">
              Choose the organization you want to work with
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {userTenants.map(tenant => (
              <Card
                key={tenant.id}
                className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => handleTenantSelect(tenant.slug)}
              >
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tenant.slug}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/api/auth/logout')}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
