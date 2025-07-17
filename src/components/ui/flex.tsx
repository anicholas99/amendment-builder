import React from 'react';
import { cn } from '@/lib/utils';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number | string;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      as: Component = 'div',
      direction = 'row',
      align,
      justify,
      wrap = 'nowrap',
      gap,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        className={cn(
          'flex',
          // Direction
          {
            'flex-row': direction === 'row',
            'flex-col': direction === 'column',
            'flex-row-reverse': direction === 'row-reverse',
            'flex-col-reverse': direction === 'column-reverse',
          },
          // Align items
          {
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
            'items-baseline': align === 'baseline',
          },
          // Justify content
          {
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',
          },
          // Wrap
          {
            'flex-nowrap': wrap === 'nowrap',
            'flex-wrap': wrap === 'wrap',
            'flex-wrap-reverse': wrap === 'wrap-reverse',
          },
          className
        )}
        style={{
          gap: gap ? (typeof gap === 'number' ? `${gap}px` : gap) : undefined,
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

export { Flex };
