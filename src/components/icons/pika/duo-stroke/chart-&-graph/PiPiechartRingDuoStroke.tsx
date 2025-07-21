import React from 'react';

/**
 * PiPiechartRingDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiPiechartRingDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechartRingDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-ring icon',
  ...props
}: PiPiechartRingDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 0 1 15.848-6.234l-4.357 4.358A3 3 0 0 0 9 12m-6.15 0A9.15 9.15 0 0 0 12 21.15V15a3 3 0 0 1-3-3m-6.15 0H9" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 0 0 6.698-15.384l-4.357 4.358A3 3 0 0 1 12 15z" fill="none"/>
    </svg>
  );
}
