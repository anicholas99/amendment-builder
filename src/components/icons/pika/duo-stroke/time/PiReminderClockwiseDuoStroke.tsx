import React from 'react';

/**
 * PiReminderClockwiseDuoStroke icon from the duo-stroke style in time category.
 */
interface PiReminderClockwiseDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiReminderClockwiseDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'reminder-clockwise icon',
  ...props
}: PiReminderClockwiseDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.93 3.396c.328 1.254.492 2.545.488 3.84-.001.338-.284.448-.56.509h-.002m-3.66.348a15 15 0 0 0 3.66-.348m0 0a8 8 0 1 0 1.06 5.908" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 15-1.707-1.707a1 1 0 0 1-.293-.707V9" fill="none"/>
    </svg>
  );
}
