import React from 'react';

/**
 * PiClockOffDuoStroke icon from the duo-stroke style in time category.
 */
interface PiClockOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiClockOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'clock-off icon',
  ...props
}: PiClockOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m6.47-6.47A9.15 9.15 0 0 0 5.53 18.47m3.475 2.179A9.15 9.15 0 0 0 20.648 9.006m-5.86 5.86.211.134" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
