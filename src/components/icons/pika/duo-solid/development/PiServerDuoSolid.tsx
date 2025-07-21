import React from 'react';

/**
 * PiServerDuoSolid icon from the duo-solid style in development category.
 */
interface PiServerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'server icon',
  ...props
}: PiServerDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M5.4 3A3.4 3.4 0 0 0 2 6.4v1.2A3.4 3.4 0 0 0 5.4 11h13.2A3.4 3.4 0 0 0 22 7.6V6.4A3.4 3.4 0 0 0 18.6 3z"/><path fill={color || "currentColor"} d="M5.4 13A3.4 3.4 0 0 0 2 16.4v1.2A3.4 3.4 0 0 0 5.4 21h13.2a3.4 3.4 0 0 0 3.4-3.4v-1.2a3.4 3.4 0 0 0-3.4-3.4z"/></g><path fill={color || "currentColor"} d="M13 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/><path fill={color || "currentColor"} d="M17 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/><path fill={color || "currentColor"} d="M13 17a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/><path fill={color || "currentColor"} d="M17 17a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
    </svg>
  );
}
