import React from 'react';

/**
 * PiGaugeSpeedometerTimerDuoStroke icon from the duo-stroke style in general category.
 */
interface PiGaugeSpeedometerTimerDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGaugeSpeedometerTimerDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'gauge-speedometer-timer icon',
  ...props
}: PiGaugeSpeedometerTimerDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12A9.15 9.15 0 1 0 12 2.85V6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.464 8.465 4.108 2.803a.94.94 0 0 1-1.006 1.585.9.9 0 0 1-.299-.28z" fill="none"/>
    </svg>
  );
}
