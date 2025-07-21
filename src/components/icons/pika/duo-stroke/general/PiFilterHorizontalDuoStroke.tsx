import React from 'react';

/**
 * PiFilterHorizontalDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFilterHorizontalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFilterHorizontalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'filter-horizontal icon',
  ...props
}: PiFilterHorizontalDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h7m6 10h5M20 7h1M3 17h3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 7a3 3 0 0 1 3-3h1a3 3 0 1 1 0 6h-1a3 3 0 0 1-3-3Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 17a3 3 0 0 1 3-3h1a3 3 0 1 1 0 6H9a3 3 0 0 1-3-3Z" fill="none"/>
    </svg>
  );
}
