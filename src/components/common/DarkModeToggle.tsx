import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcons?: boolean;
}

/**
 * Dark Mode Toggle Component
 *
 * A toggle switch for switching between light and dark themes.
 * Uses shadcn/ui Switch component with theme icons.
 */
export function DarkModeToggle({
  className,
  size = 'md',
  showLabel = false,
  showIcons = true,
}: DarkModeToggleProps) {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcons && (
        <Sun
          className={cn(
            'h-4 w-4 transition-opacity duration-200',
            isDarkMode ? 'opacity-40' : 'opacity-100'
          )}
        />
      )}

      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        size={size}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
      />

      {showIcons && (
        <Moon
          className={cn(
            'h-4 w-4 transition-opacity duration-200',
            isDarkMode ? 'opacity-100' : 'opacity-40'
          )}
        />
      )}

      {showLabel && (
        <span className="text-sm font-medium">
          {isDarkMode ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </div>
  );
}

/**
 * Compact Dark Mode Toggle (Icon only)
 *
 * A more compact version that only shows the current theme icon as a button.
 */
export function DarkModeToggleCompact({ className }: { className?: string }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/**
 * Dark Mode Toggle with Dropdown
 *
 * A toggle that includes system preference option.
 */
export function DarkModeToggleWithOptions({
  className,
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex rounded-md border border-input bg-background">
        <button
          onClick={() => handleThemeChange('light')}
          className={cn(
            'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            theme === 'light' && 'bg-accent text-accent-foreground',
            'rounded-l-md border-r border-input'
          )}
          aria-label="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>

        <button
          onClick={() => handleThemeChange('system')}
          className={cn(
            'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            theme === 'system' && 'bg-accent text-accent-foreground',
            'border-r border-input'
          )}
          aria-label="System preference"
        >
          <span className="text-xs">Auto</span>
        </button>

        <button
          onClick={() => handleThemeChange('dark')}
          className={cn(
            'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            theme === 'dark' && 'bg-accent text-accent-foreground',
            'rounded-r-md'
          )}
          aria-label="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
