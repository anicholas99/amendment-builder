import React, { memo, useCallback } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton,
  Flex,
  Text,
  Icon,
  useToast,
  Avatar,
} from '@chakra-ui/react';
import { FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { redirectToLogin, redirectToLogout } from '@/lib/auth/redirects';
import { logger } from '@/lib/monitoring/logger';
import type { AppUser } from '@/lib/auth/getSession';

interface UserMenuProps {
  /**
   * Optional custom styling props
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional data-testid for testing
   */
  'data-testid'?: string;
}

export const UserMenu: React.FC<UserMenuProps> = memo(
  ({ size = 'sm', 'data-testid': testId }) => {
    const { user } = useAuth();
    const toast = useToast();

    // Memoized logout handler
    const handleLogout = useCallback(
      async (e: React.MouseEvent = {} as React.MouseEvent) => {
        e.preventDefault?.();

        try {
          // Show loading state
          toast({
            title: 'Logging out...',
            status: 'info',
            duration: 1000,
            isClosable: false,
            position: 'bottom-right',
          });

          // Redirect to logout
          redirectToLogout();
        } catch (error) {
          logger.error('Logout error:', error);
          toast.closeAll();
          toast({
            title: 'Logout failed. Please try again.',
            description:
              'If the problem persists, try clearing your browser cache.',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom-right',
          });
        }
      },
      [toast]
    );

    // Memoized login handler
    const handleLogin = useCallback(
      async (e: React.MouseEvent = {} as React.MouseEvent) => {
        e.preventDefault?.();

        try {
          // Show loading state
          toast({
            title: 'Redirecting to login...',
            status: 'info',
            duration: 1000,
            isClosable: false,
            position: 'bottom-right',
          });

          // Redirect to login
          redirectToLogin();
        } catch (error) {
          logger.error('Login error:', error);
          toast.closeAll();
          toast({
            title: 'Login failed. Please try again.',
            description:
              'If the problem persists, try clearing your browser cache.',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom-right',
          });
        }
      },
      [toast]
    );

    // User display email with fallback
    const userDisplayEmail = user?.email || 'USER';
    const userDisplayName = user?.name || 'User';

    // Authenticated user menu
    if (user) {
      return (
        <Menu placement="bottom-end" autoSelect={false}>
          <MenuButton
            as={ChakraButton}
            variant="ghost"
            size={size}
            bg="bg.card"
            borderWidth="1px"
            borderColor="border.light"
            color="text.primary"
            h="32px"
            px={2}
            borderRadius="6px"
            transition="background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
            rightIcon={
              <Icon
                as={FiChevronDown}
                style={{
                  width: '12px',
                  height: '12px',
                  transition: 'transform 0.15s ease-out',
                }}
              />
            }
            _hover={{
              bg: 'bg.hover',
              borderColor: 'border.primary',
              transform: 'translateY(-1px)',
              boxShadow: 'sm',
            }}
            _active={{
              bg: 'bg.focus',
              transform: 'translateY(0px)',
              boxShadow: 'xs',
            }}
            data-testid={testId}
            aria-label={`User menu for ${userDisplayEmail}`}
          >
            <Flex align="center" gap={2}>
              <Avatar
                size="sm"
                name={userDisplayName}
                src={user.picture || undefined}
                w="24px"
                h="24px"
                fontSize="12px"
                borderWidth="1px"
                borderColor="border.light"
              />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="ipd.blue"
                style={{
                  display: 'inline-block',
                  lineHeight: '24px',
                  verticalAlign: 'middle',
                }}
                data-testid="user-email"
              >
                {userDisplayEmail}
              </Text>
            </Flex>
          </MenuButton>

          <MenuList
            bg="bg.card"
            borderColor="border.primary"
            boxShadow="sm"
            minWidth="200px"
            py={1}
          >
            <MenuItem
              onClick={handleLogout}
              px="12px"
              py="8px"
              color="text.primary"
              _hover={{
                bg: 'bg.hover',
                color: 'blue.500',
              }}
              _focus={{
                bg: 'bg.hover',
                color: 'blue.500',
              }}
              aria-label="Logout from your account"
            >
              <Icon
                as={FiLogOut}
                color="inherit"
                style={{
                  marginRight: '8px',
                  width: '16px',
                  height: '16px',
                }}
              />
              <Text color="inherit">Logout</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      );
    }

    // Unauthenticated login button
    return (
      <ChakraButton
        onClick={handleLogin}
        size={size}
        variant="ghost"
        bg="bg.card"
        borderWidth="1px"
        borderColor="border.light"
        color="text.primary"
        h="32px"
        px={3}
        borderRadius="6px"
        transition="background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out"
        _hover={{
          bg: 'bg.hover',
          borderColor: 'border.primary',
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        }}
        _active={{
          bg: 'bg.focus',
          transform: 'translateY(0px)',
          boxShadow: 'xs',
        }}
        data-testid={testId}
        aria-label="Login to your account"
      >
        Login
      </ChakraButton>
    );
  }
);

UserMenu.displayName = 'UserMenu';
