import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Center,
  VStack,
  Text,
  Spinner,
  Heading,
  Button,
  Box,
} from '@chakra-ui/react';
import { environment } from '@/config/environment';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import {
  getLastSelectedTenant,
  saveLastSelectedTenant,
} from '@/utils/tenantPreferences';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userTenants } = useTenant();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (authLoading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push('/api/auth/login');
      return;
    }

    // Check for last selected tenant
    const lastSelectedTenant = getLastSelectedTenant();

    // If we have a last selected tenant and user still has access to it, go there
    if (lastSelectedTenant && userTenants && !isRedirecting) {
      const hasAccess = userTenants.some(t => t.slug === lastSelectedTenant);
      if (hasAccess) {
        setIsRedirecting(true);
        router.push(`/${lastSelectedTenant}/projects`);
        return;
      }
    }

    // If user has only one tenant, auto-redirect to it
    if (userTenants && userTenants.length === 1 && !isRedirecting) {
      setIsRedirecting(true);
      saveLastSelectedTenant(userTenants[0].slug);
      router.push(`/${userTenants[0].slug}/projects`);
      return;
    }

    // If user has multiple tenants, go to tenant selector
    if (userTenants && userTenants.length > 1 && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/select-tenant');
      return;
    }

    // No automatic redirect anymore - proper tenant selection required
  }, [user, authLoading, userTenants, router, isRedirecting]);

  // Loading state
  if (authLoading || isRedirecting) {
    return (
      <Center height="100vh" width="100vw" position="fixed" top="0" left="0">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Center>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Center height="100vh" width="100vw" position="fixed" top="0" left="0">
        <VStack spacing={4}>
          <Heading size="lg">Welcome to Patent Drafter AI</Heading>
          <Text>Please log in to continue</Text>
          <Button
            colorScheme="blue"
            onClick={() => router.push('/api/auth/login')}
          >
            Log In
          </Button>
        </VStack>
      </Center>
    );
  }

  // No tenants (edge case - should redirect to selector)
  if (!userTenants || userTenants.length === 0) {
    return (
      <Center height="100vh" width="100vw" position="fixed" top="0" left="0">
        <VStack spacing={4}>
          <Heading size="lg">No Organization Access</Heading>
          <Text>You don't have access to any organizations.</Text>
          <Text fontSize="sm" color="gray.600">
            Please contact your administrator.
          </Text>
        </VStack>
      </Center>
    );
  }

  // Fallback - show loading (should not reach here in normal flow)
  return (
    <Center height="100vh" width="100vw" position="fixed" top="0" left="0">
      <VStack spacing={4}>
        <Spinner size="xl" />
        <Text>Redirecting...</Text>
      </VStack>
    </Center>
  );
}
