import React from 'react';

/**
 * PiLabFlaskRoundDuoStroke icon from the duo-stroke style in general category.
 */
interface PiLabFlaskRoundDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLabFlaskRoundDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'lab-flask-round icon',
  ...props
}: PiLabFlaskRoundDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3h4m-4 0H9m1 0v3.128c0 .674-.458 1.252-1.073 1.529a7.51 7.51 0 0 0-4.354 5.796C12 10 14 17.5 19.486 14.966a7.5 7.5 0 0 0-4.412-7.31C14.457 7.38 14 6.803 14 6.129V3m0 0h1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 16h.01M4.5 14.5a7.5 7.5 0 0 0 14.986.466C14 17.5 12 10.002 4.573 13.455A8 8 0 0 0 4.5 14.5Z" fill="none"/>
    </svg>
  );
}
