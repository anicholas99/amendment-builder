import React from 'react';

/**
 * PiSubtaskDuoStroke icon from the duo-stroke style in general category.
 */
interface PiSubtaskDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSubtaskDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'subtask icon',
  ...props
}: PiSubtaskDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 10v2a5 5 0 0 0 5 5h2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C4.602 4 5.068 4 6 4h12c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 5.602 21 6.068 21 7s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 10 18.932 10 18 10H6c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C3 8.398 3 7.932 3 7Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C14.602 14 15.068 14 16 14h2c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 15.602 21 16.068 21 17s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 20 18.932 20 18 20h-2c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C13 18.398 13 17.932 13 17Z" fill="none"/>
    </svg>
  );
}
