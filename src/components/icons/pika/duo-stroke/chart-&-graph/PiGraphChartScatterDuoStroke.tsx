import React from 'react';

/**
 * PiGraphChartScatterDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphChartScatterDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartScatterDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-scatter icon',
  ...props
}: PiGraphChartScatterDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21H7a4 4 0 0 1-4-4V3" opacity=".28" fill="none"/><circle cx="8" cy="16" r="1" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="none"/><circle cx="9" cy="8" r="1" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="none"/><circle cx="14" cy="12" r="1" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="none"/><circle cx="19" cy="16" r="1" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="none"/><circle cx="18" cy="5" r="1" stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="none"/>
    </svg>
  );
}
