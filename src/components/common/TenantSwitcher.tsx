import React from 'react';
import { useRouter } from 'next/router';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  HStack,
  Text,
  Icon,
  Box,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useTenant } from '@/contexts/TenantContext';
import { saveLastSelectedTenant } from '@/utils/tenantPreferences';
import { logger } from '@/lib/monitoring/logger';
import { useQueryClient } from '@tanstack/react-query';
import { resetTenantCache } from '@/utils/tenant';
import { clearApiCache } from '@/lib/api/apiClient';

export function TenantSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentTenant, userTenants } = useTenant();

  // Menu item styling using semantic tokens
  const checkIconColor = useColorModeValue('green.600', 'green.400');

  if (
    !currentTenant ||
    !userTenants ||
    userTenants.length <= 1 ||
    (!currentTenant.name && !currentTenant.slug)
  ) {
    return null;
  }

  const handleTenantSwitch = async (tenantSlug: string) => {
    if (tenantSlug === currentTenant.slug) return;

    try {
      // Save preference
      saveLastSelectedTenant(tenantSlug);

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

  return (
    <Menu key={currentTenant.id}>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        px={3}
        rightIcon={<FiChevronDown />}
        bg="bg.card"
        borderWidth="1px"
        borderColor="border.light"
        color="text.primary"
        _hover={{
          bg: 'bg.hover',
          borderColor: 'border.primary',
        }}
        _active={{
          bg: 'bg.selected',
        }}
      >
        <Text fontSize="sm" fontWeight="medium">
          {currentTenant.name || currentTenant.slug}
        </Text>
      </MenuButton>
      <MenuList bg="bg.card" borderColor="border.primary" boxShadow="lg" py={1}>
        {userTenants.map(tenant => (
          <MenuItem
            key={tenant.id}
            onClick={() => handleTenantSwitch(tenant.slug)}
            bg={tenant.id === currentTenant.id ? 'bg.selected' : 'transparent'}
            _hover={{ bg: 'bg.hover' }}
            color="text.primary"
            icon={
              tenant.id === currentTenant.id ? (
                <Icon as={FiCheck} color={checkIconColor} />
              ) : (
                <Box w={4} />
              )
            }
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium">{tenant.name || tenant.slug}</Text>
              <Text fontSize="xs" color="text.secondary">
                {tenant.slug}
              </Text>
            </VStack>
          </MenuItem>
        ))}
        <MenuDivider borderColor="border.light" />
        <MenuItem
          onClick={() => router.push('/select-tenant')}
          color="text.primary"
          _hover={{ bg: 'bg.hover' }}
        >
          Manage Organizations
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
