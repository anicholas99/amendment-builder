import React from 'react';

/**
 * PiProjectorDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiProjectorDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiProjectorDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'projector icon',
  ...props
}: PiProjectorDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C2 13.398 2 12.932 2 12s0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C3.602 9 4.068 9 5 9h4.354A4 4 0 0 0 8 12a4 4 0 0 0 1.354 3zm0 0v1m14-1c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C22 13.398 22 12.932 22 12s0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C20.398 9 19.932 9 19 9h-4.354A4 4 0 0 1 16 12a4 4 0 0 1-1.354 3zm0 0v1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.01 12H19m-3 0a4 4 0 0 0-1.354-3A4 4 0 0 0 12 8a4 4 0 0 0-2.646 1A4 4 0 0 0 8 12a4 4 0 0 0 1.354 3c.705.622 1.632 1 2.646 1s1.94-.378 2.646-1A4 4 0 0 0 16 12Z" fill="none"/>
    </svg>
  );
}
