import React from 'react';

/**
 * PiGrid02DuoStroke icon from the duo-stroke style in general category.
 */
interface PiGrid02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGrid02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-02 icon',
  ...props
}: PiGrid02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.6 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 6.04 3 7.16 3 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 21 7.16 21 9.4 21h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 17.96 21 16.84 21 14.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 3 16.84 3 14.6 3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9h-6m0 0H9m6 0v6m0-6V3M9 9H3m6 0v6m0-6V3m6 18v-6m0 0h6m-6 0H9m0 0H3m6 0v6" fill="none"/>
    </svg>
  );
}
