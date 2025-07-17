import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Provides a theme-aware color value based on the current color mode.
 */
export const useColorModeValue = <T = string>(
  lightValue: T,
  darkValue: T
): T => {
  const { isDarkMode } = useTheme();

  return useMemo(() => {
    return isDarkMode ? darkValue : lightValue;
  }, [isDarkMode, lightValue, darkValue]);
};

export default useColorModeValue;
