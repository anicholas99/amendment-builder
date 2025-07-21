import React from 'react';

/**
 * PiGraphChartSankeyDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphChartSankeyDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartSankeyDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-sankey icon',
  ...props
}: PiGraphChartSankeyDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.5 3v2m0 5V6m18-3v7m-18-5v1m0-1h18m-18 1h18" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.5 17v2m0 2v-2M2.5 8h1.615c3.252 0 6.177 2.98 7.385 6a7.95 7.95 0 0 0 7.385 5H20.5" opacity=".28" fill="none"/>
    </svg>
  );
}
