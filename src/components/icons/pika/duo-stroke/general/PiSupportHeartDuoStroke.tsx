import React from 'react';

/**
 * PiSupportHeartDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSupportHeartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSupportHeartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'support-heart icon',
  ...props
}: PiSupportHeartDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.423 14h4.472c1.363 0 3.467 1.687 1.95 2.997C17.5 21 10.5 21 6 16.914M15.423 14q.194.236.334.514A1.027 1.027 0 0 1 14.838 16H10m5.423-2a2.74 2.74 0 0 0-2.116-1h-1.122a.8.8 0 0 1-.35-.083 10.47 10.47 0 0 0-5.839-1.04Q6 11.937 6 12v4.914m0 0V17" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.81 9.572c.363 0 3.633-1.687 3.633-4.048 0-1.18-1.09-2.01-2.18-2.024-.545-.007-1.09.169-1.454.675-.363-.506-.917-.675-1.453-.675-1.09 0-2.18.844-2.18 2.024 0 2.361 3.27 4.048 3.633 4.048Z" fill="none"/>
    </svg>
  );
}
