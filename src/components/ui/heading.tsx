import React from 'react';
import { cn } from '@/lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: Component = 'h2', size = 'xl', ...props }, ref) => {
    return (
      <Component
        className={cn(
          'font-semibold tracking-tight',
          // Size variants
          {
            'text-xs': size === 'xs',
            'text-sm': size === 'sm',
            'text-base': size === 'md',
            'text-lg': size === 'lg',
            'text-xl': size === 'xl',
            'text-2xl': size === '2xl',
            'text-3xl': size === '3xl',
            'text-4xl': size === '4xl',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

export { Heading };
