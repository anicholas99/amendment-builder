import React from 'react';

/**
 * PiNotificationBellCancelDuoSolid icon from the duo-solid style in alerts category.
 */
interface PiNotificationBellCancelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellCancelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-cancel icon',
  ...props
}: PiNotificationBellCancelDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.169 3.39 60.6 60.6 0 0 0 13.37 0 2.587 2.587 0 0 0 2.169-3.386c-.17-.512-.29-.873-.32-1.247l-.355-4.262A8.207 8.207 0 0 0 12 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M10.232 8.293a1 1 0 0 0-1.414 1.414l1.768 1.768-1.768 1.768a1 1 0 0 0 1.414 1.414L12 12.889l1.768 1.768a1 1 0 0 0 1.414-1.414l-1.768-1.768 1.768-1.768a1 1 0 0 0-1.414-1.414L12 10.06z"/><path fill={color || "currentColor"} d="M9.11 18.722a61 61 0 0 1-.917-.05 3.843 3.843 0 0 0 7.616 0 60 60 0 0 1-2.07.094 1.843 1.843 0 0 1-3.478 0 61 61 0 0 1-1.15-.044Z"/>
    </svg>
  );
}
