import React from 'react';

/**
 * PiEarthGlobeDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiEarthGlobeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEarthGlobeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'earth-globe icon',
  ...props
}: PiEarthGlobeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12A9.15 9.15 0 0 0 12 21.15c4.974 0 9.15-4.174 9.15-9.15a9.15 9.15 0 0 0-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.346 3.968c0 2.465-1.791 4.575-4.332 5.45.22.426.344.911.344 1.425a3.1 3.1 0 0 1-.987 2.276 1.742 1.742 0 1 1-2.763.776A3.118 3.118 0 0 1 6.52 9.319a6.9 6.9 0 0 1-2.56-1.695A9.15 9.15 0 0 1 12 2.85a9.1 9.1 0 0 1 4.347 1.097z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.485 14.233a1.742 1.742 0 0 0-1.373 2.816 3.1 3.1 0 0 0-.548 1.765c0 .525.13 1.02.36 1.454a9.2 9.2 0 0 0 4.265-4.182 3.1 3.1 0 0 0-.977-.343 1.74 1.74 0 0 0-1.727-1.51Z" fill="none"/>
    </svg>
  );
}
