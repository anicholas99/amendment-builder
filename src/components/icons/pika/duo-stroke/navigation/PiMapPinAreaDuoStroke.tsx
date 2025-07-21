import React from 'react';

/**
 * PiMapPinAreaDuoStroke icon from the duo-stroke style in navigation category.
 */
interface PiMapPinAreaDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMapPinAreaDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'map-pin-area icon',
  ...props
}: PiMapPinAreaDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18c1.685 0 6.737-3.556 6.737-8.889S14.527 2 12.001 2C9.474 2 5.264 3.778 5.264 9.111S10.316 18 12 18Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.518 17C2.556 17.502 2 18.096 2 18.732 2 20.537 6.477 22 12 22s10-1.463 10-3.268c0-.636-.556-1.23-1.518-1.732m-5.956-8.263a2.526 2.526 0 1 1-5.052 0 2.526 2.526 0 0 1 5.052 0Z" fill="none"/>
    </svg>
  );
}
