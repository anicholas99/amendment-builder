import React from 'react';

/**
 * PiCalendarCancelDuoStroke icon from the duo-stroke style in time category.
 */
interface PiCalendarCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCalendarCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'calendar-cancel icon',
  ...props
}: PiCalendarCancelDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13c0-2.796 0-4.193.457-5.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127C8.941 4 10.172 4 12 4s3.059 0 4 .128c.498.067.915.17 1.296.329a6 6 0 0 1 3.247 3.247C21 8.807 21 10.204 21 13s0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 17.194 3 15.796 3 13Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 2v4M8 2v4m1.5 10.5L12 14m0 0 2.5-2.5M12 14l-2.5-2.5M12 14l2.5 2.5" fill="none"/>
    </svg>
  );
}
