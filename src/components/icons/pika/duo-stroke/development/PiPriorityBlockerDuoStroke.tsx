import React from 'react';

/**
 * PiPriorityBlockerDuoStroke icon from the duo-stroke style in development category.
 */
interface PiPriorityBlockerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPriorityBlockerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'priority-blocker icon',
  ...props
}: PiPriorityBlockerDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.5 15.5 7-7" fill="none"/>
    </svg>
  );
}
