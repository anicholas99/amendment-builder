import React from 'react';

/**
 * PiPlanetRingDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPlanetRingDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlanetRingDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'planet-ring icon',
  ...props
}: PiPlanetRingDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.859 6.66c1.596-.421 2.651-.47 2.862-.052.496.987-3.901 4.201-9.822 7.179s-11.123 4.592-11.62 3.605c-.21-.418.458-1.236 1.748-2.266" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" opacity=".28" fill="none"/>
    </svg>
  );
}
