import React from 'react';

/**
 * PiGraphChartAverageDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphChartAverageDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartAverageDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-average icon',
  ...props
}: PiGraphChartAverageDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21H7a4 4 0 0 1-4-4V3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 7 .223-.276c1.391-1.722 4.104-1.396 5.048.606l3.458 7.34c.944 2.003 3.657 2.329 5.048.606L21 15M6 11h.01M10 11h.01M18 11h.01M22 11h.01" fill="none"/>
    </svg>
  );
}
