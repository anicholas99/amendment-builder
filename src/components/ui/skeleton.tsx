import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva('rounded-md bg-muted relative overflow-hidden', {
  variants: {
    variant: {
      default: 'bg-muted animate-pulse',
      shimmer:
        'bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer',
      wave: 'bg-muted after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-100%] after:animate-wave',
      pulse: 'bg-muted animate-pulse-enhanced',
      glow: 'bg-muted animate-glow',
    },
    size: {
      sm: 'h-4',
      md: 'h-6',
      lg: 'h-8',
      xl: 'h-10',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    rounded: 'md',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Custom animation duration in milliseconds */
  duration?: number;
  /** Whether to show a pulsing effect */
  pulse?: boolean;
  /** Whether to show a wave effect */
  wave?: boolean;
  /** Whether to show a shimmer effect */
  shimmer?: boolean;
}

function Skeleton({
  className,
  variant,
  size,
  rounded,
  duration = 1500,
  pulse = false,
  wave = false,
  shimmer = false,
  style,
  ...props
}: SkeletonProps) {
  // Auto-detect variant based on boolean props
  const autoVariant = shimmer
    ? 'shimmer'
    : wave
      ? 'wave'
      : pulse
        ? 'pulse'
        : variant;

  return (
    <div
      className={cn(
        skeletonVariants({ variant: autoVariant, size, rounded }),
        className
      )}
      style={{
        ...style,
        animationDuration: `${duration}ms`,
      }}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
}

// Compound components for common patterns
const SkeletonText = ({
  lines = 1,
  className,
  ...props
}: SkeletonProps & { lines?: number }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        {...props}
      />
    ))}
  </div>
);

const SkeletonAvatar = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />
);

const SkeletonButton = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-10 w-24 rounded-md', className)} {...props} />
);

const SkeletonCard = ({
  className,
  children,
  ...props
}: SkeletonProps & { children?: React.ReactNode }) => (
  <div
    className={cn(
      'rounded-lg border border-border bg-card p-6 shadow-sm',
      className
    )}
  >
    {children || (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <SkeletonAvatar {...props} />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" {...props} />
            <Skeleton className="h-3 w-1/3" {...props} />
          </div>
        </div>
        <SkeletonText lines={2} {...props} />
        <div className="flex space-x-2">
          <SkeletonButton {...props} />
          <SkeletonButton className="w-20" {...props} />
        </div>
      </div>
    )}
  </div>
);

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  skeletonVariants,
};
