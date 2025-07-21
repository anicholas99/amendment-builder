import React from 'react';

/**
 * PiTrendlineUpSquareDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiTrendlineUpSquareDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrendlineUpSquareDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'trendline-up-square icon',
  ...props
}: PiTrendlineUpSquareDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 21h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C3 17.2 3 15.8 3 13v-2c0-2.8 0-4.2.545-5.27A5 5 0 0 1 5.73 3.545C6.8 3 8.2 3 11 3h2c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C21 6.8 21 8.2 21 11v2c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C17.2 21 15.8 21 13 21Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 15a9.04 9.04 0 0 1 3.79-4.583l.248-.149 1.924 3.464.249-.15A9.04 9.04 0 0 0 17 9" fill="none"/>
    </svg>
  );
}
