import React from 'react';

/**
 * PiRepeatRectangularDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiRepeatRectangularDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRepeatRectangularDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'repeat-rectangular icon',
  ...props
}: PiRepeatRectangularDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 5H11c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 7.73c-.476.934-.536 2.12-.544 4.27M3 19h10c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185c.476-.934.536-2.12.544-4.27" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 2a15.3 15.3 0 0 1 2.92 2.777.354.354 0 0 1 0 .446A15.3 15.3 0 0 1 18 8M6 16a15.3 15.3 0 0 0-2.92 2.777.354.354 0 0 0 0 .446A15.3 15.3 0 0 0 6 22" fill="none"/>
    </svg>
  );
}
