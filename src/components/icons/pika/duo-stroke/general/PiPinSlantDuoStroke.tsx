import React from 'react';

/**
 * PiPinSlantDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPinSlantDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPinSlantDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'pin-slant icon',
  ...props
}: PiPinSlantDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.65 15.35-5.168 5.168" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.764 4.247a1.6 1.6 0 0 1 2.385-.396 38 38 0 0 1 5 5 1.6 1.6 0 0 1-.396 2.386l-3.592 2.196c-.666.407-.838 1.15-.662 1.865a4.54 4.54 0 0 1-1.197 4.3.505.505 0 0 1-.66.047c-1.76-1.32-3.436-2.738-4.993-4.294-1.556-1.556-2.973-3.234-4.293-4.993a.504.504 0 0 1 .047-.66 4.54 4.54 0 0 1 4.3-1.197c.714.177 1.457.004 1.865-.662z" fill="none"/>
    </svg>
  );
}
