import * as React from 'react';
import { cn } from '@/lib/utils';

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1', className)} {...props} />
  )
);
Spacer.displayName = 'Spacer';

export { Spacer };
