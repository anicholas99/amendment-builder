import React from 'react';

/**
 * PiMapPin02DuoSolid icon from the duo-solid style in navigation category.
 */
interface PiMapPin02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapPin02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'map-pin-02 icon',
  ...props
}: PiMapPin02DuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21v-8" opacity=".28"/><path fill={color || "currentColor"} d="M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
    </svg>
  );
}
