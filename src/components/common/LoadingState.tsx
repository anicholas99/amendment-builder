import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

export type LoadingVariant = 'spinner' | 'skeleton' | 'progress' | 'minimal';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingStateProps {
  // Loading state
  isLoading?: boolean;

  // Variant and size
  variant?: LoadingVariant;
  size?: LoadingSize;

  // Content
  message?: string;
  submessage?: string;

  // For skeleton variant
  skeletonType?:
    | 'document'
    | 'sidebar'
    | 'table'
    | 'list'
    | 'custom'
    | 'project'
    | 'projects-dashboard'
    | 'search-history'
    | 'project-list';
  skeletonRows?: number;

  // For progress variant
  progress?: number;
  isIndeterminate?: boolean;

  // Error handling
  error?: Error | string | null;
  onRetry?: () => void;

  // Layout
  minHeight?: string | number;
  fullScreen?: boolean;
  transparent?: boolean;

  // Custom content
  children?: React.ReactNode;
}

/**
 * Standardized loading state component for consistent loading UI across the application
 *
 * @example
 * // Simple spinner
 * <LoadingState isLoading={isLoading} message="Loading data..." />
 *
 * // Skeleton loader
 * <LoadingState isLoading={isLoading} variant="skeleton" skeletonType="table" />
 *
 * // Progress bar
 * <LoadingState isLoading={isLoading} variant="progress" progress={75} />
 *
 * // With error handling
 * <LoadingState isLoading={isLoading} error={error} onRetry={refetch} />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading = true,
  variant = 'spinner',
  size = 'md',
  message,
  submessage,
  skeletonType = 'custom',
  skeletonRows = 3,
  progress,
  isIndeterminate = true,
  error,
  onRetry,
  minHeight = '200px',
  fullScreen = false,
  transparent = false,
  children,
}) => {
  // Size mappings
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  const spacings = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
    xl: 'space-y-5',
  };

  // Handle error state
  if (error && !isLoading) {
    const errorMessage = typeof error === 'string' ? error : error.message;

    return (
      <div
        className="flex justify-center items-center p-4"
        style={{ minHeight }}
      >
        <Alert className="max-w-md border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
            {onRetry && (
              <Button
                variant="link"
                onClick={onRetry}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm p-0 h-auto"
              >
                Try again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not loading and no error - render children or nothing
  if (!isLoading) {
    return <>{children}</>;
  }

  // Container styles
  const containerClasses = cn(
    'w-full',
    transparent ? 'bg-transparent' : 'bg-card',
    fullScreen && 'fixed inset-0 z-[9999]'
  );

  const containerStyle = {
    minHeight: fullScreen ? '100vh' : minHeight,
  };

  // Render based on variant
  switch (variant) {
    case 'skeleton':
      // Use existing SkeletonLoader for predefined types
      if (skeletonType !== 'custom') {
        // For predefined skeletons, just return the loader directly
        // It already has its own layout and styling
        return (
          <SkeletonLoader type={skeletonType as any} count={skeletonRows} />
        );
      }

      // Custom skeleton
      return (
        <div className={cn('p-4', spacings[size])}>
          {message && (
            <div
              className={cn(
                'bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse',
                size === 'lg' ? 'h-6' : 'h-4'
              )}
              style={{ width: '200px' }}
            />
          )}
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse" />
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      );

    case 'progress':
      return (
        <div className={containerClasses} style={containerStyle}>
          <div
            className={cn(
              'p-4 flex flex-col items-center justify-center',
              spacings[size]
            )}
          >
            {message && (
              <p
                className={cn(
                  textSizes[size],
                  'text-muted-foreground font-medium'
                )}
              >
                {message}
              </p>
            )}
            <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  'bg-blue-500 h-2 rounded-full transition-all duration-300',
                  isIndeterminate && 'animate-pulse'
                )}
                style={{
                  width: isIndeterminate ? '100%' : `${progress || 0}%`,
                  background: isIndeterminate
                    ? 'linear-gradient(90deg, transparent, #3b82f6, transparent)'
                    : '#3b82f6',
                }}
              />
            </div>
            {submessage && (
              <p className="text-sm text-muted-foreground">{submessage}</p>
            )}
          </div>
        </div>
      );

    case 'minimal':
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div
            className={cn(
              spinnerSizes[size],
              'animate-spin rounded-full border-2 border-gray-300 border-t-blue-500'
            )}
          />
          {message && <span className={textSizes[size]}>{message}</span>}
        </div>
      );

    case 'spinner':
    default:
      return (
        <div className={containerClasses} style={containerStyle}>
          <div className="flex flex-col items-center justify-center h-full">
            <div className={cn('flex flex-col items-center', spacings[size])}>
              <div
                className={cn(
                  spinnerSizes[size],
                  'animate-spin rounded-full border-4 border-gray-200 border-t-blue-500'
                )}
              />
              {message && (
                <p
                  className={cn(
                    textSizes[size],
                    'text-muted-foreground font-medium text-center'
                  )}
                >
                  {message}
                </p>
              )}
              {submessage && (
                <p className="text-sm text-muted-foreground text-center">
                  {submessage}
                </p>
              )}
            </div>
          </div>
        </div>
      );
  }
};

// Export convenient preset components
export const LoadingSpinner: React.FC<
  Omit<LoadingStateProps, 'variant'>
> = props => <LoadingState variant="spinner" {...props} />;

export const LoadingSkeleton: React.FC<
  Omit<LoadingStateProps, 'variant'>
> = props => <LoadingState variant="skeleton" {...props} />;

export const LoadingProgress: React.FC<
  Omit<LoadingStateProps, 'variant'>
> = props => <LoadingState variant="progress" {...props} />;

export const LoadingMinimal: React.FC<
  Omit<LoadingStateProps, 'variant'>
> = props => <LoadingState variant="minimal" {...props} />;
