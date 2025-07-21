import React from 'react';

/**
 * PiNotificationBellAddSolid icon from the solid style in alerts category.
 */
interface PiNotificationBellAddSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellAddSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-add icon',
  ...props
}: PiNotificationBellAddSolidProps): JSX.Element {
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
      <path d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.168 3.39q1.437.16 2.877.25a3.843 3.843 0 0 0 7.617 0q1.44-.09 2.876-.25a2.587 2.587 0 0 0 2.17-3.386c-.17-.512-.29-.873-.32-1.247l-.356-4.262A8.207 8.207 0 0 0 12.001 2Zm0 18a1.84 1.84 0 0 1-1.739-1.233 61 61 0 0 0 3.479 0A1.84 1.84 0 0 1 12 20Zm1-12v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2H9a1 1 0 1 1 0-2h2V8a1 1 0 1 1 2 0Z" fill="currentColor"/>
    </svg>
  );
}
