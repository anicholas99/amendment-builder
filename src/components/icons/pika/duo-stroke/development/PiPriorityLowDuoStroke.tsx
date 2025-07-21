import React from 'react';

/**
 * PiPriorityLowDuoStroke icon from the duo-stroke style in development category.
 */
interface PiPriorityLowDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPriorityLowDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'priority-low icon',
  ...props
}: PiPriorityLowDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.2 9.75c.126.26.311.498.55.695 1.641 1.349 3.505 2.571 5.557 3.645.203.107.448.16.693.16s.49-.053.694-.16c2.051-1.074 3.915-2.296 5.556-3.645a2.1 2.1 0 0 0 .55-.695" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12.772q-1.11.691-2.307 1.319c-.203.106-.448.16-.693.16s-.49-.054-.693-.16A35 35 0 0 1 9 12.77" fill="none"/>
    </svg>
  );
}
