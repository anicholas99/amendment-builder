import { useMemo } from 'react';
import { InventionData } from '@/types/invention';

/**
 * Hook to extract and manage claim text from invention data
 */
export function useClaimText(analyzedInvention: InventionData | null) {
  const getClaim1Text = useMemo(() => {
    const claims = analyzedInvention?.claims;
    if (!claims) return '';

    // Handle both array and record types
    if (Array.isArray(claims)) {
      return claims[0] || ''; // First element if it's an array
    } else if (typeof claims === 'object' && claims !== null) {
      return (claims as Record<string, string>)['1'] || ''; // Property '1' if it's an object/record
    }

    return ''; // Default empty string
  }, [analyzedInvention?.claims]);

  return {
    claim1Text: getClaim1Text,
  };
}
