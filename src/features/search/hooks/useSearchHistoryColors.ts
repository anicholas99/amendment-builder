import { useMemo } from 'react';
import { useColorModeValue } from '@chakra-ui/react';

/**
 * Interface for the color theme
 */
export interface SearchHistoryColorTheme {
  bg: string;
  borderColor: string;
  headerBg: string;
  textColor: string;
  mutedTextColor: string;
  hoverBg: string;
  queryBg: string;
  tableBg: string;
  tableHeaderBg: string;
  tableStripedBg: string;
}

/**
 * Hook for managing color themes in search history components
 * Returns appropriate colors based on the current color mode
 */
export const useSearchHistoryColors = (): SearchHistoryColorTheme => {
  // Use semantic color tokens that respond to color mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const queryBgColor = useColorModeValue('gray.50', 'gray.700');
  const tableBgColor = useColorModeValue('white', 'gray.800');
  const tableHeaderBgColor = useColorModeValue('gray.50', 'gray.700');
  const tableStripedBgColor = useColorModeValue('gray.50', 'gray.700');

  // Memoize color values
  return useMemo(
    () => ({
      bg: bgColor,
      borderColor: borderColor,
      headerBg: headerBgColor,
      textColor: textColor,
      mutedTextColor: mutedTextColor,
      hoverBg: hoverBgColor,
      queryBg: queryBgColor,
      tableBg: tableBgColor,
      tableHeaderBg: tableHeaderBgColor,
      tableStripedBg: tableStripedBgColor,
    }),
    [
      bgColor,
      borderColor,
      headerBgColor,
      textColor,
      mutedTextColor,
      hoverBgColor,
      queryBgColor,
      tableBgColor,
      tableHeaderBgColor,
      tableStripedBgColor,
    ]
  );
};
