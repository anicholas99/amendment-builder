import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Framework-agnostic hook for color mode values
 * Replaces Chakra's useColorModeValue with our own theme system
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
