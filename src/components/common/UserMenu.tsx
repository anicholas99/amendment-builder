import React, { memo, useCallback } from 'react';
import { FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { redirectToLogout } from '@/lib/auth/redirects';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/clientLogger';

const UserMenu = memo(() => {
  const { user, currentTenant } = useAuth();

  const handleLogout = useCallback(() => {
    redirectToLogout();
  }, []);

  const handleSettings = useCallback(() => {
    // TODO: Navigate to user settings page
    logger.info('Settings clicked');
  }, []);

  const handleProfile = useCallback(() => {
    // TODO: Navigate to user profile page
    logger.info('Profile clicked');
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-all duration-200">
          {getUserInitials()}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        {/* User Info Header */}
        <div className="px-2 py-1.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || 'User'}
              </p>
              {currentTenant && (
                <p className="text-xs text-muted-foreground truncate">
                  {currentTenant.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <DropdownMenuItem onClick={handleProfile}>
          <FiUser className="w-4 h-4 mr-2" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSettings}>
          <FiSettings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UserMenu.displayName = 'UserMenu';

export default UserMenu;
