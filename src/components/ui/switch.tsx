import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11',
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
    md: 'h-4 w-4 data-[state=checked]:translate-x-4',
    lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        sizeClasses[size],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
          thumbSizeClasses[size]
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
