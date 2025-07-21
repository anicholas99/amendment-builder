import React from 'react';

/**
 * PiBubbleChartDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiBubbleChartDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBubbleChartDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bubble-chart icon',
  ...props
}: PiBubbleChartDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M9 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/><path d="M15.5 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" fill="none"/>
    </svg>
  );
}
