import React from 'react';

/**
 * PiAirplaneDefaultDuoStroke icon from the duo-stroke style in automotive category.
 */
interface PiAirplaneDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAirplaneDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'airplane-default icon',
  ...props
}: PiAirplaneDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 22c1.605-.32 5-.532 5-.532s3.395.211 5 .532v-.532a1 1 0 0 0-.36-.768L14 18.5l.5-3.5 7.5 2v-.5a3 3 0 0 0-1.2-2.4L14 9V4c0-1.105-1.5-2-2-2s-2 .895-2 2v5l-6.8 5.1A3 3 0 0 0 2 16.5v.5l7.5-2 .5 3.5-2.64 2.2a1 1 0 0 0-.36.768z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 15 2 17v-.5a3 3 0 0 1 1.2-2.4L10 9m4.5 6 7.5 2v-.5a3 3 0 0 0-1.2-2.4L14 9" fill="none"/>
    </svg>
  );
}
