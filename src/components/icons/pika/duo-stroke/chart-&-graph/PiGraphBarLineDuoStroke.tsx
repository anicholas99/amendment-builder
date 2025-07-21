import React from 'react';

/**
 * PiGraphBarLineDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphBarLineDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphBarLineDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-bar-line icon',
  ...props
}: PiGraphBarLineDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21H7a4 4 0 0 1-4-4V3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17v-4m5 4V6m5 11V9" fill="none"/>
    </svg>
  );
}
