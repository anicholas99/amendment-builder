/**
 * Theme Context
 *
 * Provides theme management (light/dark mode) and zoom functionality.
 * This is the main theme provider for the application.
 */
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
}

/**
 * Theme Provider
 *
 * Manages dark mode state and zoom level for the application.
 * Provides theme persistence, system preference detection, and smooth transitions.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  attribute = 'class',
  enableSystem = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else if (enableSystem) {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      setThemeState('system');
      setResolvedTheme(systemPreference);
    }
  }, [storageKey, enableSystem]);

  // Resolve theme based on system preference or explicit choice
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        const systemPreference = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
          ? 'dark'
          : 'light';
        setResolvedTheme(systemPreference);
        return systemPreference;
      } else {
        setResolvedTheme(theme);
        return theme;
      }
    };

    const resolved = resolveTheme();

    // Apply theme to document
    const root = window.document.documentElement;
    
    // Add transition-disabling class BEFORE theme switch
    root.classList.add('theme-switching');
    
    // Remove old theme classes
    root.classList.remove('light', 'dark');

    if (attribute === 'class') {
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }
    
    // Remove transition-disabling class after a frame
    // This ensures the theme change happens without transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
  }, [theme, attribute]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setResolvedTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Update CSS variable for zoom
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-scale-factor',
      zoomLevel.toString()
    );
  }, [zoomLevel]);

  // Update theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
    },
    [storageKey]
  );

  // Toggle between light and dark (not system)
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      // If currently system, switch to opposite of current resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      isDarkMode: resolvedTheme === 'dark',
      toggleTheme,
      toggleDarkMode: toggleTheme, // Alias for backward compatibility
      zoomLevel,
      setZoomLevel,
    }),
    [theme, setTheme, resolvedTheme, toggleTheme, zoomLevel]
  );

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// Backward compatibility alias
export const useThemeContext = useTheme;
