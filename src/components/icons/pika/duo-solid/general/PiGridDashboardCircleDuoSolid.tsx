import React from 'react';

/**
 * PiGridDashboardCircleDuoSolid icon from the duo-solid style in general category.
 */
interface PiGridDashboardCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGridDashboardCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-dashboard-circle icon',
  ...props
}: PiGridDashboardCircleDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M6.5 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/><path fill={color || "currentColor"} d="M17.5 13a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></g><path fill={color || "currentColor"} d="M17.5 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/><path fill={color || "currentColor"} d="M6.5 13a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/>
    </svg>
  );
}
