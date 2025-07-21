import React from 'react';

/**
 * PiUserThreeDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserThreeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserThreeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-three icon',
  ...props
}: PiUserThreeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.645 15.646A3.75 3.75 0 0 0 1 18.75a2.25 2.25 0 0 0 1.35 2.063m19.005-5.167A3.75 3.75 0 0 1 23 18.75a2.25 2.25 0 0 1-1.35 2.062M8.25 21h7.5A2.25 2.25 0 0 0 18 18.75 3.75 3.75 0 0 0 14.25 15h-4.5A3.75 3.75 0 0 0 6 18.75 2.25 2.25 0 0 0 8.25 21Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.706 3.723A4 4 0 0 0 3 7c0 1.356.674 2.554 1.706 3.277m14.588-6.554A4 4 0 0 1 21 7a4 4 0 0 1-1.706 3.277M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
