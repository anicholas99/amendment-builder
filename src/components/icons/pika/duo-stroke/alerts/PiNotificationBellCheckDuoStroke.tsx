import React from 'react';

/**
 * PiNotificationBellCheckDuoStroke icon from the duo-stroke style in alerts category.
 */
interface PiNotificationBellCheckDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellCheckDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-check icon',
  ...props
}: PiNotificationBellCheckDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.818 9.609a7.207 7.207 0 0 1 14.365 0l.355 4.262c.043.515.206.993.367 1.479a1.587 1.587 0 0 1-1.33 2.077 59.5 59.5 0 0 1-13.149 0 1.587 1.587 0 0 1-1.33-2.08c.161-.485.324-.963.367-1.478z" opacity=".28" fill="none"/><path fill="none" d="M15.564 9.826a1 1 0 1 0-1.128-1.652 14 14 0 0 0-3.575 3.53l-1.154-1.153a1 1 0 1 0-1.414 1.415L10.33 14a1 1 0 0 0 1.574-.21 12 12 0 0 1 3.66-3.964Z"/><path fill="none" d="M9.11 18.722a60 60 0 0 1-.917-.05 3.843 3.843 0 0 0 7.616 0 61 61 0 0 1-2.07.094 1.843 1.843 0 0 1-3.478 0 61 61 0 0 1-1.15-.044Z"/>
    </svg>
  );
}
