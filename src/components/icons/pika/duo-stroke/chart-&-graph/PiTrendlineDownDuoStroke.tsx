import React from 'react';

/**
 * PiTrendlineDownDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiTrendlineDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrendlineDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'trendline-down icon',
  ...props
}: PiTrendlineDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2 7.148.73.937a21.8 21.8 0 0 0 6.61 5.664c.316.176.715.08.916-.222l3.212-4.818a.64.64 0 0 1 .926-.15 20.05 20.05 0 0 1 5.944 7.53l.321.707" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 12.174a17.3 17.3 0 0 1-1.123 4.38.476.476 0 0 1-.51.293 17.3 17.3 0 0 1-4.353-1.217" fill="none"/>
    </svg>
  );
}
