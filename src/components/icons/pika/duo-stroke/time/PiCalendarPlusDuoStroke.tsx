import React from 'react';

/**
 * PiCalendarPlusDuoStroke icon from the duo-stroke style in time category.
 */
interface PiCalendarPlusDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCalendarPlusDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'calendar-plus icon',
  ...props
}: PiCalendarPlusDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13c0-2.796 0-4.193.457-5.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127C8.941 4 10.172 4 12 4s3.059 0 4 .128c.498.067.915.17 1.296.329a6 6 0 0 1 3.247 3.247C21 8.807 21 10.204 21 13s0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 17.194 3 15.796 3 13Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17v-3m0 0v-3m0 3H9m3 0h3m1-12v4M8 2v4" fill="none"/>
    </svg>
  );
}
