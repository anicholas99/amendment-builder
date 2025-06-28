import { useState } from 'react';

/**
 * Hook to manage zoom level controls for the technology details panel
 */
export const useZoomControls = (initialZoom = 100) => {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 10, 120));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 10, 70));
  };

  // Reset zoom to default level
  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // Calculate font size based on zoom level
  const getFontSize = (baseSize: string): string => {
    // Extract number and unit from string like "2xl" or "14px"
    const fontSizeMap: Record<string, number> = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    };

    // If it's a named size
    if (baseSize in fontSizeMap) {
      const basePx = fontSizeMap[baseSize];
      const scaledPx = basePx * (zoomLevel / 100);
      return `${scaledPx}px`;
    }

    // If it's a pixel value
    if (baseSize.endsWith('px')) {
      const basePx = parseFloat(baseSize);
      const scaledPx = basePx * (zoomLevel / 100);
      return `${scaledPx}px`;
    }

    // If it's a rem value
    if (baseSize.endsWith('rem')) {
      const baseRem = parseFloat(baseSize);
      const scaledRem = baseRem * (zoomLevel / 100);
      return `${scaledRem}rem`;
    }

    // Default case, return as is
    return baseSize;
  };

  return {
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    getFontSize,
  };
};
