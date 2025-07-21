import React from 'react';

/**
 * PiGraphTrendLineDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphTrendLineDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphTrendLineDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-trend-line icon',
  ...props
}: PiGraphTrendLineDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21H7a4 4 0 0 1-4-4V3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 14 .61-1.83c.745-2.236 3.92-2.199 4.612.053.643 2.088 3.504 2.325 4.481.37L19 8" fill="none"/>
    </svg>
  );
}
