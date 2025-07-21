import React from 'react';

/**
 * PiUserArrowUpDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserArrowUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserArrowUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-arrow-up icon',
  ...props
}: PiUserArrowUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h4.43" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 16.812a15 15 0 0 0-2.556-2.655A.7.7 0 0 0 19 14m-3 2.811a15 15 0 0 1 2.556-2.654A.7.7 0 0 1 19 14m0 0v7M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
