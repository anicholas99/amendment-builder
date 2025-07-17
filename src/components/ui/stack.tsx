import React from 'react';
import { cn } from '@/lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  spacing?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const VStack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      as: Component = 'div',
      spacing,
      align,
      justify,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        className={cn(
          'flex flex-col',
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
          className
        )}
        style={{
          gap: spacing
            ? typeof spacing === 'number'
              ? `${spacing}px`
              : spacing
            : undefined,
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

const HStack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      as: Component = 'div',
      spacing,
      align,
      justify,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        className={cn(
          'flex flex-row',
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
          className
        )}
        style={{
          gap: spacing
            ? typeof spacing === 'number'
              ? `${spacing}px`
              : spacing
            : undefined,
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

VStack.displayName = 'VStack';
HStack.displayName = 'HStack';

export { VStack, HStack };
