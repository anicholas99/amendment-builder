import React from 'react';

/**
 * PiGridDashboard03DuoSolid icon from the duo-solid style in general category.
 */
interface PiGridDashboard03DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGridDashboard03DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-dashboard-03 icon',
  ...props
}: PiGridDashboard03DuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M6.5 2a4.5 4.5 0 0 0 0 9H10a1 1 0 0 0 1-1V6.5A4.5 4.5 0 0 0 6.5 2Z"/><path fill={color || "currentColor"} d="M14 13a1 1 0 0 0-1 1v3.5a4.5 4.5 0 1 0 4.5-4.5z"/></g><path fill={color || "currentColor"} d="M17.5 2A4.5 4.5 0 0 0 13 6.5V10a1 1 0 0 0 1 1h3.5a4.5 4.5 0 1 0 0-9Z"/><path fill={color || "currentColor"} d="M6.5 13a4.5 4.5 0 1 0 4.5 4.5V14a1 1 0 0 0-1-1z"/>
    </svg>
  );
}
