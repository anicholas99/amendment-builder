import React from 'react';

/**
 * PiAirplaneLiftoffDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiAirplaneLiftoffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAirplaneLiftoffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'airplane-liftoff icon',
  ...props
}: PiAirplaneLiftoffDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M7.93 3.374a4 4 0 0 0-3.26-.54L4.051 3a1 1 0 0 0-.555 1.547l4.13 5.777-1.212.325-2.842-.96a2 2 0 0 0-1.158-.039l-.674.18a1 1 0 0 0-.576 1.518L3.46 14.82a4 4 0 0 0 4.373 1.66L21.2 12.898a2 2 0 0 0 1.415-2.45 4 4 0 0 0-4.9-2.827l-2.459.66z" clipRule="evenodd"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 20h18" opacity=".28"/>
    </svg>
  );
}
