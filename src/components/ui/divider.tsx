import * as React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed';
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    { className, orientation = 'horizontal', variant = 'solid', ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        variant === 'dashed' &&
          'border-dashed bg-transparent border-t border-border',
        className
      )}
      {...props}
    />
  )
);
Divider.displayName = 'Divider';

export { Divider };
