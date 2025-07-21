import React from 'react';

/**
 * PiFaceSadDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFaceSadDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceSadDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'face-sad icon',
  ...props
}: PiFaceSadDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.57 16A5 5 0 0 0 12 14.5 5 5 0 0 0 8.43 16M9 9.686v1m6-1v1" fill="none"/>
    </svg>
  );
}
