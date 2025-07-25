import React from 'react';

/**
 * PiSubtaskContrast icon from the contrast style in general category.
 */
interface PiSubtaskContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSubtaskContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'subtask icon',
  ...props
}: PiSubtaskContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M3 7c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C4.602 4 5.068 4 6 4h12c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 5.602 21 6.068 21 7s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 10 18.932 10 18 10H6c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C3 8.398 3 7.932 3 7Z" fill="none" stroke="currentColor"/><path d="M13 17c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C14.602 14 15.068 14 16 14h2c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 15.602 21 16.068 21 17s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 20 18.932 20 18 20h-2c-.932 0-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C13 18.398 13 17.932 13 17Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 10h12c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C21 8.398 21 7.932 21 7s0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C19.398 4 18.932 4 18 4H6c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 5.602 3 6.068 3 7s0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C4.602 10 5.068 10 6 10Zm0 0v2a5 5 0 0 0 5 5h2m0 0c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C14.602 20 15.068 20 16 20h2c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C21 18.398 21 17.932 21 17s0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C19.398 14 18.932 14 18 14h-2c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C13 15.602 13 16.068 13 17Z" fill="none"/>
    </svg>
  );
}
