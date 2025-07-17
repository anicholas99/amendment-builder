import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BadgeV2Props {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  colorScheme?:
    | 'gray'
    | 'red'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'teal'
    | 'purple'
    | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BadgeV2({
  children,
  variant = 'default',
  colorScheme = 'gray',
  size = 'md',
  className,
  ...props
}: BadgeV2Props) {
  // Map colorScheme to shadcn variant
  const getVariant = () => {
    if (variant !== 'default') return variant;

    switch (colorScheme) {
      case 'red':
        return 'destructive';
      case 'gray':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <Badge
      variant={getVariant()}
      className={cn(sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
