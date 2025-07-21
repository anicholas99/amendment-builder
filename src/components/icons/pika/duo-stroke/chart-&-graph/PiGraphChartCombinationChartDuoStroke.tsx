import React from 'react';

/**
 * PiGraphChartCombinationChartDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphChartCombinationChartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartCombinationChartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-combination-chart icon',
  ...props
}: PiGraphChartCombinationChartDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3.5 10 5.333-5.5 5.334 5.5L19.5 4.5" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.5 20v-5m5.333 5v-9m5.334 9v-5m5.333 5v-9" opacity=".28" fill="none"/>
    </svg>
  );
}
