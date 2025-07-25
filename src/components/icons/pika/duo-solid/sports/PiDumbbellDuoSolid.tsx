import React from 'react';

/**
 * PiDumbbellDuoSolid icon from the duo-solid style in sports category.
 */
interface PiDumbbellDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDumbbellDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'dumbbell icon',
  ...props
}: PiDumbbellDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6M5 9H4a2 2 0 1 0 0 4h1m14 0h1a2 2 0 1 0 0-4h-1" opacity=".28"/><path fill={color || "currentColor"} d="M4 7a3 3 0 0 1 6 0v8a3 3 0 1 1-6 0z"/><path fill={color || "currentColor"} d="M14 7a3 3 0 1 1 6 0v8a3 3 0 1 1-6 0z"/>
    </svg>
  );
}
