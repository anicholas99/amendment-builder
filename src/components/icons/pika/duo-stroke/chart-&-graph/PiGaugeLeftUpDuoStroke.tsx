import React from 'react';

/**
 * PiGaugeLeftUpDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGaugeLeftUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeLeftUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-left-up icon',
  ...props
}: PiGaugeLeftUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.465 8.464 4.107 2.804a.948.948 0 0 1 .135 1.44.948.948 0 0 1-1.44-.136z" fill="none"/>
    </svg>
  );
}
