import React from 'react';

/**
 * PiLabFlaskConicalDuoStroke icon from the duo-stroke style in general category.
 */
interface PiLabFlaskConicalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLabFlaskConicalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'lab-flask-conical icon',
  ...props
}: PiLabFlaskConicalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.17 3h4m-4 0h-1m1 0v5.523a1.5 1.5 0 0 1-.276.867l-2.96 4.179c5.623-2.588 7.158 3.072 11.31 1.184L14.447 9.39a1.5 1.5 0 0 1-.276-.867V3m0 0h1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.17 16h.01m8.656 5H6.504c-2.028 0-3.212-2.29-2.04-3.945l2.47-3.486c5.623-2.587 7.158 3.073 11.31 1.185l1.63 2.3C21.049 18.712 19.867 21 17.837 21Z" fill="none"/>
    </svg>
  );
}
