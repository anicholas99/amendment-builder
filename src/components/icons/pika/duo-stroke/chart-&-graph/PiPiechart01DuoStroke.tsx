import React from 'react';

/**
 * PiPiechart01DuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiPiechart01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechart01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-01 icon',
  ...props
}: PiPiechart01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.335 15.574A9.044 9.044 0 1 1 8.426 3.665" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.044 10.6V4.27c0-.75.61-1.368 1.351-1.257a9.05 9.05 0 0 1 7.592 7.592c.111.74-.507 1.351-1.256 1.351H13.4c-.75 0-1.357-.607-1.357-1.356Z" fill="none"/>
    </svg>
  );
}
