import React from 'react';
import { cn } from '@/lib/utils';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return <Component className={cn(className)} ref={ref} {...props} />;
  }
);

Box.displayName = 'Box';

export { Box };
