import React from 'react';

/**
 * PiBarchartDownDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiBarchartDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBarchartDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'barchart-down icon',
  ...props
}: PiBarchartDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 21h2.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8v.2c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C19.398 15 18.932 15 18 15s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C15 16.602 15 17.068 15 18zm0 0H9v-9c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C10.602 9 11.068 9 12 9s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 10.602 15 11.068 15 12z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C7.398 3 6.932 3 6 3s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 4.602 3 5.068 3 6v11.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21H9z" fill="none"/>
    </svg>
  );
}
