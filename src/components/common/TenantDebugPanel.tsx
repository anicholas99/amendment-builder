import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Code,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import {
  getTenantDebugInfo,
  fixTenantContext,
  clearAllTenantCaches,
  clearProjectCaches,
} from '@/utils/tenantDebug';
import { getCachedTenantSlug, getLastPathChecked } from '@/utils/tenant';
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiDatabase,
} from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';

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
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg="white"
      shadow="xl"
      rounded="lg"
      p={4}
      maxW="400px"
      zIndex={9999}
      borderWidth="1px"
      borderColor={issues.length > 0 ? 'red.500' : 'green.500'}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Heading size="sm">🏢 Tenant Debug</Heading>
          {issues.length > 0 ? (
            <Badge colorScheme="red">Issues Detected</Badge>
          ) : (
            <Badge colorScheme="green">All Good</Badge>
          )}
        </HStack>

        <Divider />

        {issues.length > 0 && (
          <Alert status="error" size="sm">
            <AlertIcon />
            <AlertDescription>
              <VStack align="start" spacing={1}>
                {issues.map((issue, i) => (
                  <Text key={i} fontSize="xs">
                    {issue}
                  </Text>
                ))}
              </VStack>
            </AlertDescription>
          </Alert>
        )}

        <VStack align="stretch" spacing={2}>
          <Box>
            <Text fontSize="xs" fontWeight="bold">
              Current URL:
            </Text>
            <Code fontSize="xs" w="full" p={1}>
              {debugInfo.pathname}
            </Code>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold">
              Extracted Tenant:
            </Text>
            <Code
              fontSize="xs"
              colorScheme={
                debugInfo.extractedTenant === 'development' ? 'green' : 'orange'
              }
            >
              {debugInfo.extractedTenant}
            </Code>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold">
              Context Tenant:
            </Text>
            <Code
              fontSize="xs"
              colorScheme={
                currentTenant?.slug === 'development' ? 'green' : 'orange'
              }
            >
              {currentTenant?.slug || 'None'}
            </Code>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold">
              Cached Tenant:
            </Text>
            <Code
              fontSize="xs"
              colorScheme={cachedSlug === 'development' ? 'green' : 'orange'}
            >
              {cachedSlug || 'None'}
            </Code>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold">
              Project Cache:
            </Text>
            <Code fontSize="xs" colorScheme={hasProjectCache ? 'blue' : 'gray'}>
              {hasProjectCache
                ? `${cachedProjectCount} projects cached`
                : 'No cache'}
            </Code>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold">
              Available Tenants:
            </Text>
            <HStack wrap="wrap" spacing={2}>
              {userTenants.map(tenant => (
                <Badge
                  key={tenant.id}
                  colorScheme={
                    tenant.slug === currentTenant?.slug ? 'blue' : 'gray'
                  }
                >
                  {tenant.slug}
                </Badge>
              ))}
            </HStack>
          </Box>
        </VStack>

        <Divider />

        <VStack spacing={2}>
          <Button
            size="sm"
            colorScheme="purple"
            leftIcon={<FiDatabase />}
            onClick={handleClearProjectCache}
            isLoading={isClearingProjects}
            loadingText="Clearing..."
            w="full"
          >
            Clear Project Cache & Refetch
          </Button>

          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<FiCheckCircle />}
            onClick={() => handleFixTenant('development')}
            isLoading={isFixing}
            loadingText="Fixing..."
            w="full"
          >
            Fix to Development Tenant
          </Button>

          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={clearAllTenantCaches}
            w="full"
          >
            Clear All Caches & Reload
          </Button>
        </VStack>

        <Text fontSize="xs" color="gray.500" textAlign="center">
          User: {user?.email || 'Not logged in'}
        </Text>
      </VStack>
    </Box>
  );
};
