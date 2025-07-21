import React from 'react';

/**
 * PiSpotlightContrast icon from the contrast style in general category.
 */
interface PiSpotlightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpotlightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'spotlight icon',
  ...props
}: PiSpotlightContrastProps): JSX.Element {
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
      <g clipPath="url(#icon-dprl3twk2-a)"><path fill="currentColor" d="M23 20.5c0 .828-3.134 2-7 2s-7-1.171-7-2 3.134-2 7-2c2.663 0 4.979.556 6.162 1.173.535.278.838.57.838.827Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20.5c0 .828 3.134 2 7 2s7-1.172 7-2c0-.258-.304-.549-.838-.827M9 20.5c0-.829 3.134-2 7-2 2.663 0 4.979.556 6.162 1.173M9 20.5 4.718 10m4.61-3 12.834 12.673M5.467 2.68l1.147 1.64-3.277 2.294L2.19 4.975a2 2 0 1 1 3.277-2.294Z" fill="none"/></g><defs><clipPath id="icon-dprl3twk2-a"><path fill="currentColor" d="M0 0h24v24H0z" stroke="currentColor"/></clipPath></defs>
    </svg>
  );
}
