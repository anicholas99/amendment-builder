import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Re-export for compatibility with theme patterns
export const Menu = DropdownMenu;
export const MenuButton = DropdownMenuTrigger;
export const MenuList = DropdownMenuContent;
export const MenuItem = DropdownMenuItem;
export const MenuDivider = DropdownMenuSeparator;

// For compatibility with theme patterns
export const MenuGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
    {children}
  </div>
);
