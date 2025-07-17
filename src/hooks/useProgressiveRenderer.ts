import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for rendering components progressively over multiple animation frames
 *
 * This prevents main thread blocking by spreading rendering work across frames,
 * allowing the browser to remain responsive during heavy rendering operations.
 *
 * @param totalItems - Total number of items to render
 * @param itemsPerFrame - Number of items to render per animation frame
 * @returns Object with rendered items count and completion status
 */
export function useProgressiveRenderer(
  totalItems: number,
  itemsPerFrame: number = 2
) {
  const [renderedCount, setRenderedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const shouldRenderItem = useCallback(
    (index: number): boolean => {
      return index < renderedCount;
    },
    [renderedCount]
  );

  useEffect(() => {
    if (totalItems === 0) {
      setIsComplete(true);
      return;
    }

    setRenderedCount(0);
    setIsComplete(false);

    let currentCount = 0;
    let rafId: number;

    const renderNextBatch = () => {
      // Render the next batch of items
      const nextCount = Math.min(currentCount + itemsPerFrame, totalItems);
      setRenderedCount(nextCount);
      currentCount = nextCount;

      // Check if we're done
      if (currentCount >= totalItems) {
        setIsComplete(true);
        return;
      }

      // Schedule next batch for next animation frame
      rafId = requestAnimationFrame(renderNextBatch);
    };

    // Start rendering on next frame
    rafId = requestAnimationFrame(renderNextBatch);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [totalItems, itemsPerFrame]);

  return {
    shouldRenderItem,
    renderedCount,
    isComplete,
    progress: totalItems > 0 ? (renderedCount / totalItems) * 100 : 100,
  };
}
