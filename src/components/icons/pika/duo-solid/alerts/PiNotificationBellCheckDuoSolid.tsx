import React from 'react';

/**
 * PiNotificationBellCheckDuoSolid icon from the duo-solid style in alerts category.
 */
interface PiNotificationBellCheckDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellCheckDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-check icon',
  ...props
}: PiNotificationBellCheckDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.169 3.39 60.6 60.6 0 0 0 13.37 0 2.587 2.587 0 0 0 2.169-3.386c-.17-.512-.29-.873-.32-1.247l-.355-4.262A8.207 8.207 0 0 0 12 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M15.564 9.826a1 1 0 1 0-1.128-1.652 14 14 0 0 0-3.575 3.53l-1.154-1.153a1 1 0 1 0-1.414 1.415L10.33 14a1 1 0 0 0 1.574-.21 12 12 0 0 1 3.66-3.964Z"/><path fill={color || "currentColor"} d="M9.11 18.722a60 60 0 0 1-.917-.05 3.843 3.843 0 0 0 7.616 0 61 61 0 0 1-2.07.094 1.843 1.843 0 0 1-3.478 0 61 61 0 0 1-1.15-.044Z"/>
    </svg>
  );
}
