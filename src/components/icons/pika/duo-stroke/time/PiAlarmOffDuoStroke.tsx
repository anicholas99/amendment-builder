import React from 'react';

/**
 * PiAlarmOffDuoStroke icon from the duo-stroke style in time category.
 */
interface PiAlarmOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlarmOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'alarm-off icon',
  ...props
}: PiAlarmOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3 2 6m12.283 9.37.217.13m4.984-5.332A8 8 0 0 1 9.168 20.484m-3.303-2.35a8 8 0 0 1 11.27-11.27M12 10.001v2m7-9 1 1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
