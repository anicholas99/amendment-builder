import React from 'react';

/**
 * PiServerRemoveDuoSolid icon from the duo-solid style in development category.
 */
interface PiServerRemoveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiServerRemoveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'server-remove icon',
  ...props
}: PiServerRemoveDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M2 6.4A3.4 3.4 0 0 1 5.4 3h13.2A3.4 3.4 0 0 1 22 6.4v1.2a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 7.6z"/><path fill={color || "currentColor"} d="M2 16.4A3.4 3.4 0 0 1 5.4 13h13.2a3.4 3.4 0 0 1 3.377 3H16a3 3 0 0 0-2.236 5H5.4A3.4 3.4 0 0 1 2 17.6z"/></g><path fill={color || "currentColor"} d="M14 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path fill={color || "currentColor"} d="M18 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/><path fill={color || "currentColor"} d="M16 18a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
