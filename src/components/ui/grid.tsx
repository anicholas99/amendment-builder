import * as React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  templateColumns?: string;
  templateRows?: string;
  gap?: string | number;
  columnGap?: string | number;
  rowGap?: string | number;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      templateColumns,
      templateRows,
      gap,
      columnGap,
      rowGap,
      style,
      ...props
    },
    ref
  ) => {
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: templateColumns,
      gridTemplateRows: templateRows,
      gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
      columnGap:
        typeof columnGap === 'number' ? `${columnGap * 0.25}rem` : columnGap,
      rowGap: typeof rowGap === 'number' ? `${rowGap * 0.25}rem` : rowGap,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn('grid', className)}
        style={gridStyle}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

const GridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    colSpan?: number;
    rowSpan?: number;
    colStart?: number;
    colEnd?: number;
    rowStart?: number;
    rowEnd?: number;
  }
>(
  (
    {
      className,
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      style,
      ...props
    },
    ref
  ) => {
    const gridItemStyle = {
      gridColumn: colSpan
        ? `span ${colSpan}`
        : colStart && colEnd
          ? `${colStart} / ${colEnd}`
          : undefined,
      gridRow: rowSpan
        ? `span ${rowSpan}`
        : rowStart && rowEnd
          ? `${rowStart} / ${rowEnd}`
          : undefined,
      ...style,
    };

    return (
      <div ref={ref} className={className} style={gridItemStyle} {...props} />
    );
  }
);
GridItem.displayName = 'GridItem';

interface SimpleGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?:
    | number
    | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  spacing?: string | number;
  spacingX?: string | number;
  spacingY?: string | number;
}

const SimpleGrid = React.forwardRef<HTMLDivElement, SimpleGridProps>(
  (
    { className, columns, spacing, spacingX, spacingY, style, ...props },
    ref
  ) => {
    let gridTemplateColumns = '';

    if (typeof columns === 'number') {
      gridTemplateColumns = `repeat(${columns}, 1fr)`;
    } else if (typeof columns === 'object') {
      // Handle responsive columns
      const { base = 1, sm, md, lg, xl } = columns;
      gridTemplateColumns = `repeat(${base}, 1fr)`;

      // This is a simplified approach - in a real app you'd use CSS classes
      if (sm) gridTemplateColumns = `repeat(${sm}, 1fr)`;
      if (md) gridTemplateColumns = `repeat(${md}, 1fr)`;
      if (lg) gridTemplateColumns = `repeat(${lg}, 1fr)`;
      if (xl) gridTemplateColumns = `repeat(${xl}, 1fr)`;
    }

    const gap =
      spacing ||
      (spacingX || spacingY ? `${spacingY || 0} ${spacingX || 0}` : undefined);

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns,
      gap: typeof gap === 'number' ? `${gap * 0.25}rem` : gap,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn('grid', className)}
        style={gridStyle}
        {...props}
      />
    );
  }
);
SimpleGrid.displayName = 'SimpleGrid';

export { Grid, GridItem, SimpleGrid };
