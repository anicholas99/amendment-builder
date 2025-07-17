import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  animated?: boolean;
  showShimmer?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 'md',
      colorScheme = 'blue',
      animated = true,
      showShimmer = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const isActive = percentage > 0 && percentage < 100;

    return (
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          // Size variants
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Main progress bar */}
        <div
          className={cn(
            'h-full relative overflow-hidden',
            animated && 'transition-all duration-500 ease-out',
            // Color schemes with gradient
            {
              'bg-gradient-to-r from-blue-500 to-blue-600':
                colorScheme === 'blue',
              'bg-gradient-to-r from-green-500 to-green-600':
                colorScheme === 'green',
              'bg-gradient-to-r from-red-500 to-red-600': colorScheme === 'red',
              'bg-gradient-to-r from-yellow-500 to-yellow-600':
                colorScheme === 'yellow',
              'bg-gradient-to-r from-purple-500 to-purple-600':
                colorScheme === 'purple',
            },
            // Pulse animation when active
            isActive && animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          {showShimmer && isActive && (
            <div
              className={cn(
                'absolute inset-0 -skew-x-12',
                'bg-gradient-to-r from-transparent via-white/20 to-transparent',
                'animate-shimmer'
              )}
              style={{
                animation: 'shimmer 2s infinite linear',
              }}
            />
          )}
        </div>

        {/* Glow effect for active progress */}
        {isActive && animated && (
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              'animate-pulse opacity-50',
              {
                'shadow-[0_0_10px_theme(colors.blue.400)]':
                  colorScheme === 'blue',
                'shadow-[0_0_10px_theme(colors.green.400)]':
                  colorScheme === 'green',
                'shadow-[0_0_10px_theme(colors.red.400)]':
                  colorScheme === 'red',
                'shadow-[0_0_10px_theme(colors.yellow.400)]':
                  colorScheme === 'yellow',
                'shadow-[0_0_10px_theme(colors.purple.400)]':
                  colorScheme === 'purple',
              }
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
