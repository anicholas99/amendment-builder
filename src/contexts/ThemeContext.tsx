/**
 * AppearanceProvider
 *
 * Extends Chakra's theme functionality with additional UI preferences:
 * - Zoom level control for accessibility
 * - Unified dark mode toggle (wraps Chakra's colorMode)
 *
 * This is NOT a replacement for ChakraProvider's theme, but adds
 * app-specific appearance controls on top of it.
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useColorMode } from '@chakra-ui/react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Backward compatibility alias
export const useThemeContext = useTheme;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [zoomLevel, setZoomLevel] = useState(1);

  const isDarkMode = colorMode === 'dark';

  // Update CSS variable for zoom
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-scale-factor',
      zoomLevel.toString()
    );
  }, [zoomLevel]);

  const toggleDarkMode = useCallback(() => {
    toggleColorMode();
  }, [toggleColorMode]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<ThemeContextType>(
    () => ({
      isDarkMode,
      toggleDarkMode,
      zoomLevel,
      setZoomLevel,
    }),
    [isDarkMode, toggleDarkMode, zoomLevel, setZoomLevel]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
