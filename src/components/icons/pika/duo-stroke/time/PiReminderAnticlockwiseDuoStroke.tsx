import React from 'react';

/**
 * PiReminderAnticlockwiseDuoStroke icon from the duo-stroke style in time category.
 */
interface PiReminderAnticlockwiseDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiReminderAnticlockwiseDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'reminder-anticlockwise icon',
  ...props
}: PiReminderAnticlockwiseDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.07 3.693a15 15 0 0 0-.487 3.84c0 .339.284.448.56.51h.001m3.66.348a15 15 0 0 1-3.66-.348m0 0a8 8 0 1 1-1.06 5.908" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 15-1.707-1.707a1 1 0 0 1-.293-.707V9" fill="none"/>
    </svg>
  );
}
