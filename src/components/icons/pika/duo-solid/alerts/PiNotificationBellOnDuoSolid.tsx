import React from 'react';

/**
 * PiNotificationBellOnDuoSolid icon from the duo-solid style in alerts category.
 */
interface PiNotificationBellOnDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellOnDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-on icon',
  ...props
}: PiNotificationBellOnDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.169 3.39 60.6 60.6 0 0 0 13.37 0 2.587 2.587 0 0 0 2.169-3.386c-.17-.512-.29-.873-.32-1.247l-.355-4.262A8.207 8.207 0 0 0 12 2Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M8.193 18.672q.459.029.918.05a61 61 0 0 0 6.698-.05 3.843 3.843 0 0 1-7.616 0ZM12 20a1.84 1.84 0 0 1-1.74-1.234q1.74.051 3.479 0A1.84 1.84 0 0 1 12 20Z" clipRule="evenodd"/>
    </svg>
  );
}
