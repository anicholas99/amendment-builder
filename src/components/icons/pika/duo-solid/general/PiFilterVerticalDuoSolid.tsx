import React from 'react';

/**
 * PiFilterVerticalDuoSolid icon from the duo-solid style in general category.
 */
interface PiFilterVerticalDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFilterVerticalDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'filter-vertical icon',
  ...props
}: PiFilterVerticalDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 3v7m0 10v1M7 3v3m0 10v5" opacity=".28"/><path fill={color || "currentColor"} d="M7 5a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V9a4 4 0 0 0-4-4Z"/><path fill={color || "currentColor"} d="M17 9a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0v-1a4 4 0 0 0-4-4Z"/>
    </svg>
  );
}
