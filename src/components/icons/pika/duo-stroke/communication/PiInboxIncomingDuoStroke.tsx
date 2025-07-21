import React from 'react';

/**
 * PiInboxIncomingDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiInboxIncomingDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInboxIncomingDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'inbox-incoming icon',
  ...props
}: PiInboxIncomingDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.928 11a2 2 0 0 0-.059-.18c-.055-.146-.134-.283-.29-.558l-1.736-3.037c-.671-1.175-1.007-1.762-1.479-2.19a4 4 0 0 0-1.444-.838M2.072 11q.025-.09.059-.18c.055-.146.134-.283.29-.558l1.736-3.037c.671-1.175 1.007-1.762 1.478-2.19a4 4 0 0 1 1.445-.838" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 7.126a10 10 0 0 1-1.704 1.77A.47.47 0 0 1 12 9m-2-1.874a10 10 0 0 0 1.704 1.77A.48.48 0 0 0 12 9m0 0V4m2 16h-4c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12v-.15c0-.317 0-.475.024-.63a2 2 0 0 1 .048-.22h5.005c.51 0 .923.413.923.923C8 13.623 9.378 15 11.077 15h1.846c1.7 0 3.077-1.378 3.077-3.077 0-.51.413-.923.923-.923h5.005a2 2 0 0 1 .048.22c.024.155.024.313.024.63V12c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C18.2 20 16.8 20 14 20Z" fill="none"/>
    </svg>
  );
}
