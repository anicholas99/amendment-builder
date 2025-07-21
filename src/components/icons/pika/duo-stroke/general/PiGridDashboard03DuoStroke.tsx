import React from 'react';

/**
 * PiGridDashboard03DuoStroke icon from the duo-stroke style in general category.
 */
interface PiGridDashboard03DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGridDashboard03DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-dashboard-03 icon',
  ...props
}: PiGridDashboard03DuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M3 6.5a3.5 3.5 0 1 1 7 0V10H6.5A3.5 3.5 0 0 1 3 6.5Z" fill="none"/><path d="M14 14h3.5a3.5 3.5 0 1 1-3.5 3.5z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17.5A3.5 3.5 0 0 1 6.5 14H10v3.5a3.5 3.5 0 1 1-7 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6.5a3.5 3.5 0 1 1 3.5 3.5H14z" fill="none"/>
    </svg>
  );
}
