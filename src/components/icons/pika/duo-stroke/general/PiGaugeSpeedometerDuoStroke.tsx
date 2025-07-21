import React from 'react';

/**
 * PiGaugeSpeedometerDuoStroke icon from the duo-stroke style in general category.
 */
interface PiGaugeSpeedometerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeSpeedometerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-speedometer icon',
  ...props
}: PiGaugeSpeedometerDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.242 19.15a9.15 9.15 0 1 1 13.816 0" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.242 19.15a9.1 9.1 0 0 1-2.242-6 9.1 9.1 0 0 1 1.96-5.66m3.454 2.923 4.108 2.803a.94.94 0 1 1-1.305 1.305z" fill="none"/>
    </svg>
  );
}
