import React from 'react';

/**
 * PiPriorityHighDuoStroke icon from the duo-stroke style in development category.
 */
interface PiPriorityHighDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPriorityHighDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'priority-high icon',
  ...props
}: PiPriorityHighDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.2 14.25a2.1 2.1 0 0 1 .55-.695c1.641-1.349 3.505-2.571 5.557-3.645.203-.107.448-.16.693-.16s.49.053.694.16c2.051 1.074 3.915 2.296 5.556 3.645.24.197.424.434.55.695" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11.229a35 35 0 0 0-2.307-1.32A1.5 1.5 0 0 0 12 9.75c-.245 0-.49.053-.693.16q-1.198.626-2.307 1.319" fill="none"/>
    </svg>
  );
}
