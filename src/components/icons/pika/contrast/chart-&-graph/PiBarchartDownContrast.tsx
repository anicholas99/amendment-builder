import React from 'react';

/**
 * PiBarchartDownContrast icon from the contrast style in chart-&-graph category.
 */
interface PiBarchartDownContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBarchartDownContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'barchart-down icon',
  ...props
}: PiBarchartDownContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M8.848 4.235C9 4.602 9 5.068 9 6v6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C10.602 9 11.068 9 12 9s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 10.602 15 11.068 15 12v6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C16.602 15 17.068 15 18 15s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 16.602 21 17.068 21 18s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 21 18.932 21 18 21H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8V6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C4.602 3 5.068 3 6 3s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 21v-3c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C16.602 15 17.068 15 18 15s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 16.602 21 17.068 21 18s0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 21 18.932 21 18 21zm0 0H9m6 0v-9c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C13.398 9 12.932 9 12 9s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C9 10.602 9 11.068 9 12v9m0 0H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8V6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C4.602 3 5.068 3 6 3s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C9 4.602 9 5.068 9 6z" fill="none"/>
    </svg>
  );
}
