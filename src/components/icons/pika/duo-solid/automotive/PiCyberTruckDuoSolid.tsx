import React from 'react';

/**
 * PiCyberTruckDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiCyberTruckDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCyberTruckDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cyber-truck icon',
  ...props
}: PiCyberTruckDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10.233 6.028a1 1 0 0 0-.719.098l-9 5A1 1 0 0 0 0 12v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h8a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h2a1 1 0 0 0 .995-.9l.5-5a1 1 0 0 0-.762-1.072z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M18 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-1 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
    </svg>
  );
}
