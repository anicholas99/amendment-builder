import React from 'react';

/**
 * PiGraphChartWaterfallDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphChartWaterfallDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartWaterfallDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-waterfall icon',
  ...props
}: PiGraphChartWaterfallDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21H7a4 4 0 0 1-4-4V3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17v-3m4-1v-3m4-1V6m4 11V3" fill="none"/>
    </svg>
  );
}
