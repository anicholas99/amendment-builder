import React from 'react';

/**
 * PiNotificationBellOffDuoStroke icon from the duo-stroke style in alerts category.
 */
interface PiNotificationBellOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-off icon',
  ...props
}: PiNotificationBellOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19.199 9.796.34 4.075c.042.515.205.993.366 1.479a1.587 1.587 0 0 1-1.33 2.077 60 60 0 0 1-7.366.36L9.495 19.5a2.842 2.842 0 0 0 5.348-1.342v-.346M4.463 13.87l.355-4.26a7.207 7.207 0 0 1 13.096-3.523L6.466 17.534a60 60 0 0 1-1.04-.107 1.587 1.587 0 0 1-1.33-2.08c.161-.485.324-.963.367-1.478Z" opacity=".35" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3 3 21" fill="none"/>
    </svg>
  );
}
