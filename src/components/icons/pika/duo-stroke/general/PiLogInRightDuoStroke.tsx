import React from 'react';

/**
 * PiLogInRightDuoStroke icon from the duo-stroke style in general category.
 */
interface PiLogInRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLogInRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'log-in-right icon',
  ...props
}: PiLogInRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 4.528A6 6 0 0 0 3 9v6a6 6 0 0 0 10 4.472" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.812 9a15 15 0 0 0-2.655 2.556A.7.7 0 0 0 8 12m2.812 3a15 15 0 0 1-2.655-2.556A.7.7 0 0 1 8 12m0 0h13" fill="none"/>
    </svg>
  );
}
