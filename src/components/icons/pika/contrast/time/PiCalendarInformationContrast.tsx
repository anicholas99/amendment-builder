import React from 'react';

/**
 * PiCalendarInformationContrast icon from the contrast style in time category.
 */
interface PiCalendarInformationContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCalendarInformationContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'calendar-information icon',
  ...props
}: PiCalendarInformationContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M3 13c0-1.245 0-2.212.04-3 .05-.982.163-1.684.417-2.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127C8.941 4 10.172 4 12 4s3.059 0 4 .128c.498.067.915.17 1.296.329a6 6 0 0 1 3.247 3.247c.254.612.367 1.314.417 2.296.04.788.04 1.755.04 3 0 2.796 0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 17.194 3 15.796 3 13Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2v2.128M8 6V4.128M16 2v2.128M16 6V4.128m0 0C15.059 4 13.828 4 12 4s-3.059 0-4 .128m8 0c.498.067.915.17 1.296.329a6 6 0 0 1 3.247 3.247C21 8.807 21 10.204 21 13s0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 17.194 3 15.796 3 13s0-4.193.457-5.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127m4 9.25v4M12 10z" fill="none"/>
    </svg>
  );
}
