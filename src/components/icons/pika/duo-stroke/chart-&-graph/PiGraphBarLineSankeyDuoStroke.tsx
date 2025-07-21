import React from 'react';

/**
 * PiGraphBarLineSankeyDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphBarLineSankeyDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphBarLineSankeyDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-bar-line-sankey icon',
  ...props
}: PiGraphBarLineSankeyDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 6H6m15 11h-1.718a8 8 0 0 1-6.657-3.562l-.096-.144M21 10h-2a8 8 0 0 0-6.4 3.2l-.07.094m0 0L11.4 14.8a8 8 0 0 1-4.9 3.058m6.03-4.564-1.155-1.732A8 8 0 0 0 6 8.103" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21H7a4 4 0 0 1-4-4V3" opacity=".28" fill="none"/>
    </svg>
  );
}
