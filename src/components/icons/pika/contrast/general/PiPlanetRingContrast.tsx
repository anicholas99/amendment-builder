import React from 'react';

/**
 * PiPlanetRingContrast icon from the contrast style in general category.
 */
interface PiPlanetRingContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlanetRingContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'planet-ring icon',
  ...props
}: PiPlanetRingContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.34 7.12c2.432-.813 4.11-1.051 4.38-.512.497.987-3.9 4.2-9.821 7.179s-11.123 4.592-11.62 3.605c-.27-.54.92-1.744 3.022-3.212m14.038-7.06A8 8 0 0 0 4.3 14.18m14.04-7.06A8 8 0 1 1 4.3 14.18" fill="none"/>
    </svg>
  );
}
