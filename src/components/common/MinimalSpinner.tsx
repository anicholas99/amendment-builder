import React from 'react';
import { cn } from '@/lib/utils';

interface MinimalSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  center?: boolean;
}

export const MinimalSpinner: React.FC<MinimalSpinnerProps> = ({
  size = 'md',
  message,
  className,
  center = false,
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const borderSizes = {
    xs: 'border',
    sm: 'border',
    md: 'border-2',
    lg: 'border-2',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const spinner = (
    <div
      className={cn(
        sizes[size],
        borderSizes[size],
        'border-primary border-t-transparent rounded-full animate-spin',
        className
      )}
    />
  );

  if (message) {
    const content = (
      <div className="flex items-center space-x-3">
        {spinner}
        <span className={cn(textSizes[size], 'text-muted-foreground')}>
          {message}
        </span>
      </div>
    );

    return center ? (
      <div className="flex items-center justify-center py-8">{content}</div>
    ) : (
      content
    );
  }

  return center ? (
    <div className="flex items-center justify-center py-8">{spinner}</div>
  ) : (
    spinner
  );
};

// Convenient preset components
export const CenteredSpinner: React.FC<
  Omit<MinimalSpinnerProps, 'center'>
> = props => <MinimalSpinner {...props} center={true} />;

export const InlineSpinner: React.FC<
  Omit<MinimalSpinnerProps, 'center'>
> = props => <MinimalSpinner {...props} center={false} />;

export const LoadingProjects: React.FC = () => (
  <CenteredSpinner size="md" message="Loading projects..." />
);

export const LoadingData: React.FC = () => (
  <CenteredSpinner size="sm" message="Loading..." />
);
