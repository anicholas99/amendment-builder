import React from 'react';

/**
 * PiSupportHeartDuoSolid icon from the duo-solid style in general category.
 */
interface PiSupportHeartDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSupportHeartDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'support-heart icon',
  ...props
}: PiSupportHeartDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.423 14h4.472c1.363 0 3.467 1.687 1.95 2.997C17.5 21 10.5 21 6 16.914M15.423 14q.194.236.334.514A1.027 1.027 0 0 1 14.838 16H10m5.423-2a2.74 2.74 0 0 0-2.116-1h-1.122a.8.8 0 0 1-.35-.083 10.47 10.47 0 0 0-5.839-1.04Q6 11.937 6 12v4.914m0 0V17" opacity=".28"/><path fill={color || "currentColor"} d="M14.806 2.858a2.9 2.9 0 0 1 1.47-.358c1.492.02 3.167 1.162 3.167 3.024 0 1.64-1.115 2.909-2.042 3.679a9 9 0 0 1-1.392.947 6 6 0 0 1-.561.27c-.082.034-.17.066-.255.092-.063.018-.211.06-.383.06s-.32-.042-.384-.06a3 3 0 0 1-.255-.091 6 6 0 0 1-.561-.271 9 9 0 0 1-1.393-.947c-.926-.77-2.041-2.038-2.041-3.679 0-1.852 1.665-3.024 3.18-3.024.452 0 .973.09 1.45.358Z"/><path fill={color || "currentColor"} d="M1 12a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0z"/>
    </svg>
  );
}
