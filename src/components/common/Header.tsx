import React, { memo, useMemo, useCallback } from 'react';
import { logger } from '@/utils/clientLogger';
import { FiSun, FiMoon } from 'react-icons/fi';
import { TenantSwitcher } from './TenantSwitcher';
import { ProductivityModeToggle } from './ProductivityModeToggle';
import UserMenu from './UserMenu';
import { useSidebar } from '../../contexts/SidebarContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HEADER_HEIGHT_PX } from '@/constants/layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Memoized sub-components for better performance
const Logo = memo(() => (
  <img
    src="/images/logo.png"
            alt="Amendment Builder Logo"
    width="32"
    height="32"
    loading="eager"
    decoding="async"
    className="inline-block align-middle"
  />
));
Logo.displayName = 'Logo';

const BrandText = memo(() => (
  <span className="text-xl font-bold inline-block align-middle leading-8 ml-2 text-foreground">
          Amendment Builder
  </span>
));
BrandText.displayName = 'BrandText';

const Header = memo(() => {
  const { toggleSidebar } = useSidebar();
  const { isDarkMode, toggleTheme } = useTheme();

  // Memoize handlers
  const handleSidebarToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <header
      className="app-header fixed top-0 left-0 right-0 z-20 border-b bg-background border-border shadow-sm"
      style={{ height: HEADER_HEIGHT_PX }}
    >
      <div className="h-full px-4 py-2 flex items-center justify-between shadow-sm">
        {/* Left side */}
        <div className="flex items-center h-9">
          <div className="flex items-center">
            <Logo />
            <BrandText />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 h-9">
          <TenantSwitcher />

          {/* Productivity Mode Toggle */}
          <ProductivityModeToggle />

          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <FiSun className="h-4.5 w-4.5" />
            ) : (
              <FiMoon className="h-4.5 w-4.5" />
            )}
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
