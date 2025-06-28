import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Center,
  VStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/lib/monitoring/logger';
import { saveLastSelectedTenant } from '@/utils/tenantPreferences';

export default function SelectTenant() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { userTenants, isLoading: tenantsLoading } = useTenant();
  const [isSelecting, setIsSelecting] = useState(false);

  // Use theme colors for better dark mode support
  const spinnerColor = useColorModeValue('blue.500', 'blue.400');

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !user) {
      router.push('/api/auth/login');
      return;
    }

    // If user has only one tenant, auto-redirect
    if (!tenantsLoading && userTenants && userTenants.length === 1) {
      handleTenantSelect(userTenants[0].slug);
    }
  }, [user, authLoading, userTenants, tenantsLoading]);

  const handleTenantSelect = async (tenantSlug: string) => {
    setIsSelecting(true);

    try {
      // Save the selected tenant as user preference
      saveLastSelectedTenant(tenantSlug);

      // Redirect to the tenant's projects page
      await router.push(`/${tenantSlug}/projects`);
    } catch (error) {
      logger.error('Failed to select tenant:', error);
      setIsSelecting(false);
    }
  };

  // Loading state
  if (authLoading || tenantsLoading || isSelecting) {
    return (
      <Center height="100vh" bg="bg.primary">
        <VStack spacing={4}>
          <Spinner size="xl" color={spinnerColor} />
          <Text color="text.primary">Loading organizations...</Text>
        </VStack>
      </Center>
    );
  }

  // No tenants
  if (!userTenants || userTenants.length === 0) {
    return (
      <Center height="100vh" bg="bg.primary">
        <VStack spacing={4}>
          <Heading size="lg" color="text.primary">
            No Organizations
          </Heading>
          <Text color="text.primary">
            You don't have access to any organizations.
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Please contact your administrator for access.
          </Text>
        </VStack>
      </Center>
    );
  }

  // Multiple tenants - show selector
  return (
    <Center minHeight="100vh" bg="bg.primary" py={8}>
      <Box maxW="800px" w="full" px={4}>
        <VStack spacing={8}>
          <VStack spacing={2}>
            <Heading size="xl" color="text.primary">
              Select Organization
            </Heading>
            <Text color="text.secondary">
              Choose the organization you want to work with
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            {userTenants.map(tenant => (
              <Card
                key={tenant.id}
                cursor="pointer"
                onClick={() => handleTenantSelect(tenant.slug)}
                bg="bg.card"
                borderWidth="1px"
                borderColor="border.light"
                boxShadow="md"
                _hover={{
                  bg: 'bg.hover',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                  borderColor: 'border.primary',
                }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Heading size="md" color="text.primary">
                      {tenant.name}
                    </Heading>
                    <Text fontSize="sm" color="text.secondary">
                      {tenant.slug}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/api/auth/logout')}
            color="text.primary"
            _hover={{
              bg: 'bg.hover',
            }}
          >
            Sign out
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
