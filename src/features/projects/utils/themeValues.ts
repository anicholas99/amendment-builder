import { useMemo } from 'react';

interface ProjectsDashboardTheme {
  cardBg: string;
  hoverBg: string;
  borderColor: string;
  statNumberColor: string;
  headingColor: string;
  scrollbarBg: string;
  scrollbarThumbBg: string;
  scrollbarThumbHoverBg: string;
}

export function useProjectsDashboardTheme(
  isDarkMode: boolean
): ProjectsDashboardTheme {
  return useMemo(
    () => ({
      cardBg: isDarkMode ? 'gray.800' : 'white',
      hoverBg: isDarkMode ? 'gray.700' : 'gray.50',
      borderColor: isDarkMode ? 'gray.700' : 'gray.200',
      statNumberColor: isDarkMode ? 'white' : 'gray.700',
      headingColor: isDarkMode ? 'white' : 'gray.700',
      scrollbarBg: isDarkMode ? 'gray.900' : 'gray.100',
      scrollbarThumbBg: isDarkMode ? 'gray.700' : 'gray.300',
      scrollbarThumbHoverBg: isDarkMode ? 'gray.600' : 'gray.400',
    }),
    [isDarkMode]
  );
}
