import React from 'react';

/**
 * PiGraphChartPyramidDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiGraphChartPyramidDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartPyramidDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-pyramid icon',
  ...props
}: PiGraphChartPyramidDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.373 16-2.707-5H7.334l-2.707 5m14.746 0 1.427 2.635c.573 1.059-.155 2.373-1.315 2.373H4.515c-1.16 0-1.888-1.314-1.315-2.373L4.627 16m14.746 0H4.627" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.685 4.811a1.478 1.478 0 0 1 2.63 0l3.351 6.19H7.334l3.35-6.19z"/>
    </svg>
  );
}
