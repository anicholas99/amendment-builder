import { useState, useEffect, RefObject } from 'react';
import { logger } from '@/utils/clientLogger';

interface ResponsiveToolbarButtons {
  showReset: boolean;
  showZoom: boolean;
  showExportDOCX: boolean;
  showVersionHistory: boolean;
  showSaveVersion: boolean;
  collapsedButtons: string[];
}

export const useResponsiveToolbar = (
  containerRef: RefObject<HTMLDivElement>
) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        logger.info('📏 Width measurement:', {
          width,
          element: containerRef.current,
        });
        setContainerWidth(width);
        setIsNarrowScreen(width < 800);
      }
    };

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          logger.info('📏 ResizeObserver width measurement:', { width });
          setContainerWidth(width);
          setIsNarrowScreen(width < 800);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateContainerWidth();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Progressive collapse logic
  const getVisibleButtons = (): ResponsiveToolbarButtons => {
    let width = containerWidth;

    // Fallback: if container width is 0, estimate based on window width
    if (width === 0 && typeof window !== 'undefined') {
      width = Math.min(window.innerWidth * 0.5, 800);
    }

    if (width === 0 || width > 1000) {
      return {
        showReset: true,
        showZoom: false,
        showExportDOCX: true,
        showVersionHistory: true,
        showSaveVersion: true,
        collapsedButtons: ['zoom'],
      };
    } else if (width > 800) {
      return {
        showReset: true, // Changed from false to true
        showZoom: false,
        showExportDOCX: true,
        showVersionHistory: true,
        showSaveVersion: true,
        collapsedButtons: ['zoom'],
      };
    } else if (width > 700) {
      return {
        showReset: true, // Changed from false to true
        showZoom: false,
        showExportDOCX: true,
        showVersionHistory: true,
        showSaveVersion: true,
        collapsedButtons: ['zoom'],
      };
    } else if (width > 600) {
      return {
        showReset: true, // Changed from false to true
        showZoom: false,
        showExportDOCX: true,
        showVersionHistory: false,
        showSaveVersion: true,
        collapsedButtons: ['zoom', 'versionHistory'],
      };
    } else {
      return {
        showReset: true, // Changed from false to true - reset is critical functionality
        showZoom: false,
        showExportDOCX: false,
        showVersionHistory: false,
        showSaveVersion: false,
        collapsedButtons: [
          'zoom',
          'exportDOCX',
          'versionHistory',
          'saveVersion',
        ],
      };
    }
  };

  return {
    containerWidth,
    isNarrowScreen,
    visibleButtons: getVisibleButtons(),
  };
};
