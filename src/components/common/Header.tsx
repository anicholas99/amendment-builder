import React, { memo, useMemo, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { FiSun, FiMoon } from 'react-icons/fi';
import {
  useColorModeValue,
  Flex,
  Text,
  IconButton,
  Image,
  Box,
  Icon,
} from '@chakra-ui/react';
import { TenantSwitcher } from './TenantSwitcher';
import { UserMenu } from './UserMenu';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HEADER_HEIGHT_PX } from '@/constants/layout';

// Memoized sub-components for better performance
const Logo = memo(() => (
  <Image
    src="/images/logo.png"
    alt="Patent Drafter Logo"
    width="32px"
    height="32px"
    loading="eager"
    decoding="async"
    display="inline-block"
    verticalAlign="middle"
  />
));
Logo.displayName = 'Logo';

const BrandText = memo(({ color }: { color: string }) => (
  <Text
    fontSize="xl"
    fontWeight="bold"
    color={color}
    display="inline-block"
    verticalAlign="middle"
    lineHeight="32px"
    ml="8px"
  >
    Patent Drafter
  </Text>
));
BrandText.displayName = 'BrandText';

const Header = memo(() => {
  const { toggleSidebar } = useSidebar();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Header styling values
  const bgColor = useColorModeValue('white', '#1A1A1A');
  const borderColor = useColorModeValue('#E0E1E2', '#2D2D2D');
  const textColor = useColorModeValue('text.primary', 'text.primary');

  // Memoize theme-based styles with CSS custom properties
  const styles = useMemo(
    () => ({
      textColor,
    }),
    [textColor]
  );

  // Memoize handlers
  const handleSidebarToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleThemeToggle = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

  return (
    <Box
      as="header"
      className="app-header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      height={HEADER_HEIGHT_PX}
      style={
        {
          '--header-bg': bgColor,
          '--header-border': borderColor,
          '--header-text': styles.textColor,
        } as React.CSSProperties
      }
    >
      <Flex
        height="100%"
        px={4}
        py={2}
        align="center"
        justify="space-between"
        style={{
          background: 'var(--header-bg)',
          borderBottom: '1px solid var(--header-border)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          zIndex: 20,
        }}
      >
        {/* Left side */}
        <Flex align="center" h="36px">
          <Flex align="center">
            <Logo />
            <BrandText color="var(--header-text)" />
          </Flex>
        </Flex>

        {/* Right side */}
        <Flex align="center" gap={2} h="36px">
          <TenantSwitcher />

          {/* Theme Toggle Button */}
          <IconButton
            aria-label="Toggle dark mode"
            icon={
              isDarkMode ? (
                <Icon
                  as={FiSun}
                  boxSize="16px"
                  transition="transform 0.15s ease-out"
                />
              ) : (
                <Icon
                  as={FiMoon}
                  boxSize="16px"
                  transition="transform 0.15s ease-out"
                />
              )
            }
            onClick={handleThemeToggle}
            variant="ghost"
            size="sm"
            bg="bg.card"
            borderWidth="1px"
            borderColor="border.light"
            color="text.primary"
            h="32px"
            w="32px"
            minW="32px"
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
          />

          <UserMenu data-testid="header-user-menu" />
        </Flex>
      </Flex>
    </Box>
  );
});

Header.displayName = 'Header';

export default Header;
