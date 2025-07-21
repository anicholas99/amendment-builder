import React from 'react';

/**
 * PiDumbbellDuoStroke icon from the duo-stroke style in sports category.
 */
interface PiDumbbellDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDumbbellDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'dumbbell icon',
  ...props
}: PiDumbbellDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6M5 9H4a2 2 0 1 0 0 4h1m14 0h1a2 2 0 1 0 0-4h-1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6m2 6a2 2 0 0 1-2-2V7a2 2 0 1 1 4 0v8a2 2 0 0 1-2 2ZM7 17a2 2 0 0 0 2-2V7a2 2 0 1 0-4 0v8a2 2 0 0 0 2 2Z" fill="none"/>
    </svg>
  );
}
