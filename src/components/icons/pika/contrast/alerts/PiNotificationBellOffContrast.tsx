import React from 'react';

/**
 * PiNotificationBellOffContrast icon from the contrast style in alerts category.
 */
interface PiNotificationBellOffContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotificationBellOffContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'notification-bell-off icon',
  ...props
}: PiNotificationBellOffContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".35"><path d="M12 2a8.207 8.207 0 0 0-8.178 7.526l-.355 4.26c-.031.373-.15.735-.32 1.245a2.588 2.588 0 0 0 2.168 3.39q.529.06 1.058.108a1 1 0 0 0 .8-.288L18.621 6.793a1 1 0 0 0 .113-1.28A8.2 8.2 0 0 0 12 2Z" fill="none" stroke="currentColor"/><path fillRule="evenodd" d="M20.195 9.713a1 1 0 0 0-1.704-.624l-9.704 9.704a1 1 0 0 0-.174 1.18 3.842 3.842 0 0 0 7.196-1.302q1.44-.09 2.876-.25a2.587 2.587 0 0 0 2.17-3.386c-.17-.512-.29-.873-.32-1.247zm-8.576 9.077q1.06.008 2.12-.024a1.843 1.843 0 0 1-2.91.814z" clipRule="evenodd" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.466 17.534a60 60 0 0 1-1.04-.107 1.587 1.587 0 0 1-1.33-2.08c.161-.485.324-.963.367-1.478l.355-4.26a7.207 7.207 0 0 1 13.096-3.523M6.466 17.534 17.914 6.086M6.466 17.534 3 21M17.914 6.086 21 3m-1.801 6.796.34 4.075c.042.515.205.993.366 1.479a1.587 1.587 0 0 1-1.33 2.077 60 60 0 0 1-7.366.36L9.495 19.5a2.842 2.842 0 0 0 5.348-1.342v-.346" fill="none"/>
    </svg>
  );
}
