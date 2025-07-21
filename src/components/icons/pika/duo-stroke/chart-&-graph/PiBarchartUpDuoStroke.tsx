import React from 'react';

/**
 * PiBarchartUpDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiBarchartUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBarchartUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'barchart-up icon',
  ...props
}: PiBarchartUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8v.2c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C4.602 15 5.068 15 6 15s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C9 16.602 9 17.068 9 18zm0 0h6v-9c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C13.398 9 12.932 9 12 9s-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C9 10.602 9 11.068 9 12z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C16.602 3 17.068 3 18 3s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 4.602 21 5.068 21 6v11.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21H15z" fill="none"/>
    </svg>
  );
}
