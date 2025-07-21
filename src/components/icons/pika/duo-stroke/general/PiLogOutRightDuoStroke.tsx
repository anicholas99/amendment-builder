import React from 'react';

/**
 * PiLogOutRightDuoStroke icon from the duo-stroke style in general category.
 */
interface PiLogOutRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLogOutRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'log-out-right icon',
  ...props
}: PiLogOutRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 4.528A6 6 0 0 0 3 9v6a6 6 0 0 0 10 4.472" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.189 9a15 15 0 0 1 2.654 2.556c.105.13.157.287.157.444m-2.811 3a15 15 0 0 0 2.654-2.556A.7.7 0 0 0 21 12m0 0H8" fill="none"/>
    </svg>
  );
}
