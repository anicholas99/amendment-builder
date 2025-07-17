import React, { useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FigureNavigationProps } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Component for figure dots navigation and arrow controls
 */
const FigureNavigation: React.FC<FigureNavigationProps> = ({
  figureKeys,
  currentIndex,
  onNavigate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll the active dot into view when currentIndex changes
  useEffect(() => {
    if (scrollRef.current && figureKeys.length > 5) {
      const dotWidth = 40; // Approximate width of each dot including margin
      const scrollPos =
        currentIndex * dotWidth -
        scrollRef.current.clientWidth / 2 +
        dotWidth / 2;
      scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  }, [currentIndex, figureKeys.length]);

  // Don't render navigation for a single figure
  if (figureKeys.length <= 1) return null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < figureKeys.length - 1;

  return (
    <div className="flex items-center justify-between px-2">
      {/* Previous button */}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Previous figure"
        onClick={() => canGoPrev && onNavigate(currentIndex - 1)}
        disabled={!canGoPrev}
        className={cn(
          'bg-white/90 dark:bg-gray-800/90 hover:bg-white/95 dark:hover:bg-gray-700/95',
          'border-0 shadow-sm text-gray-700 dark:text-gray-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-8 h-8 p-0 pointer-events-auto'
        )}
      >
        <FiChevronLeft className="w-4 h-4" />
      </Button>

      {/* Next button */}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Next figure"
        onClick={() => canGoNext && onNavigate(currentIndex + 1)}
        disabled={!canGoNext}
        className={cn(
          'bg-white/90 dark:bg-gray-800/90 hover:bg-white/95 dark:hover:bg-gray-700/95',
          'border-0 shadow-sm text-gray-700 dark:text-gray-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-8 h-8 p-0 pointer-events-auto'
        )}
      >
        <FiChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FigureNavigation;
